'use server';

/**
 * Sales & RevOps server actions.
 *
 * Every mutation re-checks the session and role, then writes through the
 * user's own RLS-scoped Supabase client so database policies and triggers
 * (round-robin, SLA, quote approval rules, WON provisioning) apply with the
 * real identity. Background follow-ups are queued as Inngest events.
 */

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase-server';
import { assertViewer, CrmAuthError, type Viewer } from '@/lib/crm-auth';
import { TEST_PERSONAS_ENABLED } from '@/lib/crm-roles';
import { ingestLead } from '@/lib/lead-intake';
import { isExotelConfigured, signCallLogId, startExotelCall } from '@/lib/exotel';
import { crmLink } from '@/lib/notify';
import { inngest } from '@/inngest/client';
import type { LeadStage } from '@/types/crm';
import { CALL_OUTCOMES, type ActionResult, type CallOutcome, type QuoteLineItem } from './types';

const SALES_ROLES = ['SALES_REP', 'MD_CEO'] as const;
const SALES_PATH = '/dashboard/sales';

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function run<T>(
  roles: readonly Viewer['role'][],
  fn: (ctx: { viewer: Viewer; supabase: Supabase }) => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  try {
    const viewer = await assertViewer([...roles]);
    const supabase = await createClient();
    return await fn({ viewer, supabase });
  } catch (err) {
    if (err instanceof CrmAuthError) return { ok: false, error: err.message };
    console.error('[sales action]', err);
    return { ok: false, error: (err as Error).message || 'Something went wrong.' };
  }
}

/** Postgres trigger/RLS errors carry a readable message; surface it. */
function dbError(error: { message: string; code?: string } | null, fallback: string): ActionResult<never> {
  if (!error) return { ok: false, error: fallback };
  if (error.code === '42501' || /row-level security/.test(error.message)) {
    return { ok: false, error: error.message.includes('row-level security') ? 'You do not have permission to do that.' : error.message };
  }
  return { ok: false, error: error.message || fallback };
}

async function emit(name: string, data: Record<string, unknown>) {
  try {
    await inngest.send({ name, data });
  } catch (err) {
    console.error(`[sales action] Could not emit ${name}:`, err);
  }
}

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

export async function startCallAction(leadId: string): Promise<ActionResult<{ callLogId: string }>> {
  return run<{ callLogId: string }>(SALES_ROLES, async ({ viewer, supabase }) => {
    if (!isExotelConfigured()) {
      return { ok: false, error: 'Exotel is not set up yet — use “Dial directly” and log the outcome.' };
    }
    if (!viewer.phoneE164) {
      return { ok: false, error: 'Add your mobile number to your profile so Exotel can ring you first.' };
    }

    const { data: lead, error } = await supabase.from('leads').select('id, phone_e164').eq('id', leadId).maybeSingle();
    if (error || !lead) return dbError(error, 'Lead not found.');
    if (!lead.phone_e164) return { ok: false, error: 'This lead has no valid Indian mobile number.' };

    // The id is fixed before dialling so the signed callback URL can reference it.
    const callLogId = crypto.randomUUID();
    const callbackUrl = crmLink(
      `/api/webhooks/exotel/call-status?call_log_id=${callLogId}&sig=${signCallLogId(callLogId)}`
    );
    const call = await startExotelCall({
      agentPhoneE164: viewer.phoneE164,
      leadPhoneE164: lead.phone_e164,
      statusCallbackUrl: callbackUrl,
    });

    const { error: logError } = await supabase.from('sales_call_logs').insert({
      id: callLogId,
      lead_id: leadId,
      rep_id: viewer.id,
      call_sid: call.callSid,
      call_status: call.status,
      provider: 'EXOTEL',
    });
    if (logError) return dbError(logError, 'Call started but could not be logged.');

    revalidatePath(SALES_PATH);
    return { ok: true, data: { callLogId }, message: 'Exotel is ringing your phone — pick up to connect.' };
  });
}

