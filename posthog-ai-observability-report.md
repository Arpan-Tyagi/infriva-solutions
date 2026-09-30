# PostHog AI Observability setup

## Status

AI Observability is **wired, but not yet verified with a live Gemini request**. The production build passed successfully with the new `posthog-node` dependency and all capture imports.

## Integration selected

- **Workflow:** `ai-observability-manual-capture`
- **Reason:** The project calls Gemini through the REST API rather than a vendor LLM SDK, so explicit `$ai_generation` capture is the appropriate integration.
- **Provider/model:** `gemini` / `gemini-flash-latest`
- **SDK:** `posthog-node`

## What changed

- Added `posthog-node` to the Node dependencies.
- Configured `POSTHOG_API_KEY` and `POSTHOG_HOST` in `.env.local` using the supplied PostHog project configuration.
- Added `src/lib/posthog-ai.ts`, which creates the server-side PostHog client and sends manual `$ai_generation` events containing model, provider, prompt/response, latency, Gemini token usage, HTTP status, and error state.
- Instrumented both Gemini REST call paths:
  - `src/app/api/chat/route.ts` for the website chatbot.
  - `src/lib/gemini.ts`, used by `src/app/api/meta/webhook/route.ts` for Messenger and WhatsApp.
- Replaced the chat route's direct Gemini credential use with the existing `GEMINI_API_KEY` environment variable.
- Added a browser-generated conversation ID to the website chat request. Each chat turn gets a new trace ID while sharing that conversation ID as its AI session ID.
- Uses a one-way SHA-256-derived identifier for Messenger and WhatsApp session/distinct IDs, rather than sending sender IDs or phone numbers to PostHog as ordinary event properties.
- Wrote the AI setup record at `.posthog-wizard-cache/.posthog-ai.json`.

## Trace model

| Flow | AI session | AI trace | Attribution |
| --- | --- | --- | --- |
| Website chatbot | One browser chat conversation | One trace per submitted message | Anonymous session-derived ID |
| Messenger webhook | Stable, hashed Messenger sender ID | One trace per inbound message | Stable hashed ID |
| WhatsApp webhook | Stable, hashed WhatsApp sender ID | One trace per inbound message | Stable hashed ID |

The application does not register Gemini tools, so no `$ai_span` tool events were added.

## Verify with a live request

1. Start the application with `npm run dev`.
2. Open the website and submit two messages through the **Infriva AI Assistant** chat widget.
3. In PostHog, open **AI Observability → Traces** and inspect the newest trace.
4. Confirm each submitted message produces one Gemini generation, and the two traces share one `$ai_session_id`.
5. Optionally send an inbound Messenger or WhatsApp message to the existing webhook; its generation should appear under a stable hashed conversation session.

No live Gemini request was made during setup because its provider credential was not used by this workflow.

## Privacy mode

- **Effective setting:** `privacyMode: false` in `src/lib/posthog-ai.ts`. This is the default behavior and means manually captured prompt and completion content is sent in `$ai_input` and `$ai_output_choices`.
- **When to change it:** Enable privacy mode before sending prompts or completions whose sensitive content must not be stored in PostHog.
- **How to change it:** Set `privacyMode: true` in the `new PostHog(...)` configuration in `src/lib/posthog-ai.ts`. For this manual-capture path, also remove or redact the `$ai_input` and `$ai_output_choices` payload fields in the helper when content must not be captured.
- **Effect:** SDK privacy mode excludes `$ai_input` and `$ai_output_choices` for SDK-captured events; manually supplied payloads must be handled explicitly. It does not remove previously ingested events.
- **Documentation:** [AI Observability privacy mode](https://posthog.com/docs/ai-observability/privacy-mode)

## Verification performed

`npm run build` completed successfully on 2026-09-25. No dashboards, existing PostHog initialization, identify calls, or product analytics captures were changed.
