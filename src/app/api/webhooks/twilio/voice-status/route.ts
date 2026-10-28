/**
 * @file src/app/api/webhooks/twilio/voice-status/route.ts
 * @description Twilio Voice StatusCallback Webhook Receiver
 *
 * Logs duration, recording URLs, and call completion status idempotently.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateTwilioSignature } from '@/lib/twilio';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const leadId = url.searchParams.get('lead_id');

    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = String(value);
    });

    const signature = request.headers.get('x-twilio-signature');
    if (!validateTwilioSignature(request.url, params, signature)) {
      return NextResponse.json({ error: 'Invalid Twilio Signature' }, { status: 401 });
    }

    const callSid = params['CallSid'];
    const callStatus = params['CallStatus'] || 'unknown';
    const durationSeconds = parseInt(params['CallDuration'] || '0', 10);
    const recordingUrl = params['RecordingUrl'] || null;

    if (!callSid || !leadId) {
      return NextResponse.json({ status: 'ignored: missing callSid or leadId' }, { status: 200 });
    }

    // Lookup lead to get assigned sales rep
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('assigned_rep_id, total_calls_made')
      .eq('id', leadId)
      .maybeSingle();

    const repId = lead?.assigned_rep_id;

    // Idempotent upsert into sales_call_logs
    await supabaseAdmin.from('sales_call_logs').upsert(
      [
        {
          lead_id: leadId,
          rep_id: repId || leadId, // fallback if rep not yet assigned
          twilio_call_sid: callSid,
          call_status: callStatus,
          duration_seconds: durationSeconds,
          recording_url: recordingUrl,
          rep_notes: `Twilio call status: ${callStatus}`,
        },
      ],
      { onConflict: 'twilio_call_sid' }
    );

    // If call completed, increment total_calls_made and update last_contacted_at
    if (callStatus === 'completed') {
      const currentCalls = lead?.total_calls_made || 0;
      await supabaseAdmin
        .from('leads')
        .update({
          total_calls_made: currentCalls + 1,
          last_contacted_at: new Date().toISOString(),
          stage: 'CONTACTED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId);
    }

    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  } catch (err) {
    console.error('Twilio Voice Status Webhook error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
