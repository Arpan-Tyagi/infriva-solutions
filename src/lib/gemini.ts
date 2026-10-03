/**
 * @file src/lib/gemini.ts
 * @description Google Gemini 2.5 Flash Client & AI Conversation Engine
 *
 * This module provides the core natural language interface for Infriva Solutions.
 * It connects to Google's Gemini 2.5 Flash model (`gemini-2.5-flash:generateContent`)
 * to handle lead qualification, agency inquiries, and omnichannel conversational responses.
 *
 * Architectural Invariants & Mechanics:
 * 1. Gemini Turn Alternation:
 *    - The Gemini API strictly enforces that the conversation contents array begins with
 *      a `user` role (`contents[0].role === 'user'`).
 *    - Furthermore, turns must strictly alternate between `user` and `model`. Consecutive
 *      identical roles result in an HTTP 400 "Invalid turn alternation" error.
 *    - This module cleans and merges consecutive turns to guarantee compliant payloads.
 * 2. System Instructions:
 *    - System instructions are passed via the top-level `systemInstruction` object in the
 *      REST payload, rather than prepended as a fake user message, ensuring high fidelity.
 * 3. Telemetry & Observability:
 *    - Every invocation records execution latency, token counts (prompt & candidate),
 *      and session/trace identifiers into PostHog AI via `captureAiGeneration`.
 */

import { captureAiGeneration, createAiSessionId, createAiTraceId } from '@/lib/posthog-ai';

/**
 * Contextual metadata passed to correlate LLM traces across client sessions and analytics.
 */
type AiGenerationContext = {
  /** Unique session identifier (e.g. browser cookie or webhook PSID) */
  sessionId: string;
  /** Distributed trace ID for debugging specific call hierarchies */
  traceId: string;
  /** PostHog user identifier for session recording and user profiles */
  distinctId: string;
};

/**
 * Primary Agency System Prompt
 *
 * Defines Infriva Solutions' corporate persona, value propositions, service portfolio,
 * and conversational guidelines. Exported so Route Handlers can inspect or reuse it.
 */
export const AGENCY_SYSTEM_PROMPT = `You are the AI Assistant for Infriva Solutions, a premier digital architecture and engineering agency.
Infriva Solutions specializes in:
1. Custom CRM Systems: Bespoke automation architectures tailored to sales workflows, lead routing, and customer lifecycle management.
2. Web Dev & UI/UX Design: High-performance digital properties engineered on Next.js with cinematic spatial rhythm and conversion optimization.
3. Full-Stack SEO & GEO: Technical search engine optimization, AI generative engine optimization, and authority link-building.
4. Paid Advertising Management: Algorithmic media buying across Meta Ads and Google Ads with bi-weekly attribution reporting.
5. Retention Marketing: WhatsApp messaging flows, cart abandonment triggers, and repeat customer retention sequences.
6. Premium Content Creation: High-authority brand storytelling, editorial design, and multimedia distribution.
7. Social Media Management: Strategic brand positioning and community architecture.

Guidelines:
- Tone: Professional, authoritative, minimalist, clear, and helpful.
- Assist users with questions about Infriva's service offerings, timelines, deliverables, and capabilities.
- When prospective clients show interest in initiating a project or requesting a quote, encourage them to submit an inquiry through the contact form at /contact or share their project details.`;

/**
 * Executes a conversational query against the Google Gemini 2.5 Flash API.
 *
 * @param message - The latest message input by the user
 * @param isLead - When true, directs Gemini to prioritize lead qualification (collecting email/phone)
 * @param context - Optional PostHog tracing identifiers (sessionId, traceId, distinctId)
 * @param history - Prior conversational history turns to provide multi-turn context memory
 *
 * @returns The generated response string from Gemini
 * @throws Error if GEMINI_API_KEY is not configured or the Google API returns an HTTP error
 */
export async function generateContent(
  message: string,
  isLead: boolean = false,
  context?: AiGenerationContext,
  history?: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  // Append lead-capture directive if context suggests an inbound marketing or ad lead
  const leadContext = isLead
    ? "\n\nContext: The user originated from an ad or lead form. Actively focus on qualifying them and capturing their email/phone for a strategic roadmap consultation."
    : "\n\nContext: Guide the user through Infriva's engineering capabilities and suggest booking a consultation at /contact.";
  const systemInstruction = `${AGENCY_SYSTEM_PROMPT}${leadContext}`;

  // Establish unique telemetry identifiers for PostHog AI tracking
  const traceId = context?.traceId ?? createAiTraceId();
  const sessionId = context?.sessionId ?? createAiSessionId('gemini');
  const distinctId = context?.distinctId ?? sessionId;

  // Build the raw conversation history array
  const rawContents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
  if (Array.isArray(history) && history.length > 0) {
    rawContents.push(...history);
  }
  rawContents.push({
    role: "user",
    parts: [{ text: message }]
  });

  // INVARIANT 1: Gemini requires the conversation array to begin with a 'user' turn.
  // Strip any leading 'model' turns that may have been loaded from prior logs.
  while (rawContents.length > 0 && rawContents[0].role !== 'user') {
    rawContents.shift();
  }

  // INVARIANT 2: Gemini requires strictly alternating turns ('user' -> 'model' -> 'user').
  // If consecutive turns have identical roles, merge their text parts into a single turn.
  const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
  for (const turn of rawContents) {
    if (contents.length > 0 && contents[contents.length - 1].role === turn.role) {
      contents[contents.length - 1].parts[0].text += `\n${turn.parts[0].text}`;
    } else {
      contents.push({ role: turn.role, parts: [{ text: turn.parts[0].text }] });
    }
  }

  // Prepare normalized message history for PostHog AI trace schema
  const input = [
    { role: 'system' as const, content: systemInstruction },
    ...contents.map(c => ({
      role: (c.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: c.parts.map(p => p.text).join('\n')
    })),
  ];

  const startedAt = Date.now();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // Execute HTTP request to Gemini REST API
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents
    }),
  });

  // Handle API failure states
  if (!response.ok) {
    const errorText = await response.text();
    // Record failed generation to PostHog for real-time observability and alerting
    await captureAiGeneration({
      distinctId,
      sessionId,
      traceId,
      input,
      model: 'gemini-1.5-flash',
      provider: 'gemini',
      latencyMs: Date.now() - startedAt,
      isError: true,
      statusCode: response.status,
    });
    console.error("Gemini API Error:", errorText);
    throw new Error(`Failed to generate content from Gemini API [Status: ${response.status}].`);
  }

  // Parse candidate completion text
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";

  // Record successful LLM generation with token counts and latency metrics
  await captureAiGeneration({
    distinctId,
    sessionId,
    traceId,
    input,
    model: 'gemini-1.5-flash',
    provider: 'gemini',
    latencyMs: Date.now() - startedAt,
    output: text,
    inputTokens: data?.usageMetadata?.promptTokenCount,
    outputTokens: data?.usageMetadata?.candidatesTokenCount,
    statusCode: response.status,
  });

  return text;
}
