/**
 * @file src/lib/twilio.ts
 * @description Twilio Voice Telemetry & Outbound Dialing Subsystem
 */

import crypto from 'crypto';
import { safeTimingEqual } from '@/lib/crypto-safe';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.infrivasolutions.com';

/**
 * Initiates an outbound voice call from a sales representative to a lead
 */
export async function initiateOutboundCall(leadId: string, leadPhone: string, repPhone: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return {
      success: false,
      callSid: `mock_call_${Date.now()}`,
      mock: true,
      message: 'Twilio credentials not configured; simulated call initiated.',
    };
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`;
  const statusCallbackUrl = `${SITE_URL}/api/webhooks/twilio/voice-status?lead_id=${leadId}`;

  const params = new URLSearchParams();
  params.append('To', leadPhone.startsWith('+') ? leadPhone : `+${leadPhone}`);
  params.append('From', TWILIO_PHONE_NUMBER || repPhone);
  params.append('Url', `https://twimlets.com/holdmusic?Bucket=com.twilio.music.ambient`);
  params.append('StatusCallback', statusCallbackUrl);
  params.append('StatusCallbackMethod', 'POST');
  params.append('Record', 'true');

  try {
    const authHeader = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: err };
    }

    const json = await response.json();
    return { success: true, callSid: json.sid, status: json.status };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Validates Twilio HTTP request signature
 */
export function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signatureHeader: string | null
): boolean {
  if (!TWILIO_AUTH_TOKEN) return true; // dev bypass
  if (!signatureHeader) return false;

  // Twilio signature construction: URL + sorted key-value pairs
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }

  const expectedSignature = crypto
    .createHmac('sha1', TWILIO_AUTH_TOKEN)
    .update(Buffer.from(data, 'utf-8'))
    .digest('base64');

  return safeTimingEqual(expectedSignature, signatureHeader);
}
