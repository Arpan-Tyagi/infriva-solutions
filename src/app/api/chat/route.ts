import { NextResponse } from 'next/server';
import { captureAiGeneration, createAiSessionId, createAiTraceId } from '@/lib/posthog-ai';

const aiIdentifierPattern = /^[A-Za-z0-9\-_~.@()!':|]+$/;

// In-memory sliding window rate limiter
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(ip: string, limit = 15, windowMs = 60000): boolean {
  const now = Date.now();
  // Clean up old entries periodically
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

export async function POST(req: Request) {
  try {
    // 1. IP Sliding-window rate limit
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

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }

    const aiSessionId = typeof sessionId === 'string' && aiIdentifierPattern.test(sessionId)
      ? sessionId
      : createAiSessionId('web-chat');
    const traceId = createAiTraceId();

    // Map messages to Gemini format and sanitize
    const rawContents: { role: 'user' | 'model'; parts: { text: string }[] }[] = messages
      .filter((msg: { role?: string; content?: string }) => typeof msg?.content === 'string' && msg.content.trim().length > 0)
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === 'bot' || msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content.trim() }]
      }));

    // Enforce Gemini invariant: contents[0].role === 'user'
    while (rawContents.length > 0 && rawContents[0].role !== 'user') {
      rawContents.shift();
    }

    if (rawContents.length === 0) {
      return NextResponse.json({ error: 'At least one user message is required' }, { status: 400 });
    }

    // Merge consecutive turns with the same role so turns alternate strictly: user -> model -> user
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

    // Ensure the conversation ends on a user turn so Gemini generates the assistant reply
    while (contents.length > 0 && contents[contents.length - 1].role !== 'user') {
      contents.pop();
    }

    if (contents.length === 0) {
      return NextResponse.json({ error: 'At least one user message is required' }, { status: 400 });
    }

    const input = contents.map((msg) => ({
      role: msg.role === 'model' ? ('assistant' as const) : ('user' as const),
      content: msg.parts[0].text,
    }));
    const startedAt = Date.now();

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
      throw new Error(data.error?.message || 'Failed to generate content');
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

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
