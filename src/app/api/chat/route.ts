/**
 * @file src/app/api/chat/route.ts
 * @description Web Chat API Route Handler (Google Gemini 2.5 Flash Bridge)
 *
 * This Next.js Route Handler powers the frontend floating conversational chatbot (`Chatbot.tsx`).
 * It acts as a secure server-side proxy between user web clients and Google's Gemini 2.5 Flash API.
 *
 * Security & Reliability Mechanics:
 * 1. API Key Protection:
 *    - The `GEMINI_API_KEY` is kept strictly on the server; client browsers never see credentials.
 * 2. Sliding Window Rate Limiting:
 *    - Limits anonymous web sessions to 15 queries per minute per IP address, preventing abuse.
 * 3. Gemini REST Payload Invariants:
 *    - Validates client message arrays and strips empty strings.
 *    - Enforces `contents[0].role === 'user'` (Gemini rejection rule).
 *    - Merges consecutive identical roles (`user` + `user`) to enforce strict turn alternation.
 *    - Trims trailing model messages so the prompt ends with a user turn for completion.
 * 4. LLM Observability:
 *    - Every web conversation records token metrics and latency in PostHog AI.
 */

import { NextResponse } from 'next/server';
import { captureAiGeneration, createAiSessionId, createAiTraceId } from '@/lib/posthog-ai';

/** Regular expression for validating client-provided session IDs */
const aiIdentifierPattern = /^[A-Za-z0-9\-_~.@()!':|]+$/;

/**
 * In-memory sliding window rate limiter state.
 * Maps IP address -> { request count, window expiration timestamp }
 */
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

/**
 * Validates request frequency against the configured rate limit.
 *
 * @param ip - Client IP address
 * @param limit - Maximum requests allowed per window (default: 15)
 * @param windowMs - Time window in milliseconds (default: 60,000ms / 1 min)
 * @returns boolean - True if throttled, false if permitted
 */
function isRateLimited(ip: string, limit = 15, windowMs = 60000): boolean {
  const now = Date.now();
  
  // Clean up expired entries when map grows beyond 1,000 entries
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.expiresAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || entry.expiresAt < now) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return false;
  }
  if (entry.count >= limit) {
    return true;
  }
  entry.count += 1;
  return false;
}

/**
 * Agency System Instructions
 * Defines Infriva's authority, services portfolio, and conversion goals.
 */
const AGENCY_SYSTEM_PROMPT = `You are the AI Assistant for Infriva Solutions, a premier digital architecture and engineering agency.
Infriva Solutions specializes in:
1. Custom CRM Systems: Bespoke automation architectures tailored to sales workflows, lead routing, and customer lifecycle management.
2. Web Dev & UI/UX Design: High-performance digital properties engineered on Next.js with cinematic spatial rhythm and conversion optimization.
3. Full-Stack SEO & GEO: Technical search engine optimization, AI generative engine optimization, and authority link-building.
4. Paid Advertising Management: Algorithmic media buying across Meta Ads and Google Ads with bi-weekly attribution reporting.
5. Retention Marketing: WhatsApp messaging flows, cart abandonment triggers, and repeat customer retention sequences.
6. Premium Content Creation: High-authority brand storytelling, editorial design, and multimedia distribution.

Guidelines:
- Tone: Professional, authoritative, minimalist, clear, and helpful.
- Assist users with questions about Infriva's service offerings, timelines, deliverables, and capabilities.
- When prospective clients show interest in initiating a project or requesting a quote, encourage them to submit an inquiry through the contact form at /contact or share their project details.`;

/**
 * POST Handler: Process Web Chatbot Conversations
 */
export async function POST(req: Request) {
  try {
    // 1. IP-based sliding window rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('x-real-ip') ||
                     '127.0.0.1';
                     
    if (isRateLimited(clientIp, 15, 60000)) {
      return NextResponse.json(
        { error: 'Too many messages. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    const { messages, sessionId } = await req.json();

    // 2. Validate input message payload
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in server environment.');
    }

    // Assign or validate unique conversation session identifier
    const aiSessionId = typeof sessionId === 'string' && aiIdentifierPattern.test(sessionId)
      ? sessionId
      : createAiSessionId('web-chat');
    const traceId = createAiTraceId();

    // 3. Normalize messages into Gemini content structure
    const rawContents: { role: 'user' | 'model'; parts: { text: string }[] }[] = messages
      .filter((msg: { role?: string; content?: string }) => typeof msg?.content === 'string' && msg.content.trim().length > 0)
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === 'bot' || msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content.trim() }]
      }));

    // INVARIANT 1: Gemini conversation must begin with a user turn
    while (rawContents.length > 0 && rawContents[0].role !== 'user') {
      rawContents.shift();
    }

    if (rawContents.length === 0) {
      return NextResponse.json({ error: 'At least one user message is required' }, { status: 400 });
    }

    // INVARIANT 2: Merge consecutive turns with identical roles to satisfy turn alternation
    const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    for (const item of rawContents) {
      const prev = contents[contents.length - 1];
      if (prev && prev.role === item.role) {
        prev.parts[0].text += `\n\n${item.parts[0].text}`;
      } else {
        contents.push({
          role: item.role,
          parts: [{ text: item.parts[0].text }]
        });
      }
    }

    // INVARIANT 3: Ensure the sequence terminates with a user turn to prompt a model answer
    while (contents.length > 0 && contents[contents.length - 1].role !== 'user') {
      contents.pop();
    }

    if (contents.length === 0) {
      return NextResponse.json({ error: 'At least one user message is required' }, { status: 400 });
    }

    // Map contents for PostHog AI telemetry input format
    const input = contents.map((msg) => ({
      role: msg.role === 'model' ? ('assistant' as const) : ('user' as const),
      content: msg.parts[0].text,
    }));
    const startedAt = Date.now();

    // 4. Dispatch request to Gemini 2.5 Flash REST endpoint
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: AGENCY_SYSTEM_PROMPT }]
          },
          contents: contents
        })
      }
    );

    const data = await response.json();

    // Handle upstream API failure
    if (!response.ok) {
      await captureAiGeneration({
        distinctId: aiSessionId,
        sessionId: aiSessionId,
        traceId,
        input,
        model: 'gemini-2.5-flash',
        provider: 'gemini',
        latencyMs: Date.now() - startedAt,
        isError: true,
        statusCode: response.status,
      });
      throw new Error(data.error?.message || 'Failed to generate content from Gemini API');
    }

    // Extract text output from candidates array
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Record successful generation in PostHog AI
    await captureAiGeneration({
      distinctId: aiSessionId,
      sessionId: aiSessionId,
      traceId,
      input,
      model: 'gemini-2.5-flash',
      provider: 'gemini',
      latencyMs: Date.now() - startedAt,
      output: text,
      inputTokens: data?.usageMetadata?.promptTokenCount,
      outputTokens: data?.usageMetadata?.candidatesTokenCount,
      statusCode: response.status,
    });

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