export async function logDirectCallAction(input: {
  leadId: string;
  outcome: CallOutcome;
  notes?: string;
}): Promise<ActionResult> {
  return run(SALES_ROLES, async ({ viewer, supabase }) => {
    const outcome = CALL_OUTCOMES.find((o) => o.value === input.outcome);
    if (!outcome) return { ok: false, error: 'Pick a call outcome.' };

    const { error } = await supabase.from('sales_call_logs').insert({
      lead_id: input.leadId,
      rep_id: viewer.id,
      call_status: outcome.connected ? 'completed' : input.outcome.toLowerCase(),
      outcome: input.outcome,
      rep_notes: input.notes?.trim() || null,
      provider: 'MANUAL',
    });
    if (error) return dbError(error, 'Could not log the call.');

    await afterOutcome(supabase, viewer, input.leadId, outcome.connected, input.outcome, input.notes);
    revalidatePath(SALES_PATH);
    return { ok: true, message: 'Call logged.' };
  });
}

export async function setCallOutcomeAction(input: {
  callLogId: string;
  leadId: string;
  outcome: CallOutcome;
  notes?: string;
}): Promise<ActionResult> {
  return run(SALES_ROLES, async ({ viewer, supabase }) => {
    const outcome = CALL_OUTCOMES.find((o) => o.value === input.outcome);
    if (!outcome) return { ok: false, error: 'Pick a call outcome.' };

    const { error } = await supabase
      .from('sales_call_logs')
      .update({ outcome: input.outcome, rep_notes: input.notes?.trim() || null })
      .eq('id', input.callLogId);
    if (error) return dbError(error, 'Could not save the outcome.');

    await afterOutcome(supabase, viewer, input.leadId, outcome.connected, input.outcome, input.notes);
    revalidatePath(SALES_PATH);
    return { ok: true, message: 'Outcome saved.' };
  });
}

async function afterOutcome(
  supabase: Supabase,
  viewer: Viewer,
  leadId: string,
  connected: boolean,
  outcome: CallOutcome,
  notes?: string
) {
  const label = CALL_OUTCOMES.find((o) => o.value === outcome)?.label || outcome;
  const summary = notes?.trim() ? `${label}: ${notes.trim()}` : label;

  await supabase.from('lead_activities').insert({
    lead_id: leadId,
    actor_id: viewer.id,
    activity_type: 'CALL',
    body: `Call outcome — ${summary}`,
    metadata: { outcome },
  });

  const update: Record<string, unknown> = { last_response_summary: summary.slice(0, 500) };
  if (connected) {
    // Only ever moves a NEW lead forward.
    await supabase.from('leads').update({ stage: 'CONTACTED' }).eq('id', leadId).eq('stage', 'NEW');
  }
  await supabase.from('leads').update(update).eq('id', leadId);
}

/** WhatsApp / email opened from the drawer: logged as a touch and counts as first response. */
export async function logTouchAction(input: { leadId: string; channel: 'WHATSAPP' | 'EMAIL' }): Promise<ActionResult> {
  return run(SALES_ROLES, async ({ viewer, supabase }) => {
    const { data: lead } = await supabase.from('leads').select('first_responded_at').eq('id', input.leadId).maybeSingle();
    const nowIso = new Date().toISOString();

    await supabase.from('lead_activities').insert({
      lead_id: input.leadId,
      actor_id: viewer.id,
      activity_type: input.channel,
      body: input.channel === 'WHATSAPP' ? 'Opened WhatsApp chat' : 'Opened email',
    });
    const { error } = await supabase
      .from('leads')
      .update({ last_contacted_at: nowIso, ...(lead && !lead.first_responded_at ? { first_responded_at: nowIso } : {}) })
      .eq('id', input.leadId);
    if (error) return dbError(error, 'Could not log the touch.');
    revalidatePath(SALES_PATH);
    return { ok: true };
  });
}

// ---------------------------------------------------------------------------
// Notes, stage, ownership
// ---------------------------------------------------------------------------

export async function addNoteAction(input: { leadId: string; body: string }): Promise<ActionResult> {
  return run(SALES_ROLES, async ({ viewer, supabase }) => {
    const body = input.body.trim();
    if (!body) return { ok: false, error: 'Write something first.' };

    const { error } = await supabase.from('lead_activities').insert({
      lead_id: input.leadId,
      actor_id: viewer.id,
      activity_type: 'NOTE',
      body: body.slice(0, 5000),
    });
    if (error) return dbError(error, 'Could not save the note.');

    await supabase.from('leads').update({ last_response_summary: body.slice(0, 500) }).eq('id', input.leadId);
    return { ok: true };
  });
}

