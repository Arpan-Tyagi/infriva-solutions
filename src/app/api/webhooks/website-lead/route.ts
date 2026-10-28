/**
 * @file src/app/api/webhooks/website-lead/route.ts
 * @description JSON lead endpoint for landing pages and partner sites.
 *
 * The main infrivasolutions.com contact form posts to /api/contact, which uses
 * the same shared intake. Both accept a 63-day `attributionTouch`
 * (UTMs, gclid / gbraid / wbraid, ad consent) captured client-side.
 */

import { NextResponse } from 'next/server';
import { ingestLead } from '@/lib/lead-intake';

const rateLimit = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const entry = rateLimit.get(key);
  if (!entry || entry.expiresAt < now) {
    if (rateLimit.size > 1000) rateLimit.clear();
    rateLimit.set(key, { count: 1, expiresAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many submissions. Please wait a minute.' }, { status: 429 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields; pretend success.
  if (payload._hp_website) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const attribution =
    payload.attributionTouch && typeof payload.attributionTouch === 'object'
      ? (payload.attributionTouch as Record<string, unknown>)
      : null;

  const result = await ingestLead({
    channel: 'WEBSITE_FORM',
    fullName: str(payload.fullName) || str(payload.name),
    email: str(payload.email),
    phone: str(payload.phone),
    company: str(payload.companyName) || str(payload.company),
    service: str(payload.serviceRequired) || str(payload.service),
    budget: str(payload.budgetBracket) || str(payload.budget),
    details: str(payload.projectDetails) || str(payload.details),
    attribution,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ success: true, leadId: result.leadId });
}
