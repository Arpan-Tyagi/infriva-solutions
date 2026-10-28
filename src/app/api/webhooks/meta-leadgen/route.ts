/**
 * @file src/app/api/webhooks/meta-leadgen/route.ts
 * @description Meta Lead Ads Webhook Receiver & Daily Reconciliation Engine
 *
 * Handles Meta Graph API v22.0 webhook events for instantaneous Lead Ads ingestion.
 * Follows Meta specifications:
 * - GET: Plaintext hub.challenge response for webhook verification handshake.
 * - POST: HMAC-SHA256 X-Hub-Signature-256 validation.
 * - Retrieves lead data via GET /{leadgen_id} with graceful synthetic test detection.
 * - Daily cron reconciliation helper to catch dropped payloads.
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { normalizeIndianPhone } from '@/lib/phone';
import { safeTimingEqual } from '@/lib/crypto-safe';

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'infriva_meta_leadgen_verify';
const APP_SECRET = process.env.META_APP_SECRET || '';
const PAGE_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';

/**
 * Validates Meta HMAC-SHA256 request signature
 */
function verifyMetaSignature(payload: string, signatureHeader: string | null): boolean {
  if (!APP_SECRET) {
    if (process.env.NODE_ENV === 'production') return false; // fail-closed in production
    return true; // dev bypass
  }
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;

  const expectedSignature = signatureHeader.replace('sha256=', '');
  const calculatedSignature = crypto
    .createHmac('sha256', APP_SECRET)
    .update(payload)
    .digest('hex');

  return safeTimingEqual(expectedSignature, calculatedSignature);
}

/**
 * GET Handler: Webhook Verification Handshake
 * Returns hub.challenge strictly as text/plain.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new Response('Forbidden: Verification token mismatch', { status: 403 });
}

/**
 * POST Handler: Process Lead Ads Event
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    // 1. Verify HMAC-SHA256 signature
    if (!verifyMetaSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.object !== 'page') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    // 2. Iterate entry changes
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'leadgen') {
          const { leadgen_id, form_id, page_id, ad_id } = change.value;

          if (!leadgen_id) continue;

          // Check idempotency: avoid reprocessing duplicate webhooks
          const { data: existingLog } = await supabaseAdmin
            .from('inbound_webhook_logs')
            .select('id')
            .eq('external_event_id', leadgen_id)
            .maybeSingle();

          if (existingLog) {
            // Already logged and processed, acknowledge HTTP 200
            continue;
          }

          // Record in audit log
          await supabaseAdmin.from('inbound_webhook_logs').insert([
            {
              source: 'META_LEAD_ADS',
              external_event_id: leadgen_id,
              raw_payload: change.value,
              processed: false,
            },
          ]);

          // Detect synthetic test lead IDs from Meta Lead Ads Testing Tool
          const isSyntheticTest = String(leadgen_id).startsWith('4444') || String(leadgen_id).includes('test');

          let fullName = 'Meta Test Lead';
          let email = 'test_lead@infrivasolutions.com';
          let phone_e164 = '919876543210';
          let interestedService = 'WEB_DEV_UIUX';

          if (!isSyntheticTest && PAGE_ACCESS_TOKEN) {
            // Fetch live lead data from Graph API
            const graphUrl = `https://graph.facebook.com/v22.0/${leadgen_id}?access_token=${PAGE_ACCESS_TOKEN}`;
            const graphRes = await fetch(graphUrl);

            if (graphRes.ok) {
              const leadData = await graphRes.json();
              const fieldData: Array<{ name: string; values: string[] }> = leadData.field_data || [];

              fieldData.forEach((f) => {
                const val = f.values?.[0] || '';
                const nameKey = f.name.toLowerCase();
                if (nameKey.includes('full_name') || nameKey.includes('name')) fullName = val;
                else if (nameKey.includes('email')) email = val.toLowerCase().trim();
                else if (nameKey.includes('phone')) {
                  const norm = normalizeIndianPhone(val);
                  phone_e164 = norm.isValid ? norm.e164 : val;
                } else if (nameKey.includes('service')) {
                  interestedService = val;
                }
              });
            }
          }

          // Persist lead into CRM
          await supabaseAdmin.from('leads').upsert(
            [
              {
                source_channel: 'META_LEAD_ADS',
                leadgen_id: String(leadgen_id),
                full_name: fullName,
                email,
                phone_e164,
                interested_service: interestedService as any,
                attribution_touch: {
                  utm_source: 'meta',
                  utm_medium: 'paid_social',
                  utm_campaign: `ad_${ad_id || 'unknown'}`,
                  form_id,
                  page_id,
                },
                stage: 'NEW',
                sla_first_response_due_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
              },
            ],
            { onConflict: 'leadgen_id' }
          );

          // Mark log as processed
          await supabaseAdmin
            .from('inbound_webhook_logs')
            .update({ processed: true })
            .eq('external_event_id', leadgen_id);
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Meta leadgen webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Daily Reconciliation Cron Helper: polls GET /{form_id}/leads to catch any dropped webhooks
 */
export async function reconcileMetaFormLeads(formId: string, accessToken: string) {
  try {
    const url = `https://graph.facebook.com/v22.0/${formId}/leads?access_token=${accessToken}&limit=50`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Meta form reconciliation failed: ${res.statusText}`);

    const body = await res.json();
    const leads = body.data || [];
    let syncedCount = 0;

    for (const lead of leads) {
      const { id: leadgen_id, field_data } = lead;
      const { data: existing } = await supabaseAdmin
        .from('leads')
        .select('id')
        .eq('leadgen_id', leadgen_id)
        .maybeSingle();

      if (!existing) {
        let fullName = 'Reconciled Lead';
        let email = `lead_${leadgen_id}@reconciled.com`;
        let phone_e164 = '919876543210';

        field_data?.forEach((f: any) => {
          const val = f.values?.[0] || '';
          const nameKey = f.name.toLowerCase();
          if (nameKey.includes('name')) fullName = val;
          else if (nameKey.includes('email')) email = val.toLowerCase().trim();
          else if (nameKey.includes('phone')) {
            const norm = normalizeIndianPhone(val);
            phone_e164 = norm.isValid ? norm.e164 : val;
          }
        });

        await supabaseAdmin.from('leads').insert([
          {
            source_channel: 'META_LEAD_ADS',
            leadgen_id: String(leadgen_id),
            full_name: fullName,
            email,
            phone_e164,
            stage: 'NEW',
          },
        ]);
        syncedCount++;
      }
    }

    return { success: true, syncedCount };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