const OPEN_STAGES: LeadStage[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'QUOTED', 'WON', 'LOST'];

export async function updateStageAction(input: {
  leadId: string;
  stage: LeadStage;
  lostReason?: string;
}): Promise<ActionResult> {
  return run(SALES_ROLES, async ({ supabase }) => {
    if (!OPEN_STAGES.includes(input.stage)) return { ok: false, error: 'Unknown stage.' };
    if (input.stage === 'LOST' && !input.lostReason?.trim()) {
      return { ok: false, error: 'Add a short reason for losing this lead.' };
    }

    const { data: current, error: readError } = await supabase
      .from('leads')
      .select('stage, first_responded_at')
      .eq('id', input.leadId)
      .maybeSingle();
    if (readError || !current) return dbError(readError, 'Lead not found.');
    if (current.stage === input.stage) return { ok: true };

    const update: Record<string, unknown> = {
      stage: input.stage,
      lost_reason: input.stage === 'LOST' ? input.lostReason!.trim() : null,
    };
    // Working a lead (even without a call) counts as the first response.
    if (!current.first_responded_at && input.stage !== 'NEW') update.first_responded_at = new Date().toISOString();

    const { error } = await supabase.from('leads').update(update).eq('id', input.leadId);
    if (error) return dbError(error, 'Could not change the stage.');

    await emit('crm/lead.stage_changed', { leadId: input.leadId, from: current.stage, to: input.stage });
    revalidatePath(SALES_PATH);
    return { ok: true, message: input.stage === 'WON' ? 'Won! Project provisioned for the delivery team.' : undefined };
  });
}

export async function reassignLeadAction(input: { leadId: string; repId: string }): Promise<ActionResult> {
  return run(['MD_CEO'], async ({ supabase }) => {
    const { data: rep } = await supabase
      .from('user_profiles')
      .select('id, full_name, role, is_active')
      .eq('id', input.repId)
      .maybeSingle();
    if (!rep || rep.role !== 'SALES_REP' || !rep.is_active) return { ok: false, error: 'Pick an active sales rep.' };

    const { error } = await supabase.from('leads').update({ assigned_rep_id: rep.id }).eq('id', input.leadId);
    if (error) return dbError(error, 'Could not reassign.');

    await emit('crm/lead.received', { leadId: input.leadId, isNew: false, reopened: false, channel: 'REASSIGNED' });
    revalidatePath(SALES_PATH);
    return { ok: true, message: `Assigned to ${rep.full_name}.` };
  });
}

export async function distributeUnassignedAction(): Promise<ActionResult> {
  return run(['MD_CEO'], async ({ supabase }) => {
    const { data, error } = await supabase.rpc('distribute_unassigned_leads');
    if (error) return dbError(error, 'Could not assign leads.');
    revalidatePath(SALES_PATH);
    return { ok: true, message: data ? `Assigned ${data} lead${data === 1 ? '' : 's'} round-robin.` : 'No active reps to assign to.' };
  });
}

// ---------------------------------------------------------------------------
// Follow-ups
// ---------------------------------------------------------------------------

export async function scheduleFollowUpAction(input: {
  leadId: string;
  scheduledAt: string;
  note?: string;
}): Promise<ActionResult> {
  return run(SALES_ROLES, async ({ viewer, supabase }) => {
    const when = new Date(input.scheduledAt);
    if (Number.isNaN(when.getTime())) return { ok: false, error: 'Pick a valid date and time.' };
    if (when.getTime() < Date.now() - 60_000) return { ok: false, error: 'That time is in the past.' };

    const { data: lead } = await supabase.from('leads').select('assigned_rep_id').eq('id', input.leadId).maybeSingle();
    const { data: reminder, error } = await supabase
      .from('follow_up_reminders')
      .insert({
        lead_id: input.leadId,
        rep_id: lead?.assigned_rep_id || viewer.id,
        scheduled_at: when.toISOString(),
        message_note: input.note?.trim() || null,
        channels: ['WHATSAPP', 'EMAIL'],
      })
      .select('id, scheduled_at')
      .single();
    if (error || !reminder) return dbError(error, 'Could not schedule the follow-up.');

    await emit('crm/follow_up.scheduled', { reminderId: reminder.id, scheduledAt: reminder.scheduled_at });
    revalidatePath(SALES_PATH);
    return { ok: true, message: 'Follow-up scheduled — you’ll get a WhatsApp and email reminder.' };
  });
}

