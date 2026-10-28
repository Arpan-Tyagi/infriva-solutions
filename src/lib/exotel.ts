/**
 * @file src/lib/exotel.ts
 * @description Exotel click-to-call ("Connect two numbers") for the Sales workspace.
 *
 * Exotel first rings the rep's own phone (`From`), then bridges to the lead (`To`),
 * showing the company ExoPhone (`CallerId`) to the lead and recording the call.
 * When the call ends Exotel POSTs to `StatusCallback`; Exotel does not sign these
 * requests, so each callback URL carries an HMAC of our call-log id.
 *
 * Env:
 *   EXOTEL_SID, EXOTEL_API_KEY, EXOTEL_API_TOKEN   — Exotel dashboard → API settings
 *   EXOTEL_CALLER_ID                                 — your ExoPhone (virtual number)
 *   EXOTEL_SUBDOMAIN                                 — api.in.exotel.com (Mumbai, default) or api.exotel.com (Singapore)
 *   EXOTEL_CALLBACK_SECRET                           — any long random string
 */

import crypto from 'crypto';
import { safeTimingEqual } from '@/lib/crypto-safe';

export function isExotelConfigured() {
  return Boolean(
    process.env.EXOTEL_SID &&
      process.env.EXOTEL_API_KEY &&
      process.env.EXOTEL_API_TOKEN &&
      process.env.EXOTEL_CALLER_ID &&
      process.env.EXOTEL_CALLBACK_SECRET
  );
}

/** 91XXXXXXXXXX -> +91XXXXXXXXXX */
function toDialString(e164: string) {
  return e164.startsWith('+') ? e164 : `+${e164}`;
}

export function signCallLogId(callLogId: string) {
  return crypto
    .createHmac('sha256', process.env.EXOTEL_CALLBACK_SECRET || '')
    .update(callLogId)
    .digest('hex');
}

export function verifyCallLogSignature(callLogId: string, signature: string | null) {
  if (!process.env.EXOTEL_CALLBACK_SECRET || !signature) return false;
  return safeTimingEqual(signature, signCallLogId(callLogId));
}

export interface StartCallInput {
  agentPhoneE164: string;
  leadPhoneE164: string;
  statusCallbackUrl: string;
}

export async function startExotelCall({ agentPhoneE164, leadPhoneE164, statusCallbackUrl }: StartCallInput) {
  if (!isExotelConfigured()) {
    throw new Error('Exotel is not configured (EXOTEL_SID / API key / token / caller id / callback secret).');
  }

  const sid = process.env.EXOTEL_SID!;
  const subdomain = process.env.EXOTEL_SUBDOMAIN || 'api.in.exotel.com';
  const endpoint = `https://${subdomain}/v1/Accounts/${encodeURIComponent(sid)}/Calls/connect.json`;
  const auth = Buffer.from(`${process.env.EXOTEL_API_KEY}:${process.env.EXOTEL_API_TOKEN}`).toString('base64');

  const body = new URLSearchParams({
    From: toDialString(agentPhoneE164),
    To: toDialString(leadPhoneE164),
    CallerId: process.env.EXOTEL_CALLER_ID!,
    CallType: 'trans',
    Record: 'true',
    TimeLimit: '3600',
    StatusCallback: statusCallbackUrl,
    StatusCallbackContentType: 'application/json',
    'StatusCallbackEvents[0]': 'terminal',
  });

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Exotel rejected the call (${res.status}): ${text.slice(0, 300)}`);
  }

  const json = JSON.parse(text) as { Call?: { Sid?: string; Status?: string } };
  if (!json.Call?.Sid) throw new Error('Exotel response did not include a call Sid.');
  return { callSid: json.Call.Sid, status: (json.Call.Status || 'queued').toLowerCase() };
}

export interface ExotelCallStatus {
  callSid: string | null;
  status: string;
  durationSeconds: number;
  recordingUrl: string | null;
  endedAt: string | null;
}

/** Accepts both the JSON and the form-encoded callback shapes. */
export function parseExotelCallback(payload: Record<string, unknown>): ExotelCallStatus {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      const v = payload[k];
      if (v !== undefined && v !== null && v !== '') return String(v);
    }
    return null;
  };

  const duration = Number(get('ConversationDuration', 'DialCallDuration', 'Duration') || 0);
  return {
    callSid: get('CallSid', 'Sid'),
    status: (get('Status', 'CallStatus', 'DialCallStatus') || 'unknown').toLowerCase(),
    durationSeconds: Number.isFinite(duration) ? Math.max(0, Math.round(duration)) : 0,
    recordingUrl: get('RecordingUrl'),
    endedAt: get('EndTime', 'DateUpdated'),
  };
}
