import { createHash, randomUUID } from 'node:crypto';
import { PostHog } from 'posthog-node';

type AiMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type AiGeneration = {
  distinctId: string;
  sessionId: string;
  traceId: string;
  input: AiMessage[];
  model: string;
  provider: string;
  latencyMs: number;
  output?: string;
  inputTokens?: number;
  outputTokens?: number;
  isError?: boolean;
  statusCode?: number;
};

const posthogApiKey = process.env.POSTHOG_API_KEY;
const posthogHost = process.env.POSTHOG_HOST;

if (!posthogApiKey && process.env.NODE_ENV === 'development') {
  console.warn('POSTHOG_API_KEY variable is missing or un-configured; PostHog AI analytics events will be skipped.');
}

if (!posthogHost && process.env.NODE_ENV === 'development') {
  console.warn('POSTHOG_HOST variable is missing or un-configured; PostHog AI analytics events will be skipped.');
}

const posthog = posthogApiKey && posthogHost
  ? new PostHog(posthogApiKey, { host: posthogHost, privacyMode: false })
  : null;

export function createAiTraceId(): string {
  return randomUUID();
}

export function createAiSessionId(scope: string, stableIdentifier?: string): string {
  if (!stableIdentifier) {
    return `${scope}-${randomUUID()}`;
  }

  const identifierHash = createHash('sha256').update(stableIdentifier).digest('hex');
  return `${scope}-${identifierHash}`;
}

export async function captureAiGeneration({
  distinctId,
  sessionId,
  traceId,
  input,
  model,
  provider,
  latencyMs,
  output,
  inputTokens,
  outputTokens,
  isError,
  statusCode,
}: AiGeneration): Promise<void> {
  if (!posthog) {
    return;
  }

  posthog.capture({
    distinctId,
    event: '$ai_generation',
    properties: {
      $ai_trace_id: traceId,
      $ai_session_id: sessionId,
      $ai_model: model,
      $ai_provider: provider,
      $ai_input: input,
      $ai_latency: latencyMs / 1000,
      ...(output ? { $ai_output_choices: [{ role: 'assistant', content: output }] } : {}),
      ...(typeof inputTokens === 'number' ? { $ai_input_tokens: inputTokens } : {}),
      ...(typeof outputTokens === 'number' ? { $ai_output_tokens: outputTokens } : {}),
      ...(isError ? { $ai_is_error: true } : {}),
      ...(typeof statusCode === 'number' ? { $ai_http_status: statusCode } : {}),
    },
  });

  await posthog.flush();
}
