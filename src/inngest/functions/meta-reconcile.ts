/**
 * @file src/inngest/functions/meta-reconcile.ts
 * @description Daily 06:00 IST sweep of Meta lead forms to ingest any lead the
 * webhook missed. Configure META_LEAD_FORM_IDS as a comma-separated list.
 */

import { inngest } from '@/inngest/client';
import { reconcileMetaFormLeads } from '@/lib/meta-leads';

export const metaLeadsReconcile = inngest.createFunction(
  { id: 'crm-meta-leads-reconcile', triggers: [{ cron: 'TZ=Asia/Kolkata 0 6 * * *' }] },
  async ({ step }) => {
    const formIds = (process.env.META_LEAD_FORM_IDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!formIds.length || !process.env.META_ACCESS_TOKEN) {
      return { skipped: 'META_LEAD_FORM_IDS or META_ACCESS_TOKEN not configured' };
    }

    const results = [];
    for (const formId of formIds) {
      results.push(await step.run(`reconcile-${formId}`, () => reconcileMetaFormLeads(formId, 2)));
    }
    return results;
  }
);
