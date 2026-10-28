/**
 * @file src/inngest/client.ts
 * @description Inngest client for durable CRM background jobs (SLA timers,
 * rep notifications, follow-up reminders, enrichment, conversions, crons).
 *
 * Local development: run `npx inngest-cli@latest dev` next to `npm run dev`;
 * without INNGEST_EVENT_KEY the client talks to that local Dev Server.
 * Production: set INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY.
 */

import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'infriva-crm',
  isDev: process.env.NODE_ENV !== 'production' && !process.env.INNGEST_EVENT_KEY,
});
