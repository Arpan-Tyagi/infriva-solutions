/**
 * @file src/lib/lead-intake.ts
 * @description Single entry point for every inbound lead (website form, Meta Lead Ads,
 * Google Ads lead forms, manual entry).
 *
 * - Normalizes email and Indian mobile numbers (E.164 without '+': 91XXXXXXXXXX)
 * - Deduplicates against existing leads by platform id, then email, then phone
 * - Flags enquiries from existing clients (won leads / matching client org domain)
 * - Re-opens LOST leads that enquire again; logs repeat enquiries on the timeline
 * - New leads are assigned round-robin and get a 5-minute SLA by database trigger
 * - Emits `crm/lead.received` so background jobs notify the rep and watch the SLA
 *
 * Runs with the service-role client: callers are trusted server routes that have
 * already authenticated their source (HMAC, google_key, honeypot + rate limit).
 */

import { supabaseAdmin } from '@/lib/supabase-admin';
import { normalizeIndianPhone } from '@/lib/phone';
import { inngest } from '@/inngest/client';
import type { InfrivaServiceTier, LeadSourceChannel } from '@/types/crm';

export const FIRST_RESPONSE_SLA_MINUTES = 5;

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Consumer mailbox domains never identify a client organisation.
const FREE_MAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'outlook.com', 'hotmail.com',
  'live.com', 'icloud.com', 'me.com', 'rediffmail.com', 'proton.me', 'protonmail.com', 'aol.com',
]);

const SERVICE_TIERS: InfrivaServiceTier[] = [
  'WEB_DEV_UIUX', 'CUSTOM_CRM', 'FULL_STACK_SEO_GEO', 'PAID_ADS_MGMT',
  'WHATSAPP_RETENTION', 'PREMIUM_CONTENT', 'SOCIAL_MEDIA_MGMT',
];

/** Maps free text ("Custom CRM", "seo", "meta ads") or an enum value to a service tier. */
export function mapServiceToTier(service?: string | null): InfrivaServiceTier {
  const raw = (service || '').trim();
  if ((SERVICE_TIERS as string[]).includes(raw)) return raw as InfrivaServiceTier;

  const s = raw.toLowerCase();
  if (s.includes('crm')) return 'CUSTOM_CRM';
  if (s.includes('seo') || s.includes('geo')) return 'FULL_STACK_SEO_GEO';
  if (s.includes('whatsapp') || s.includes('retention')) return 'WHATSAPP_RETENTION';
  if (s.includes('paid') || /\bads?\b/.test(s) || s.includes('meta') || s.includes('google')) return 'PAID_ADS_MGMT';
  if (s.includes('content') || s.includes('video') || s.includes('production')) return 'PREMIUM_CONTENT';
  if (s.includes('social') || s.includes('smm')) return 'SOCIAL_MEDIA_MGMT';
  return 'WEB_DEV_UIUX';
}

export function normalizeEmail(email?: string | null): string | null {
  const e = (email || '').trim().toLowerCase();
  return EMAIL_PATTERN.test(e) ? e : null;
}

export interface LeadIntakeInput {
  channel: LeadSourceChannel;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  budget?: string | null;
  details?: string | null;
  attribution?: Record<string, unknown> | null;
  leadgenId?: string | null;
  googleLeadId?: string | null;
  /** Assign to this rep instead of round-robin (manual entry). */
  assignedRepId?: string | null;
}

export type LeadIntakeResult =
  | { ok: true; leadId: string; isNew: boolean; reopened: boolean; isExistingClient: boolean }
  | { ok: false; status: number; error: string };

type ExistingLead = {
  id: string;
  stage: string;
  inquiry_count: number;
  project_details: string | null;
  converted_org_id: string | null;
};

const EXISTING_LEAD_COLUMNS = 'id, stage, inquiry_count, project_details, converted_org_id';

async function findExistingLead(
  leadgenId: string | null,
  googleLeadId: string | null,
  email: string | null,
  phone: string | null
): Promise<ExistingLead | null> {
  // Each lookup uses .eq() so no user input is ever interpolated into a filter string.
  const lookups: Array<[string, string | null]> = [
    ['leadgen_id', leadgenId],
    ['google_lead_id', googleLeadId],
    ['email', email],
    ['phone_e164', phone],
  ];

  for (const [column, value] of lookups) {
    if (!value) continue;
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select(EXISTING_LEAD_COLUMNS)
      .eq(column, value)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`Lead lookup by ${column} failed: ${error.message}`);
    if (data) return data as ExistingLead;
  }
  return null;
}

async function isExistingClient(email: string | null, phone: string | null, existing: ExistingLead | null) {
  if (existing && (existing.stage === 'WON' || existing.converted_org_id)) return true;

  if (phone || email) {
    for (const [column, value] of [['email', email], ['phone_e164', phone]] as const) {
      if (!value) continue;
      const { count } = await supabaseAdmin
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq(column, value)
        .eq('stage', 'WON');
      if (count) return true;
    }
  }

  const domain = email?.split('@')[1];
  if (domain && !FREE_MAIL_DOMAINS.has(domain)) {
    const { count } = await supabaseAdmin
      .from('organizations')
      .select('id', { count: 'exact', head: true })
      .eq('domain', domain)
      .eq('is_internal_agency', false);
    if (count) return true;
  }
  return false;
}

