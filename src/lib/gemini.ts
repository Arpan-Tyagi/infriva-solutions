import { captureAiGeneration, createAiSessionId, createAiTraceId } from '@/lib/posthog-ai';

type AiGenerationContext = {
  sessionId: string;
  traceId: string;
  distinctId: string;
};

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

export async function generateContent(
  message: string,
  isLead: boolean = false,
  context?: AiGenerationContext,
  history?: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const leadContext = isLead
    ? "\n\nContext: The user originated from an ad or lead form. Actively focus on qualifying them and capturing their email/phone for a strategic roadmap consultation."
    : "\n\nContext: Guide the user through Infriva's engineering capabilities and suggest booking a consultation at /contact.";
  const systemInstruction = `${AGENCY_SYSTEM_PROMPT}${leadContext}`;

  const traceId = context?.traceId ?? createAiTraceId();
  const sessionId = context?.sessionId ?? createAiSessionId('gemini');
  const distinctId = context?.distinctId ?? sessionId;

  const rawContents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
  if (Array.isArray(history) && history.length > 0) {
    rawContents.push(...history);
  }
  rawContents.push({
    role: "user",
    parts: [{ text: message }]
  });

  // Enforce turn alternation: first turn must be 'user', merge consecutive turns of identical role
  while (rawContents.length > 0 && rawContents[0].role !== 'user') {
    rawContents.shift();
  }

  const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
  for (const turn of rawContents) {
    if (contents.length > 0 && contents[contents.length - 1].role === turn.role) {
      contents[contents.length - 1].parts[0].text += `\n${turn.parts[0].text}`;
    } else {
      contents.push({ role: turn.role, parts: [{ text: turn.parts[0].text }] });
    }
  }

  const input = [
    { role: 'system' as const, content: systemInstruction },
    ...contents.map(c => ({
      role: (c.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: c.parts.map(p => p.text).join('\n')
    })),
  ];
  const startedAt = Date.now();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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

  if (!response.ok) {
    const errorText = await response.text();
    await captureAiGeneration({
      distinctId,
      sessionId,
      traceId,
      input,
      model: 'gemini-2.5-flash',
      provider: 'gemini',
      latencyMs: Date.now() - startedAt,
      isError: true,
      statusCode: response.status,
    });
    console.error("Gemini API Error:", errorText);
    throw new Error("Failed to generate content from Gemini API.");
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";

  await captureAiGeneration({
    distinctId,
    sessionId,
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

  return text;
}
