/**
 * @file src/app/api/webhooks/meta-leadgen/route.ts
 * @description Meta Lead Ads webhook receiver.
 *
 * - GET: hub.challenge handshake, answered as text/plain
 * - POST: X-Hub-Signature-256 HMAC check, then each `leadgen` change is
 *   fetched from the Graph API and ingested through the shared lead intake.
 *
 * Idempotency: inbound_webhook_logs.external_event_id = leadgen_id. A log row
 * only short-circuits when it is `processed`; failed attempts are retried on
 * Meta's redelivery (we answer 500 when any lead in the batch failed) and by
 * the daily reconciliation job (src/inngest/functions/meta-reconcile.ts).
 *
 * One-time setup: subscribe the Page to the app's `leadgen` field with
 *   POST /{page-id}/subscribed_apps?subscribed_fields=leadgen
 * (see scripts/meta-preflight.ts).
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { safeTimingEqual } from '@/lib/crypto-safe';
import { ingestMetaLead } from '@/lib/meta-leads';

function verifyMetaSignature(payload: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    // Fail closed in production; allow local testing without a secret.
    return process.env.NODE_ENV !== 'production';
  }
  if (!signatureHeader?.startsWith('sha256=')) return false;
  const expected = crypto.createHmac('sha256', appSecret).update(payload).digest('hex');
  return safeTimingEqual(signatureHeader.slice('sha256='.length), expected);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (
    verifyToken &&
    searchParams.get('hub.mode') === 'subscribe' &&
    safeTimingEqual(searchParams.get('hub.verify_token') || '', verifyToken)
  ) {
    return new Response(searchParams.get('hub.challenge') || '', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new Response('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyMetaSignature(rawBody, request.headers.get('x-hub-signature-256'))) {
    return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
  }

  let payload: { object?: string; entry?: Array<{ changes?: Array<{ field: string; value: Record<string, string> }> }> };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 });
  }

  if (payload.object !== 'page') {
    return NextResponse.json({ status: 'ignored' }, { status: 200 });
  }

  let failures = 0;

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== 'leadgen' || !change.value?.leadgen_id) continue;
      const { leadgen_id, form_id, page_id, ad_id } = change.value;
      const leadgenId = String(leadgen_id);

      const { data: log } = await supabaseAdmin
        .from('inbound_webhook_logs')
        .select('id, processed')
        .eq('external_event_id', leadgenId)
        .maybeSingle();
      if (log?.processed) continue;

      if (!log) {
        await supabaseAdmin.from('inbound_webhook_logs').insert({
          source: 'META_LEAD_ADS',
          external_event_id: leadgenId,
          raw_payload: change.value,
          processed: false,
        });
      }

      try {
        const result = await ingestMetaLead(leadgenId, { formId: form_id, pageId: page_id, adId: ad_id });
        if (!result.ok) throw new Error(result.error);
        await supabaseAdmin
          .from('inbound_webhook_logs')
          .update({ processed: true, error_message: null })
          .eq('external_event_id', leadgenId);
      } catch (err) {
        failures++;
        const message = (err as Error).message;
        console.error(`[meta-leadgen] Lead ${leadgenId} failed:`, message);
        await supabaseAdmin
          .from('inbound_webhook_logs')
          .update({ processed: false, error_message: message.slice(0, 1000) })
          .eq('external_event_id', leadgenId);
      }
    }
  }

  // A non-2xx makes Meta redeliver; processed leads are skipped on retry.
  return NextResponse.json({ success: failures === 0, failures }, { status: failures ? 500 : 200 });
}
