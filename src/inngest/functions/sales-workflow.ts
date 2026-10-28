/**
 * @file src/inngest/functions/sales-workflow.ts
 * @description Quote approval alerts, follow-up reminders and closed-loop conversions.
 *
 * Events (sent by the Sales server actions in src/app/dashboard/sales/actions.ts):
 *   crm/quote.submitted     { quotationId }               → alert every active MD
 *   crm/quote.reviewed      { quotationId }               → alert the rep who built it
 *   crm/follow_up.scheduled { reminderId, scheduledAt }   → remind the rep at the time
 *   crm/lead.stage_changed  { leadId, to }                → Meta CAPI on QUALIFIED / WON
 */

import { inngest } from '@/inngest/client';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendTeamAlert, crmLink } from '@/lib/notify';
import { dispatchClosedLoopConversion } from '@/lib/conversions';
import { describeLead, formatInr, loadActiveExecutives, loadLead, loadProfile, logSystemActivity } from '@/inngest/crm-data';

async function loadQuote(quotationId: string) {
  const { data, error } = await supabaseAdmin
    .from('quotations')
    .select('id, lead_id, created_by, quote_number, title, status, total_inr, review_note, reviewed_by')
    .eq('id', quotationId)
    .maybeSingle();
  if (error) throw new Error(`loadQuote: ${error.message}`);
  return data;
}

export const quoteSubmitted = inngest.createFunction(
  { id: 'crm-quote-submitted', triggers: [{ event: 'crm/quote.submitted' }], retries: 3 },
  async ({ event, step }) => {
    const { quotationId } = event.data as { quotationId: string };
    return step.run('alert-approvers', async () => {
      const quote = await loadQuote(quotationId);
      if (!quote || quote.status !== 'PENDING_APPROVAL') return { skipped: 'no longer pending' };
      const lead = await loadLead(quote.lead_id);
      const rep = await loadProfile(quote.created_by);
      const executives = await loadActiveExecutives();
      for (const md of executives) {
        await sendTeamAlert(md, {
          subject: `Approve quote ${quote.quote_number} — ${formatInr(quote.total_inr)}`,
          text: `${rep?.full_name || 'A rep'} needs approval for ${quote.quote_number} (${formatInr(quote.total_inr)} incl. GST) for ${lead ? describeLead(lead) : 'a lead'}.`,
          link: crmLink(`/dashboard/sales?lead=${quote.lead_id}&tab=quotes`),
        });
      }
      return { notified: executives.length };
    });
  }
);

export const quoteReviewed = inngest.createFunction(
  { id: 'crm-quote-reviewed', triggers: [{ event: 'crm/quote.reviewed' }], retries: 3 },
  async ({ event, step }) => {
    const { quotationId } = event.data as { quotationId: string };
    return step.run('alert-rep', async () => {
      const quote = await loadQuote(quotationId);
      if (!quote || !['APPROVED', 'CHANGES_REQUESTED'].includes(quote.status)) return { skipped: true };
      const rep = await loadProfile(quote.created_by);
      if (!rep) return { skipped: 'creator missing' };
      const approved = quote.status === 'APPROVED';
      await sendTeamAlert(rep, {
        subject: `Quote ${quote.quote_number} ${approved ? 'approved ✅' : 'needs changes'}`,
        text: approved
          ? `${quote.quote_number} (${formatInr(quote.total_inr)}) is approved — share it with the client.`
          : `${quote.quote_number} needs changes${quote.review_note ? `: ${quote.review_note}` : '.'}`,
        link: crmLink(`/dashboard/sales?lead=${quote.lead_id}&tab=quotes`),
      });
      return { notified: rep.id };
    });
  }
);

export const followUpReminder = inngest.createFunction(
  { id: 'crm-follow-up-reminder', triggers: [{ event: 'crm/follow_up.scheduled' }], retries: 3 },
  async ({ event, step }) => {
    const { reminderId, scheduledAt } = event.data as { reminderId: string; scheduledAt: string };

    await step.sleepUntil('wait-until-follow-up', new Date(scheduledAt));

    return step.run('remind-rep', async () => {
      const { data: reminder } = await supabaseAdmin
        .from('follow_up_reminders')
        .select('id, lead_id, rep_id, scheduled_at, status, message_note')
        .eq('id', reminderId)
        .maybeSingle();

      // Rescheduled (a newer event owns it), completed or cancelled meanwhile.
      if (!reminder || reminder.status !== 'PENDING') return { skipped: 'not pending' };
      if (new Date(reminder.scheduled_at).getTime() !== new Date(scheduledAt).getTime()) {
        return { skipped: 'rescheduled' };
      }

      const lead = await loadLead(reminder.lead_id);
      const rep = await loadProfile(reminder.rep_id);
      if (!lead || !rep) return { skipped: 'lead or rep missing' };

      const result = await sendTeamAlert(rep, {
        subject: `Follow up now: ${lead.full_name}`,
        text: `Follow-up due with ${describeLead(lead)}${reminder.message_note ? ` — ${reminder.message_note}` : ''}.`,
        link: crmLink(`/dashboard/sales?lead=${lead.id}`),
      });

      await supabaseAdmin.from('follow_up_reminders').update({ status: 'DISPATCHED' }).eq('id', reminder.id);
      await logSystemActivity(lead.id, `Follow-up reminder sent (WhatsApp: ${result.whatsapp}, email: ${result.email})`, {
        reminder_id: reminder.id,
      });
      return result;
    });
  }
);

export const leadStageChanged = inngest.createFunction(
  { id: 'crm-lead-stage-changed', triggers: [{ event: 'crm/lead.stage_changed' }], retries: 3 },
  async ({ event, step }) => {
    const { leadId, to } = event.data as { leadId: string; to: string };
    if (to !== 'QUALIFIED' && to !== 'WON') return { skipped: `no conversion for ${to}` };

    return step.run('send-conversion', async () => {
      const lead = await loadLead(leadId);
      if (!lead) return { skipped: 'lead missing' };

      let valueInr: number | undefined;
      if (to === 'WON') {
        const { data: quote } = await supabaseAdmin
          .from('quotations')
          .select('total_inr')
          .eq('lead_id', leadId)
          .eq('status', 'ACCEPTED')
          .order('accepted_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        valueInr = quote ? Number(quote.total_inr) : undefined;
      }

      const result = await dispatchClosedLoopConversion({
        eventName: to === 'WON' ? 'Purchase' : 'QualifiedLead',
        leadId,
        email: lead.email,
        phone_e164: lead.phone_e164,
        leadgen_id: lead.leadgen_id || undefined,
        gclid: (lead.attribution_touch?.gclid as string | undefined) || undefined,
        valueInr,
      });

      await logSystemActivity(leadId, `Conversion feedback (${to}): Meta ${result.meta.success ? 'sent' : 'not sent'}`, {
        meta: result.meta,
        google: result.googleOffline,
      });
      return result;
    });
  }
);
