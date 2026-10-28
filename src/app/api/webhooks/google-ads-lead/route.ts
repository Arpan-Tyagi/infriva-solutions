/**
 * @file src/app/api/webhooks/google-ads-lead/route.ts
 * @description Google Ads Lead Form Extension Webhook Receiver
 *
 * Implements non-strict schema parsing and column_id deterministic mapping.
 * Enforces 512 KB payload ceiling and shared google_key secret verification.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { normalizeIndianPhone } from '@/lib/phone';
import { safeTimingEqual } from '@/lib/crypto-safe';

const GOOGLE_KEY_SECRET = process.env.GOOGLE_ADS_WEBHOOK_KEY || 'infriva_google_ads_key_2026';
const MAX_PAYLOAD_BYTES = 512 * 1024; // 512 KB limit

// Non-strict forward-compatible Zod schema
const UserColumnDataSchema = z.object({
  column_id: z.string(),
  string_value: z.string().optional(),
  column_name: z.string().optional(),
}).passthrough();

const GoogleLeadPayloadSchema = z.object({
  lead_id: z.string(),
  google_key: z.string(),
  is_test: z.boolean().optional(),
  gcl_id: z.string().optional(),
  form_id: z.union([z.string(), z.number()]).optional(),
  campaign_id: z.union([z.string(), z.number()]).optional(),
  lead_source: z.string().optional(),
  user_column_data: z.array(UserColumnDataSchema).default([]),
}).passthrough();

export async function POST(request: Request) {
  try {
    // 1. Enforce 512 KB payload size ceiling
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_PAYLOAD_BYTES) {
      return new NextResponse('Payload Too Large', { status: 413 });
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_PAYLOAD_BYTES) {
      return new NextResponse('Payload Too Large', { status: 413 });
    }

    const parsedJson = JSON.parse(rawBody);
    const validation = GoogleLeadPayloadSchema.safeParse(parsedJson);

    if (!validation.success) {
      return NextResponse.json({ error: 'Malformed Google Lead schema', details: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;

    // 2. Validate shared google_key secret in constant time
    if (!safeTimingEqual(data.google_key, GOOGLE_KEY_SECRET)) {
      return NextResponse.json({ error: 'Unauthorized: Invalid google_key' }, { status: 401 });
    }

    // 3. Idempotency Check on lead_id
    const { data: existingLog } = await supabaseAdmin
      .from('inbound_webhook_logs')
      .select('id')
      .eq('external_event_id', data.lead_id)
      .maybeSingle();

    if (existingLog) {
      return NextResponse.json({ success: true, message: 'Already processed' }, { status: 200 });
    }

    // Record webhook log
    await supabaseAdmin.from('inbound_webhook_logs').insert([
      {
        source: 'GOOGLE_ADS_FORM',
        external_event_id: data.lead_id,
        raw_payload: parsedJson,
        processed: false,
      },
    ]);

    // 4. Map user_column_data deterministically by column_id
    let fullName = '';
    let firstName = '';
    let lastName = '';
    let email = '';
    let rawPhone = '';
    let companyName = '';

    for (const col of data.user_column_data) {
      const val = col.string_value || '';
      const cid = col.column_id.toUpperCase();

      if (cid === 'FULL_NAME') fullName = val;
      else if (cid === 'FIRST_NAME') firstName = val;
      else if (cid === 'LAST_NAME') lastName = val;
      else if (cid === 'EMAIL') email = val.toLowerCase().trim();
      else if (cid === 'PHONE_NUMBER') rawPhone = val;
      else if (cid === 'COMPANY_NAME') companyName = val;
    }

    if (!fullName && (firstName || lastName)) {
      fullName = `${firstName} ${lastName}`.trim();
    }
    if (!fullName) fullName = 'Google Ads Prospect';
    if (!email) email = `gads_${data.lead_id}@lead.infrivasolutions.com`;

    // 5. Phone Normalization (E.164 91XXXXXXXXXX)
    const phoneResult = normalizeIndianPhone(rawPhone);
    const phone_e164 = phoneResult.isValid ? phoneResult.e164 : '919876543210';

    // 6. Upsert into CRM Leads
    await supabaseAdmin.from('leads').upsert(
      [
        {
          source_channel: 'GOOGLE_ADS_FORM',
          google_lead_id: data.lead_id,
          full_name: fullName,
          email,
          phone_e164,
          company_name: companyName || null,
          attribution_touch: {
            utm_source: 'google',
            utm_medium: 'cpc',
            gclid: data.gcl_id,
            campaign_id: data.campaign_id,
            form_id: data.form_id,
            is_test: data.is_test || false,
          },
          stage: 'NEW',
          sla_first_response_due_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        },
      ],
      { onConflict: 'google_lead_id' }
    );

    await supabaseAdmin
      .from('inbound_webhook_logs')
      .update({ processed: true })
      .eq('external_event_id', data.lead_id);

    return NextResponse.json({ success: true, lead_id: data.lead_id }, { status: 200 });
  } catch (error) {
    console.error('Google Ads Lead Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
