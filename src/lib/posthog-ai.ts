/**
 * @file src/lib/posthog-ai.ts
 * @description PostHog LLM Observability & AI Telemetry Engine
 *
 * This module captures structured generation telemetry for all AI interactions
 * across the Infriva website and omnichannel messaging pipelines (Gemini 2.5 Flash).
 *
 * Why LLM Observability Matters:
 * 1. Performance & Latency: Tracks Time To First Token (TTFT) and total generation time in seconds.
 * 2. Token Cost & Economics: Monitors prompt token and candidate token consumption per turn.
 * 3. Quality & Drift: Captures prompt inputs and candidate outputs for auditing responses.
 * 4. Error Diagnostics: Captures failed generation attempts, HTTP status codes, and timeouts.
 *
 * PostHog AI Event Specification:
 * - Event name: `$ai_generation`
 * - Standardized properties:
 *   - `$ai_trace_id`: Distributed trace identifier across spans
 *   - `$ai_session_id`: Unique conversational thread identifier
 *   - `$ai_model`: Model identifier (e.g., 'gemini-2.5-flash')
 *   - `$ai_provider`: Cloud AI provider ('gemini')
 *   - `$ai_latency`: Duration of generation in seconds
 *   - `$ai_input`: Array of normalized `{ role, content }` message turns
 *   - `$ai_output_choices`: Array of generated choice responses
 *   - `$ai_input_tokens` / `$ai_output_tokens`: Token consumption metrics
 */

import { createHash, randomUUID } from 'node:crypto';
import { PostHog } from 'posthog-node';

/**
 * Normalized representation of a chat message turn for PostHog AI traces.
 */
type AiMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

/**
 * Payload interface required to capture an AI generation event.
 */
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

// Retrieve PostHog configuration from environment variables
const posthogApiKey = process.env.POSTHOG_API_KEY;
const posthogHost = process.env.POSTHOG_HOST;

// In local development, warn if PostHog keys are missing rather than throwing fatal runtime errors
if (!posthogApiKey && process.env.NODE_ENV === 'development') {
  console.warn('POSTHOG_API_KEY variable is missing or un-configured; PostHog AI analytics events will be skipped.');
}

if (!posthogHost && process.env.NODE_ENV === 'development') {
  console.warn('POSTHOG_HOST variable is missing or un-configured; PostHog AI analytics events will be skipped.');
}

/**
 * Singleton PostHog Node.js client.
 * If credentials are missing, initializes to null and quietly bypasses capture calls.
 */
const posthog = posthogApiKey && posthogHost
  ? new PostHog(posthogApiKey, { host: posthogHost, privacyMode: false })
  : null;

/**
 * Generates a cryptographically random UUID v4 to serve as a distributed trace ID.
 * Used to link individual spans and model generations within a single operational flow.
 */
export function createAiTraceId(): string {
  return randomUUID();
}

/**
 * Generates or derives a deterministic AI session identifier.
 *
 * If a `stableIdentifier` is provided (e.g., a Meta PSID or authenticated user ID),
 * this function creates a deterministic SHA-256 hash so that all conversations from that
 * specific user map to a consistent PostHog session thread.
 *
 * @param scope - Prefix describing the origin context (e.g., 'gemini', 'meta-messenger')
 * @param stableIdentifier - (Optional) Persistent user ID to hash deterministically
 * @returns Formatted session ID string
 */
export function createAiSessionId(scope: string, stableIdentifier?: string): string {
  if (!stableIdentifier) {
    return `${scope}-${randomUUID()}`;
  }

  const identifierHash = createHash('sha256').update(stableIdentifier).digest('hex');
  return `${scope}-${identifierHash}`;
}

/**
 * Records an AI generation event to PostHog using the official `$ai_generation` schema.
 *
 * @param event - Generation details including token counts, latency, and messages
 */
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
  // If PostHog client is not configured, exit early without crashing the application
  if (!posthog) {
    return;
  }

  // Dispatch standardized PostHog AI event
  posthog.capture({
    distinctId,
    event: '$ai_generation',
    properties: {
      $ai_trace_id: traceId,
      $ai_session_id: sessionId,
      $ai_model: model,
      $ai_provider: provider,
      $ai_input: input,
      // PostHog AI expects latency formatted in fractional seconds
      $ai_latency: latencyMs / 1000,
      ...(output ? { $ai_output_choices: [{ role: 'assistant', content: output }] } : {}),
      ...(typeof inputTokens === 'number' ? { $ai_input_tokens: inputTokens } : {}),
      ...(typeof outputTokens === 'number' ? { $ai_output_tokens: outputTokens } : {}),
      ...(isError ? { $ai_is_error: true } : {}),
      ...(typeof statusCode === 'number' ? { $ai_http_status: statusCode } : {}),
    },
  });

  // Explicitly flush the PostHog event buffer to ensure delivery in serverless runtimes
  posthog.flush();
}
