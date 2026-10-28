/**
 * @file src/lib/conversions.ts
 * @description Closed-Loop Server-Side Conversion Attribution (Meta CAPI & Google Offline)
 *
 * Dispatches conversion events when deal transitions to QUALIFIED or WON.
 * Employs SHA-256 hashing for user data and supports test_event_code for QA inspection.
 */

import crypto from 'crypto';

const META_PIXEL_ID = process.env.META_PIXEL_ID || '';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || '';

function hashSha256(val: string): string {
  return crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex');
}

export interface ConversionPayload {
  eventName: 'Lead' | 'QualifiedLead' | 'Purchase';
  leadId: string;
  email?: string | null;
  phone_e164?: string | null;
  valueInr?: number;
  leadgen_id?: string;
  gclid?: string;
  sourceUrl?: string;
}

/**
 * Dispatches server-side conversion event to Meta Conversions API (CAPI) v22.0
 */
export async function sendMetaConversionEvent(payload: ConversionPayload) {
  if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
    return {
      success: false,
      skipped: true,
      message: 'META_PIXEL_ID or META_ACCESS_TOKEN not configured; conversion not sent.',
    };
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  // Deterministic id: a retried job is deduplicated by Meta instead of double-counted.
  const eventId = `capi_${payload.leadId}_${payload.eventName.toLowerCase()}`;

  const userData: Record<string, any> = {};
  if (payload.email) userData.em = [hashSha256(payload.email)];
  if (payload.phone_e164) userData.ph = [hashSha256(payload.phone_e164)];

  if (payload.leadgen_id) {
    userData.lead_id = payload.leadgen_id;
  }

  const eventData: Record<string, any> = {
    event_name: payload.eventName,
    event_time: currentTimestamp,
    event_id: eventId,
    event_source_url: payload.sourceUrl || 'https://www.infrivasolutions.com',
    action_source: 'system_generated',
    user_data: userData,
    custom_data: {
      currency: 'INR',
      value: payload.valueInr || (payload.eventName === 'Purchase' ? 80000 : 0),
    },
  };

  const bodyPayload: Record<string, any> = {
    data: [eventData],
  };

  // Support test_event_code for QA debugging in Meta Events Manager Test Events tab
  if (META_TEST_EVENT_CODE) {
    bodyPayload.test_event_code = META_TEST_EVENT_CODE;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v22.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Meta CAPI Error:', res.status, errText);
      return { success: false, error: errText };
    }

    const resJson = await res.json();
    return { success: true, eventsReceived: resJson.events_received, eventId };
  } catch (err: any) {
    console.error('Meta CAPI Exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Closed-loop feedback dispatcher triggered on CRM deal stage transitions
 */
export async function dispatchClosedLoopConversion(payload: ConversionPayload) {
  // Fire Meta CAPI
  const metaResult = await sendMetaConversionEvent(payload);

  return {
    meta: metaResult,
    // Google Ads offline conversion upload (ConversionUploadService) is not wired yet.
    googleOffline: {
      success: false,
      skipped: true,
      message: 'Google Ads offline conversion upload is not implemented yet.',
      gclid: payload.gclid,
    },
  };
}
