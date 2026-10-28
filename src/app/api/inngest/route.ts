/**
 * @file src/app/api/inngest/route.ts
 * @description Inngest serve endpoint; Inngest calls this to run CRM background jobs.
 * Requests are signature-verified with INNGEST_SIGNING_KEY outside dev mode.
 */

import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { functions } from '@/inngest/functions';

export const { GET, POST, PUT } = serve({ client: inngest, functions });

// Steps such as enrichment and Meta reconciliation can take a while.
export const maxDuration = 300;
