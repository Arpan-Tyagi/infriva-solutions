/**
 * @file src/lib/attribution.ts
 * @description 63-Day Atomic Attribution Touch & Advertising Measurement Consent
 *
 * Implements Infriva Solutions' client-side and server-side attribution state machine.
 * Stores UTM parameters, Google Click IDs (gclid, gbraid, wbraid), and explicit ad consent.
 * Enforces atomic replacement: if a returning prospect clicks a new ad or campaign,
 * replaces the entire attribution touch rather than merging stale identifiers.
 */

import { AttributionTouch } from '@/types/crm';

export const ATTR_STORAGE_KEY = 'infriva_attribution_touch_v1';
export const ATTR_MAX_AGE_DAYS = 63;

/**
 * Extracts attribution parameters from a URL or query object.
 */
export function extractAttributionFromParams(params: URLSearchParams | Record<string, string>): AttributionTouch | null {
  const getParam = (key: string): string | undefined => {
    if (params instanceof URLSearchParams) {
      return params.get(key) || undefined;
    }
    return params[key] || undefined;
  };

  const utm_source = getParam('utm_source');
  const utm_medium = getParam('utm_medium');
  const utm_campaign = getParam('utm_campaign');
  const utm_term = getParam('utm_term');
  const utm_content = getParam('utm_content');
  const gclid = getParam('gclid');
  const gbraid = getParam('gbraid');
  const wbraid = getParam('wbraid');

  // If no marketing params present, return null
  if (!utm_source && !utm_medium && !utm_campaign && !gclid && !gbraid && !wbraid) {
    return null;
  }

  return {
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
    gclid,
    gbraid,
    wbraid,
    ad_consent_source: 'external_form_explicit_v1',
  };
}

/**
 * Persists attribution touch into browser localStorage as an atomic object with 63-day expiry.
 */
export function persistClientAttribution(touch: AttributionTouch): void {
  if (typeof window === 'undefined') return;

  const payload = {
    touch,
    savedAt: Date.now(),
    expiresAt: Date.now() + ATTR_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  };

  try {
    localStorage.setItem(ATTR_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to persist attribution touch to localStorage:', e);
  }
}

/**
 * Retrieves the stored attribution touch, verifying it has not exceeded the 63-day window.
 */
export function getStoredClientAttribution(): AttributionTouch | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(ATTR_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.expiresAt || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(ATTR_STORAGE_KEY);
      return null;
    }

    return parsed.touch || null;
  } catch {
    return null;
  }
}
