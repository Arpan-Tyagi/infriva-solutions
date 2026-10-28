/**
 * @file src/inngest/functions/lead-received.ts
 * @description Runs for every inbound lead (`crm/lead.received`):
 *   1. Alerts the assigned rep on WhatsApp + email (or the MD if nobody is assigned)
 *   2. Starts FullEnrich waterfall enrichment for brand-new leads
 *   3. Sleeps until the 5-minute first-response deadline; if nobody has dialled
 *      or replied by then, flags the SLA breach and escalates to rep + MD.
 */

import { inngest } from '@/inngest/client';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendTeamAlert, crmLink } from '@/lib/notify';
import { triggerFullEnrichBatch } from '@/lib/enrichment';
import { describeLead, loadActiveExecutives, loadLead, loadProfile, logSystemActivity } from '@/inngest/crm-data';

type LeadReceivedData = { leadId: string; isNew: boolean; reopened: boolean; channel: string };

/** Atomically flags a breach; only the caller that flips the flag escalates. */
export async function flagSlaBreach(leadId: string) {
  const { data, error } = await supabaseAdmin
    .from('leads')
    .update({ sla_breached: true })
    .eq('id', leadId)
    .eq('stage', 'NEW')
    .eq('sla_breached', false)
    .is('first_responded_at', null)
    .select('id')
    .maybeSingle();
  if (error) throw new Error(`flagSlaBreach: ${error.message}`);
  return Boolean(data);
}

export async function escalateSlaBreach(leadId: string) {
  const lead = await loadLead(leadId);
  if (!lead) return { escalated: 0 };
  const rep = await loadProfile(lead.assigned_rep_id);
  const executives = await loadActiveExecutives();
  const text = `SLA breached: ${describeLead(lead)} has had no response for 5+ minutes${rep ? ` (owner: ${rep.full_name})` : ' (unassigned)'}.`;
  const link = crmLink(`/dashboard/sales?lead=${lead.id}`);

  const recipients = [rep, ...executives].filter(
    (r, i, all): r is NonNullable<typeof r> => Boolean(r) && all.findIndex((x) => x?.id === r!.id) === i
  );
  for (const r of recipients) {
    await sendTeamAlert(r, { subject: `⚠️ Lead SLA breached — ${lead.full_name}`, text, link });
  }
  await logSystemActivity(lead.id, 'First-response SLA breached — escalated to owner and MD', {
    notified: recipients.map((r) => r.id),
  });
  return { escalated: recipients.length };
}

export const leadReceived = inngest.createFunction(
  { id: 'crm-lead-received', triggers: [{ event: 'crm/lead.received' }], retries: 3 },
  async ({ event, step }) => {
    const { leadId, isNew, reopened } = event.data as LeadReceivedData;

    const lead = await step.run('load-lead', () => loadLead(leadId));
    if (!lead) return { skipped: 'lead not found' };

    await step.run('alert-owner', async () => {
      const link = crmLink(`/dashboard/sales?lead=${lead.id}`);
      const prefix = isNew ? 'New lead' : reopened ? 'Lost lead is back' : 'Repeat enquiry';
      const clientFlag = lead.is_existing_client ? ' [existing client]' : '';
      const rep = await loadProfile(lead.assigned_rep_id);

      if (rep) {
        const result = await sendTeamAlert(rep, {
          subject: `${prefix}: ${lead.full_name}${clientFlag}`,
          text: `${prefix}${clientFlag}: ${describeLead(lead)}. Call within 5 minutes.`,
          link,
        });
        await logSystemActivity(lead.id, `Owner alerted (WhatsApp: ${result.whatsapp}, email: ${result.email})`, { ...result });
        return result;
      }

      // Nobody to route to (no active reps) — the MD decides.
      const executives = await loadActiveExecutives();
      for (const md of executives) {
        await sendTeamAlert(md, {
          subject: `Unassigned lead: ${lead.full_name}`,
          text: `${prefix}${clientFlag} with no active sales rep to assign: ${describeLead(lead)}.`,
          link,
        });
      }
      await logSystemActivity(lead.id, 'No active sales rep — MD alerted to assign manually');
      return { unassigned: true };
    });

    if (!isNew && !reopened) return { alerted: true };

    if (isNew && process.env.FULLENRICH_API_KEY && (lead.email || lead.company_name || lead.linkedin_url)) {
      await step.run('start-enrichment', () =>
        triggerFullEnrichBatch([
          {
            id: lead.id,
            full_name: lead.full_name,
            email: lead.email,
            company_name: lead.company_name,
            linkedin_url: lead.linkedin_url,
          },
        ])
      );
    }

    if (!lead.sla_first_response_due_at || lead.first_responded_at) return { slaWatched: false };

    await step.sleepUntil('wait-for-first-response-deadline', new Date(lead.sla_first_response_due_at));

    const breached = await step.run('check-first-response', () => flagSlaBreach(lead.id));
    if (!breached) return { slaMet: true };

    await step.run('escalate-breach', () => escalateSlaBreach(lead.id));
    return { slaMet: false };
  }
);

/**
 * Safety net for leads whose `crm/lead.received` event never ran
 * (e.g. Inngest unreachable at intake time).
 */
export const slaSweeper = inngest.createFunction(
  { id: 'crm-sla-sweeper', triggers: [{ cron: '*/5 * * * *' }] },
  async ({ step }) => {
    const overdue = await step.run('find-overdue', async () => {
      const { data, error } = await supabaseAdmin
        .from('leads')
        .select('id')
        .eq('stage', 'NEW')
        .eq('sla_breached', false)
        .is('first_responded_at', null)
        // Give the per-lead job a minute to act first.
        .lt('sla_first_response_due_at', new Date(Date.now() - 60_000).toISOString())
        .limit(50);
      if (error) throw new Error(error.message);
      return (data || []).map((r) => r.id as string);
    });

    let escalated = 0;
    for (const id of overdue) {
      const flipped = await step.run(`flag-${id}`, () => flagSlaBreach(id));
      if (flipped) {
        await step.run(`escalate-${id}`, () => escalateSlaBreach(id));
        escalated++;
      }
    }
    return { checked: overdue.length, escalated };
  }
);
