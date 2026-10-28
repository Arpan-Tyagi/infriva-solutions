/**
 * @file src/app/api/webhooks/google-ads-lead/route.ts
 * @description Google Ads Lead Form Extension webhook.
 *
 * - Authenticates with the `google_key` configured on the lead form
 *   (GOOGLE_ADS_WEBHOOK_KEY); fails closed when the key is not configured.
 * - Forward-compatible parsing: unknown fields pass through, user data is read
 *   by `column_id` (FULL_NAME, EMAIL, PHONE_NUMBER, ...).
 * - Idempotent on `lead_id` via inbound_webhook_logs and leads.google_lead_id.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { safeTimingEqual } from '@/lib/crypto-safe';
import { ingestLead } from '@/lib/lead-intake';

const MAX_PAYLOAD_BYTES = 512 * 1024;

const UserColumnDataSchema = z
  .object({
    column_id: z.string(),
    string_value: z.string().optional(),
    column_name: z.string().optional(),
  })
  .passthrough();

const GoogleLeadPayloadSchema = z
  .object({
    lead_id: z.string(),
    google_key: z.string(),
    is_test: z.boolean().optional(),
    gcl_id: z.string().optional(),
    form_id: z.union([z.string(), z.number()]).optional(),
    campaign_id: z.union([z.string(), z.number()]).optional(),
    user_column_data: z.array(UserColumnDataSchema).default([]),
  })
  .passthrough();

export async function POST(request: Request) {
  const expectedKey = process.env.GOOGLE_ADS_WEBHOOK_KEY;
  if (!expectedKey) {
    console.error('[google-ads-lead] GOOGLE_ADS_WEBHOOK_KEY is not configured; rejecting.');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  if (Number(request.headers.get('content-length') || 0) > MAX_PAYLOAD_BYTES) {
    return new NextResponse('Payload Too Large', { status: 413 });
  }
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_PAYLOAD_BYTES) {
    return new NextResponse('Payload Too Large', { status: 413 });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 });
  }

  const validation = GoogleLeadPayloadSchema.safeParse(parsedJson);
  if (!validation.success) {
    return NextResponse.json({ error: 'Malformed Google lead payload' }, { status: 400 });
  }
  const data = validation.data;

  if (!safeTimingEqual(data.google_key, expectedKey)) {
    return NextResponse.json({ error: 'Unauthorized: invalid google_key' }, { status: 401 });
  }

  const { data: log } = await supabaseAdmin
    .from('inbound_webhook_logs')
    .select('id, processed')
    .eq('external_event_id', data.lead_id)
    .maybeSingle();
  if (log?.processed) {
    return NextResponse.json({ success: true, message: 'Already processed' }, { status: 200 });
  }
  if (!log) {
    await supabaseAdmin.from('inbound_webhook_logs').insert({
      source: 'GOOGLE_ADS_FORM',
      external_event_id: data.lead_id,
      raw_payload: parsedJson,
      processed: false,
    });
  }

  const columns: Record<string, string> = {};
  for (const col of data.user_column_data) {
    columns[col.column_id.toUpperCase()] = (col.string_value || '').trim();
  }
  const fullName =
    columns.FULL_NAME || [columns.FIRST_NAME, columns.LAST_NAME].filter(Boolean).join(' ').trim() || null;
  const serviceAnswer = Object.entries(columns).find(([k]) => /SERVICE|INTEREST/.test(k))?.[1];

  const result = await ingestLead({
    channel: 'GOOGLE_ADS_FORM',
    googleLeadId: data.lead_id,
    fullName,
    email: columns.EMAIL || columns.WORK_EMAIL,
    phone: columns.PHONE_NUMBER || columns.WORK_PHONE,
    company: columns.COMPANY_NAME,
    service: serviceAnswer,
    attribution: {
      utm_source: 'google',
      utm_medium: 'cpc',
      gclid: data.gcl_id,
      campaign_id: data.campaign_id,
      form_id: data.form_id,
      is_test: data.is_test || false,
    },
  });

  await supabaseAdmin
    .from('inbound_webhook_logs')
    .update(result.ok ? { processed: true, error_message: null } : { processed: false, error_message: result.error })
    .eq('external_event_id', data.lead_id);

  if (!result.ok) {
    // Google retries non-2xx responses.
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ success: true, lead_id: data.lead_id }, { status: 200 });
}