export async function closeFollowUpAction(input: { reminderId: string; status: 'COMPLETED' | 'CANCELLED' }): Promise<ActionResult> {
  return run(SALES_ROLES, async ({ supabase }) => {
    const { error } = await supabase
      .from('follow_up_reminders')
      .update({ status: input.status, completed_at: input.status === 'COMPLETED' ? new Date().toISOString() : null })
      .eq('id', input.reminderId);
    if (error) return dbError(error, 'Could not update the follow-up.');
    revalidatePath(SALES_PATH);
    return { ok: true };
  });
}

// ---------------------------------------------------------------------------
// Quotations
// ---------------------------------------------------------------------------

function cleanItems(items: QuoteLineItem[]) {
  return items
    .map((i) => ({
      description: String(i.description || '').trim().slice(0, 500),
      qty: Number(i.qty) || 0,
      unit_price_inr: Math.round((Number(i.unit_price_inr) || 0) * 100) / 100,
    }))
    .filter((i) => i.description || i.unit_price_inr);
}

export async function saveQuoteAction(input: {
  quoteId?: string;
  leadId: string;
  title?: string;
  items: QuoteLineItem[];
  discountInr: number;
  gstRate: number;
  notes?: string;
  submit: boolean;
}): Promise<ActionResult<{ quoteId: string }>> {
  return run<{ quoteId: string }>(SALES_ROLES, async ({ viewer, supabase }) => {
    const items = cleanItems(input.items);
    if (!items.length) return { ok: false, error: 'Add at least one line item.' };
    if (items.some((i) => !i.description)) return { ok: false, error: 'Every line item needs a description.' };

    const fields = {
      title: input.title?.trim() || null,
      service_items: items,
      discount_inr: Math.max(0, Number(input.discountInr) || 0),
      gst_rate: Number.isFinite(Number(input.gstRate)) ? Number(input.gstRate) : 18,
      notes: input.notes?.trim() || null,
    };

    let quoteId = input.quoteId;
    if (quoteId) {
      const { error } = await supabase
        .from('quotations')
        .update({ ...fields, ...(input.submit ? { status: 'PENDING_APPROVAL' } : {}) })
        .eq('id', quoteId);
      if (error) return dbError(error, 'Could not save the quotation.');
    } else {
      const { data, error } = await supabase
        .from('quotations')
        .insert({
          ...fields,
          lead_id: input.leadId,
          created_by: viewer.id,
          status: input.submit ? 'PENDING_APPROVAL' : 'DRAFT',
        })
        .select('id')
        .single();
      if (error || !data) return dbError(error, 'Could not create the quotation.');
      quoteId = data.id as string;
    }

    if (input.submit) await emit('crm/quote.submitted', { quotationId: quoteId });
    revalidatePath(SALES_PATH);
    return {
      ok: true,
      data: { quoteId: quoteId! },
      message: input.submit ? 'Sent to the MD for approval.' : 'Draft saved.',
    };
  });
}

export async function reviewQuoteAction(input: {
  quoteId: string;
  decision: 'APPROVED' | 'CHANGES_REQUESTED';
  note?: string;
}): Promise<ActionResult> {
  return run(['MD_CEO'], async ({ supabase }) => {
    if (input.decision === 'CHANGES_REQUESTED' && !input.note?.trim()) {
      return { ok: false, error: 'Tell the rep what to change.' };
    }
    const { error } = await supabase
      .from('quotations')
      .update({ status: input.decision, review_note: input.note?.trim() || null })
      .eq('id', input.quoteId);
    if (error) return dbError(error, 'Could not record the decision.');

    await emit('crm/quote.reviewed', { quotationId: input.quoteId });
    revalidatePath(SALES_PATH);
    return { ok: true, message: input.decision === 'APPROVED' ? 'Approved — the rep has been notified.' : 'Sent back with your note.' };
  });
}

