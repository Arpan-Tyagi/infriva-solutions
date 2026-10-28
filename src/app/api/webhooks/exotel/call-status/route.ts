/**
 * @file src/app/api/webhooks/exotel/call-status/route.ts
 * @description Exotel StatusCallback receiver for click-to-call.
 *
 * URL: /api/webhooks/exotel/call-status?call_log_id=<uuid>&sig=<hmac>
 * Updates the call log; database triggers roll the result up into the lead
 * (NEW → CONTACTED on a connected call). Always answers 200 for authentic
 * requests so Exotel does not retry indefinitely.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { parseExotelCallback, verifyCallLogSignature } from '@/lib/exotel';

export async function POST(request: Request) {
  const url = new URL(request.url);
  const callLogId = url.searchParams.get('call_log_id');
  const signature = url.searchParams.get('sig');

  if (!callLogId || !verifyCallLogSignature(callLogId, signature)) {
    return NextResponse.json({ error: 'Invalid callback signature' }, { status: 401 });
  }

  let payload: Record<string, unknown> = {};
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      const form = await request.formData();
      form.forEach((value, key) => {
        payload[key] = String(value);
      });
    }
  } catch {
    return NextResponse.json({ error: 'Unreadable callback body' }, { status: 400 });
  }

  const status = parseExotelCallback(payload);

  const { error } = await supabaseAdmin
    .from('sales_call_logs')
    .update({
      ...(status.callSid ? { call_sid: status.callSid } : {}),
      call_status: status.status,
      duration_seconds: status.durationSeconds,
      recording_url: status.recordingUrl,
      ended_at: status.endedAt ? new Date(status.endedAt).toISOString() : new Date().toISOString(),
    })
    .eq('id', callLogId);

  if (error) {
    console.error('[exotel] Failed to update call log', callLogId, error);
    return NextResponse.json({ error: 'Could not record call status' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
