# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured with Session Replay, Error Tracking, and Support enabled, plus health, error, and support signal sources. Two Replay Vision monitors and three active scouts will feed actionable findings into the [Self-driving inbox](https://us.posthog.com/project/628242/inbox); initial scout findings start appearing within about 30 minutes.

## AI data processing

Approved.

## GitHub

Connected before this setup began; no GitHub Issues responder was enabled because no connected tools were selected.

## Products enabled

| Product | Result | Notes |
|---|---|---|
| Session Replay | enabled | Server recording is enabled. This repo has no `posthog-js` client initialization, so browser recordings will not arrive until a client SDK integration is added. |
| Error Tracking | enabled | Server-side Error Tracking is enabled. No browser SDK initialization was found that could override exception capture. |
| Support (Conversations) | enabled | The ticket responder is enabled; Support needs an inbound email, inbox, or Slack channel before tickets can arrive. |

## Signal sources

| Source product | Source type | Action |
|---|---|---|
| `signals_scout` | `cross_source_issue` | On by default; no opt-out row was created. |
| `health_checks` | `health_issue` | Enabled (`01a11f50-cbb1-7c52-b214-2750f2661b72`). |
| `error_tracking` | `issue_created` | Enabled (`01a11f50-cb99-770e-af54-55664564dbef`). |
| `error_tracking` | `issue_reopened` | Enabled (`01a11f50-cc42-7f2b-aef3-9106dbe01e31`). |
| `error_tracking` | `issue_spiking` | Enabled (`01a11f50-cc48-774f-8e0a-2a9dea652549`). |
| `conversations` | `ticket` | Enabled (`01a11f50-cba4-706f-8f20-c1fee5180c48`). |
| `session_replay` | `session_analysis_cluster` | Deliberately skipped; Replay Vision scanners are the current route for replay findings. |
| `replay_vision` | scanner findings | Enabled by each scanner's `emits_signals: true` setting; no source row is needed. |

## Connected tools

No external tools were selected in the connected-tools prompt. No external data warehouse sources were detected, and no connected-tool responders were enabled.

## Scout troop

**Active scouts (3):**

| Scout | What it watches |
|---|---|
| General | Cross-product patterns and surfaces without a focused specialist. |
| AI observability | LLM trace cost, latency, errors, traffic, and evaluation regressions. |
| Omnichannel assistant health | Channel-specific assistant silence, error share, latency, and traffic-mix regressions. |

**Disabled scouts (26):**

| Scout | Reason |
|---|---|
| Anomaly detection | No established saved insights or dashboards to monitor yet. |
| APM | No distributed tracing evidence. |
| Conversations | Support is newly enabled and has no inbound channel yet. |
| CSP violations | No CSP reporting evidence. |
| Customer analytics | No account/group analytics evidence. |
| Data pipelines | No CDP or batch-pipeline evidence. |
| Data warehouse | No warehouse sources are connected. |
| Error tracking | Covered by the native Error Tracking sources. |
| Experiments | No active experiment evidence. |
| Feature flags | No active feature-flag evidence. |
| Inbox validation | Fresh setup with no resolved Self-driving reports to validate. |
| Insight alerts | No existing insight-alert evidence. |
| Logs | No PostHog Logs product evidence. |
| MCP tool calls | No evidence that the product exposes MCP telemetry. |
| Observability gaps | Not prioritized while the focused AI coverage is established. |
| PR follow-up | No Self-driving PR history to verify. |
| Product analytics | No client-side product funnel instrumentation was detected. |
| Replay vision | No historical Replay Vision observations yet; the two monitors are the replay route. |
| Revenue analytics | No payment or revenue source evidence. |
| Session replay | Covered by the Replay Vision monitors. |
| Skills store | No active skills-store maintenance surface was identified. |
| Surveys | No surveys were found. |
| Tasks | No PostHog Tasks evidence. |
| Web analytics | No client-side web analytics instrumentation was detected. |
| Web vitals | No web-vitals capture evidence. |
| Workflows | No workflow evidence. |

**Run budget:** 100 maximum runs/day; 0 used today; 100 remaining. Banner: “Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”

## Custom scouts

| Scout | Design |
|---|---|
| `signals-scout-omnichannel-assistant-health` | Watches website, Messenger, Instagram, and WhatsApp assistant health. Its discriminator is a channel-specific departure in volume share, error share, or latency while other assistant traffic remains healthy, preventing an aggregate AI metric from masking a single broken entry point. It complements rather than replaces the enabled AI observability scout. |

The contact-form delivery pipeline was considered but ruled out as a custom scout surface because this repo does not emit a corresponding PostHog event. The custom scout is enabled and runs daily by default. If it proves noisy, set its config’s `emit` value to `false` in PostHog to keep it in dry-run mode.

## Replay Vision scanners

A Replay Vision scanner is an LLM that watches individual session recordings on a schedule and pushes clear defects to the Self-driving inbox. It is the only component in this setup that spends Replay Vision quota. Scanner findings arrive at half weight and require corroboration before promotion into a report.

| Brief | Scanner | Status | Scope | Sampling | Estimate |
|---|---|---|---|---|---|
| Breakage monitor | Contact enquiry breakage | Created | Sessions visiting `/contact`, the website’s primary consultation-completion flow. | 0.5 | 0 observations/month; 0 credits/month from the seven-day sample. |
| Frustration monitor | Lead enquiry frustration | Created | Sessions containing `$rageclick`; no URL filter was added. | 1.0 | 0 observations/month; 0 credits/month from the seven-day sample. |

Replay Vision quota is 2,500 credits, with 2,500 remaining and no current usage. No recordings were found during setup, so both monitors are armed and will begin working when browser session recordings arrive. Rate the first monitor observations in PostHog with thumbs up/down and a short note to improve them over time.

## Follow-ups

- [ ] Add and initialize `posthog-js` in the browser application so Session Replay can capture website sessions and the two Replay Vision monitors have recordings to analyze.
- [ ] Connect an inbound Support channel (email, inbox, or Slack) in PostHog so Conversations tickets can reach the enabled responder.
- [ ] Reauthorize the PostHog MCP connection with `action:read` and `property_definition:read` scopes if you want schema-level verification of the custom scout’s channel markers.

## Files created or modified

| File | Change |
|---|---|
| `posthog-self-driving-report.md` | Created this setup record. |
| `.claude/skills/replay-vision-scanners-core/` | Installed shared scanner mechanics. |
| `.claude/skills/replay-vision-scanner-broken-experiences/` | Installed breakage-monitor brief. |
| `.claude/skills/replay-vision-scanner-user-frustration/` | Installed frustration-monitor brief. |

## What happens next

Fresh scouts are picked up by the coordinator within about 30 minutes and draw from the daily run budget. Findings cluster into reports in the [Self-driving inbox](https://us.posthog.com/project/628242/inbox), where immediately actionable items can start coding tasks.