async function emitLeadReceived(data: { leadId: string; isNew: boolean; reopened: boolean; channel: LeadSourceChannel }) {
  try {
    await inngest.send({ name: 'crm/lead.received', data });
  } catch (err) {
    // The lead is already saved; background alerts must never fail the intake.
    console.error('[lead-intake] Could not emit crm/lead.received:', err);
  }
}

export async function ingestLead(input: LeadIntakeInput): Promise<LeadIntakeResult> {
  const email = normalizeEmail(input.email);
  const rawPhone = (input.phone || '').trim();
  const phoneResult = rawPhone ? normalizeIndianPhone(rawPhone) : null;
  const phone = phoneResult?.isValid ? phoneResult.e164 : null;

  if (!email && !phone) {
    return { ok: false, status: 400, error: 'A valid email address or Indian mobile number is required.' };
  }

  const fullName = (input.fullName || '').trim() || (email ? email.split('@')[0] : 'New enquiry');
  const details = (input.details || '').trim() || null;
  const company = (input.company || '').trim() || null;
  const budget = (input.budget || '').trim() || null;
  const leadgenId = input.leadgenId ? String(input.leadgenId) : null;
  const googleLeadId = input.googleLeadId ? String(input.googleLeadId) : null;
  const hasAttribution = input.attribution && Object.keys(input.attribution).length > 0;

  const existing = await findExistingLead(leadgenId, googleLeadId, email, phone);
  const existingClient = await isExistingClient(email, phone, existing);
  const nowIso = new Date().toISOString();

  if (existing) {
    const reopened = existing.stage === 'LOST';
    const appendedDetails = details
      ? [existing.project_details, `[Enquiry ${nowIso} via ${input.channel}] ${details}`].filter(Boolean).join('\n\n')
      : existing.project_details;

    const update: Record<string, unknown> = {
      inquiry_count: (existing.inquiry_count || 1) + 1,
      last_inquiry_at: nowIso,
      project_details: appendedDetails,
      is_existing_client: existingClient,
    };
    if (input.service) update.interested_service = mapServiceToTier(input.service);
    if (budget) update.budget_bracket = budget;
    if (company) update.company_name = company;
    if (email) update.email = email;
    if (phone) update.phone_e164 = phone;
    if (hasAttribution) update.attribution_touch = input.attribution;
    if (leadgenId) update.leadgen_id = leadgenId;
    if (googleLeadId) update.google_lead_id = googleLeadId;
    if (reopened) {
      update.stage = 'NEW';
      update.lost_reason = null;
      update.first_responded_at = null;
      update.sla_breached = false;
      update.sla_first_response_due_at = new Date(Date.now() + FIRST_RESPONSE_SLA_MINUTES * 60_000).toISOString();
    }

    const { error } = await supabaseAdmin.from('leads').update(update).eq('id', existing.id);
    if (error) {
      console.error('[lead-intake] Update failed:', error);
      return { ok: false, status: 500, error: 'Failed to update the existing lead.' };
    }

    await supabaseAdmin.from('lead_activities').insert({
      lead_id: existing.id,
      activity_type: 'INQUIRY',
      body: reopened
        ? `Lost lead enquired again via ${input.channel} — re-opened`
        : `Repeat enquiry via ${input.channel}`,
      metadata: { channel: input.channel, details },
    });

    await emitLeadReceived({ leadId: existing.id, isNew: false, reopened, channel: input.channel });
    return { ok: true, leadId: existing.id, isNew: false, reopened, isExistingClient: existingClient };
  }

  const { data: created, error: insertError } = await supabaseAdmin
    .from('leads')
    .insert({
      source_channel: input.channel,
      full_name: fullName,
      email,
      phone_e164: phone,
      phone_raw: rawPhone && !phone ? rawPhone : null,
      company_name: company,
      interested_service: mapServiceToTier(input.service),
      budget_bracket: budget,
      project_details: details,
      attribution_touch: hasAttribution ? input.attribution : {},
      leadgen_id: leadgenId,
      google_lead_id: googleLeadId,
      is_existing_client: existingClient,
      assigned_rep_id: input.assignedRepId || null,
      stage: 'NEW',
      enrichment_status: 'PENDING',
    })
    .select('id')
    .single();

  if (insertError) {
    // Two webhooks for the same platform lead raced; the other one won.
    if (insertError.code === '23505') {
      const winner = await findExistingLead(leadgenId, googleLeadId, email, phone);
      if (winner) return { ok: true, leadId: winner.id, isNew: false, reopened: false, isExistingClient: existingClient };
    }
    console.error('[lead-intake] Insert failed:', insertError);
    return { ok: false, status: 500, error: 'Failed to record the lead.' };
  }

  await emitLeadReceived({ leadId: created.id, isNew: true, reopened: false, channel: input.channel });
  return { ok: true, leadId: created.id, isNew: true, reopened: false, isExistingClient: existingClient };
}
