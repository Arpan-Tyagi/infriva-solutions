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
import { AGENCY_SYSTEM_PROMPT } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

/** Regular expression for validating client-provided session IDs */
const aiIdentifierPattern = /^[A-Za-z0-9\-_~.@()!':|]+$/;


/**
 * POST Handler: Process Web Chatbot Conversations
 */
export async function POST(req: Request) {
  try {
    // 1. IP-based sliding window rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('x-real-ip') ||
                     '127.0.0.1';

    try {
      const nowTime = Date.now();
      const { data: rlData } = await supabase.from('rate_limits').select('*').eq('ip_or_sender_id', clientIp).single();
      
      if (rlData && new Date(rlData.reset_time).getTime() > nowTime) {
        if (rlData.count >= 15) {
          return NextResponse.json(
            { error: 'Too many messages. Please wait a moment before trying again.' },
            { status: 429 }
          );
        }
        await supabaseAdmin.from('rate_limits').update({ count: rlData.count + 1 }).eq('ip_or_sender_id', clientIp);
      } else {
        await supabaseAdmin.from('rate_limits').upsert({ ip_or_sender_id: clientIp, count: 1, reset_time: new Date(nowTime + 60000).toISOString() });
      }
    } catch (err) {
      console.warn('Rate limiter error, bypassing:', err);
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
            parts: [{ text: AGENCY_SYSTEM_PROMPT() }]
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
    return NextResponse.json({ error: 'Our digital concierge is currently unavailable. Please email us directly at info@infrivasolutions.com, and an architect will assist you shortly.' }, { status: 500 });
  }
}
