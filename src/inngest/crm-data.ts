/**
 * @file src/inngest/crm-data.ts
 * @description Service-role reads/writes shared by the CRM background jobs.
 */

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { AlertRecipient } from '@/lib/notify';

export interface JobLead {
  id: string;
  full_name: string;
  company_name: string | null;
  email: string | null;
  phone_e164: string | null;
  interested_service: string;
  source_channel: string;
  stage: string;
  assigned_rep_id: string | null;
  sla_first_response_due_at: string | null;
  first_responded_at: string | null;
  sla_breached: boolean;
  leadgen_id: string | null;
  linkedin_url: string | null;
  attribution_touch: Record<string, unknown> | null;
  is_existing_client: boolean;
}

const LEAD_COLUMNS =
  'id, full_name, company_name, email, phone_e164, interested_service, source_channel, stage, assigned_rep_id, ' +
  'sla_first_response_due_at, first_responded_at, sla_breached, leadgen_id, linkedin_url, attribution_touch, is_existing_client';

export async function loadLead(leadId: string): Promise<JobLead | null> {
  const { data, error } = await supabaseAdmin.from('leads').select(LEAD_COLUMNS).eq('id', leadId).maybeSingle();
  if (error) throw new Error(`loadLead: ${error.message}`);
  return (data as unknown as JobLead) || null;
}

export async function loadProfile(profileId: string | null): Promise<(AlertRecipient & { id: string }) | null> {
  if (!profileId) return null;
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('id, full_name, email, phone_e164')
    .eq('id', profileId)
    .maybeSingle();
  if (error) throw new Error(`loadProfile: ${error.message}`);
  return data;
}

export async function loadActiveExecutives(): Promise<Array<AlertRecipient & { id: string }>> {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('id, full_name, email, phone_e164')
    .eq('role', 'MD_CEO')
    .eq('is_active', true);
  if (error) throw new Error(`loadActiveExecutives: ${error.message}`);
  return data || [];
}

export async function logSystemActivity(
  leadId: string,
  body: string,
  metadata: Record<string, unknown> = {},
  activityType: 'SYSTEM' | 'WHATSAPP' | 'EMAIL' = 'SYSTEM'
) {
  const { error } = await supabaseAdmin
    .from('lead_activities')
    .insert({ lead_id: leadId, activity_type: activityType, body, metadata });
  if (error) console.error('[inngest] Could not log activity:', error.message);
}

export function describeLead(lead: Pick<JobLead, 'full_name' | 'company_name' | 'interested_service' | 'source_channel'>) {
  const who = lead.company_name ? `${lead.full_name} (${lead.company_name})` : lead.full_name;
  return `${who} — ${lead.interested_service.replace(/_/g, ' ')} via ${lead.source_channel.replace(/_/g, ' ')}`;
}

export function formatInr(amount: number | string) {
  return `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}
