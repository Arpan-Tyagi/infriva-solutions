"use client";

import { useEffect } from "react";
import { extractAttributionFromParams, persistClientAttribution } from "@/lib/attribution";

/**
 * Stores the latest paid/UTM touch (utm_*, gclid, gbraid, wbraid) for 63 days so
 * the contact form can attach it to the lead. A newer touch replaces the old one.
 */
export function AttributionCapture() {
  useEffect(() => {
    const touch = extractAttributionFromParams(new URLSearchParams(window.location.search));
    if (touch) {
      persistClientAttribution({ ...touch, ad_consent_recorded_at: new Date().toISOString() });
    }
  }, []);

  return null;
}
