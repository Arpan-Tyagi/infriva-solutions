/**
 * @file src/lib/meta-leads.ts
 * @description Meta Lead Ads helpers shared by the webhook and the daily reconciliation job.
 */

import { supabaseAdmin } from '@/lib/supabase-admin';
import { ingestLead } from '@/lib/lead-intake';

const GRAPH = 'https://graph.facebook.com/v22.0';

type FieldData = Array<{ name: string; values?: string[] }>;

export interface MetaLeadFields {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  service: string | null;
  details: string | null;
}

/** Maps Lead Ads field_data (standard + custom question keys) to CRM fields. */
export function parseMetaFieldData(fieldData: FieldData): MetaLeadFields {
  const fields: Record<string, string> = {};
  for (const f of fieldData || []) {
    fields[f.name.toLowerCase()] = (f.values?.[0] || '').trim();
  }
  const pick = (...keys: string[]) => keys.map((k) => fields[k]).find((v) => v) || null;
  const firstLast = [fields.first_name, fields.last_name].filter(Boolean).join(' ').trim();
  const customKey = (re: RegExp) => Object.keys(fields).find((k) => re.test(k));

  return {
    fullName: pick('full_name') || firstLast || null,
    email: pick('email', 'work_email'),
    phone: pick('phone_number', 'phone', 'mobile_number'),
    company: pick('company_name', 'company'),
    service: (customKey(/service|requirement|interested/) && fields[customKey(/service|requirement|interested/)!]) || null,
    details: (customKey(/detail|message|project|describe/) && fields[customKey(/detail|message|project|describe/)!]) || null,
  };
}

export async function fetchMetaLead(leadgenId: string) {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error('META_ACCESS_TOKEN is not configured');
  const res = await fetch(`${GRAPH}/${encodeURIComponent(leadgenId)}?fields=created_time,field_data,ad_id,form_id,campaign_id`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Graph API lead fetch failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  return (await res.json()) as {
    id: string;
    field_data: FieldData;
    ad_id?: string;
    form_id?: string;
    campaign_id?: string;
  };
}

/** Ingests one Meta lead by id; used by the webhook and reconciliation. */
export async function ingestMetaLead(leadgenId: string, context: { formId?: string; pageId?: string; adId?: string } = {}) {
  const lead = await fetchMetaLead(leadgenId);
  const fields = parseMetaFieldData(lead.field_data);
  return ingestLead({
    channel: 'META_LEAD_ADS',
    leadgenId: String(leadgenId),
    fullName: fields.fullName,
    email: fields.email,
    phone: fields.phone,
    company: fields.company,
    service: fields.service,
    details: fields.details,
    attribution: {
      utm_source: 'meta',
      utm_medium: 'paid_social',
      utm_campaign: lead.campaign_id ? `campaign_${lead.campaign_id}` : undefined,
      ad_id: context.adId || lead.ad_id,
      form_id: context.formId || lead.form_id,
      page_id: context.pageId,
    },
  });
}

/**
 * Pulls the last `sinceDays` of leads for a form and ingests any that the
 * webhook missed. Meta keeps leads retrievable for 90 days.
 */
export async function reconcileMetaFormLeads(formId: string, sinceDays = 2) {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error('META_ACCESS_TOKEN is not configured');

  const since = Math.floor((Date.now() - sinceDays * 86400_000) / 1000);
  const filtering = encodeURIComponent(JSON.stringify([{ field: 'time_created', operator: 'GREATER_THAN', value: since }]));
  let next: string | null = `${GRAPH}/${encodeURIComponent(formId)}/leads?fields=id&limit=100&filtering=${filtering}`;
  let checked = 0;
  let ingested = 0;

  while (next) {
    const res: Response = await fetch(next, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Meta form reconciliation failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
    const page = (await res.json()) as { data?: Array<{ id: string }>; paging?: { next?: string } };

    for (const { id } of page.data || []) {
      checked++;
      const { data: existing } = await supabaseAdmin.from('leads').select('id').eq('leadgen_id', id).maybeSingle();
      if (existing) continue;
      const result = await ingestMetaLead(id, { formId });
      if (result.ok) ingested++;
    }
    next = page.paging?.next || null;
  }

  return { formId, checked, ingested };
}