export async function setQuoteOutcomeAction(input: {
  quoteId: string;
  status: 'SENT' | 'ACCEPTED' | 'REJECTED' | 'DRAFT' | 'PENDING_APPROVAL';
}): Promise<ActionResult> {
  return run(SALES_ROLES, async ({ supabase }) => {
    const { data: quote, error } = await supabase
      .from('quotations')
      .update({ status: input.status })
      .eq('id', input.quoteId)
      .select('id, lead_id')
      .single();
    if (error || !quote) return dbError(error, 'Could not update the quotation.');

    if (input.status === 'ACCEPTED') {
      await emit('crm/lead.stage_changed', { leadId: quote.lead_id, to: 'WON' });
    }
    if (input.status === 'PENDING_APPROVAL') {
      await emit('crm/quote.submitted', { quotationId: quote.id });
    }
    revalidatePath(SALES_PATH);
    return {
      ok: true,
      message:
        input.status === 'ACCEPTED'
          ? 'Deal won 🎉 Project, client org and delivery tasks are provisioned.'
          : undefined,
    };
  });
}

// ---------------------------------------------------------------------------
// Lead creation
// ---------------------------------------------------------------------------

export async function createManualLeadAction(input: {
  fullName: string;
  phone?: string;
  email?: string;
  company?: string;
  service?: string;
  details?: string;
}): Promise<ActionResult<{ leadId: string }>> {
  return run<{ leadId: string }>(SALES_ROLES, async ({ viewer }) => {
    if (!input.fullName.trim()) return { ok: false, error: 'Name is required.' };
    const result = await ingestLead({
      channel: 'MANUAL_ENTRY',
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      company: input.company,
      service: input.service,
      details: input.details,
      // A rep who takes a walk-in or phone enquiry owns it; the MD's go round-robin.
      assignedRepId: viewer.role === 'SALES_REP' ? viewer.id : null,
    });
    if (!result.ok) return { ok: false, error: result.error };
    revalidatePath(SALES_PATH);
    return {
      ok: true,
      data: { leadId: result.leadId },
      message: result.isNew ? 'Lead added.' : 'This person was already in the CRM — added to their history.',
    };
  });
}

const SAMPLE_LEADS = [
  { fullName: 'Priya Malhotra', company: 'Malhotra Interiors', phone: '9810012345', email: 'priya@malhotrainteriors.in', service: 'Web Development', details: 'Needs a portfolio site with enquiry form, launch in 6 weeks.' },
  { fullName: 'Rahul Bansal', company: 'Bansal Logistics', phone: '9899054321', email: 'rahul@bansallogistics.com', service: 'Custom CRM', details: 'Track 40 trucks and dispatch leads from IndiaMART.' },
  { fullName: 'Ananya Iyer', company: 'Glow Skin Clinic', phone: '9820098765', email: 'ananya@glowskin.in', service: 'Social Media', details: '3 reels a week, Instagram growth in South Delhi.' },
  { fullName: 'Vikram Sethi', company: 'Sethi Realty', phone: '9711122233', email: 'vikram@sethirealty.com', service: 'Paid Ads', details: 'Meta lead ads for 2 BHK launch, ₹3L/month budget.' },
  { fullName: 'Meera Kapoor', company: 'Kapoor Dental Care', phone: '9958877665', email: 'meera@kapoordental.in', service: 'SEO', details: 'Rank for “dentist in Dwarka” and get Google Maps calls.' },
];

/** Development only: fills an empty queue so every screen can be tried end to end. */
export async function loadSampleLeadsAction(): Promise<ActionResult> {
  return run(SALES_ROLES, async () => {
    if (!TEST_PERSONAS_ENABLED) return { ok: false, error: 'Sample data is disabled in production.' };
    let created = 0;
    for (const lead of SAMPLE_LEADS) {
      const result = await ingestLead({ channel: 'WEBSITE_FORM', ...lead });
      if (result.ok && result.isNew) created++;
    }
    revalidatePath(SALES_PATH);
    return { ok: true, message: created ? `Added ${created} sample leads.` : 'Sample leads were already loaded.' };
  });
}
