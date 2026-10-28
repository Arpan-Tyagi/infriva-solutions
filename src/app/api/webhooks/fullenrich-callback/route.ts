/**
 * @file src/app/api/webhooks/fullenrich-callback/route.ts
 * @description FullEnrich v2 enrichment callback.
 *
 * FullEnrich does not sign webhooks, so the URL registered by
 * triggerFullEnrichBatch() carries FULLENRICH_CALLBACK_SECRET as `?token=`.
 * Enriched contact data only fills gaps: an email or phone the lead typed
 * themselves is never overwritten. A miss falls through to Apollo.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { normalizeIndianPhone } from '@/lib/phone';
import { safeTimingEqual } from '@/lib/crypto-safe';
import { enrichLeadWithApollo } from '@/lib/enrichment';

export async function POST(request: Request) {
  const secret = process.env.FULLENRICH_CALLBACK_SECRET;
  const token = new URL(request.url).searchParams.get('token');
  if (!secret || !token || !safeTimingEqual(token, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const contact = payload.data || payload.contact;
    const crmLeadId = contact?.custom?.crm_lead_id;
    if (!crmLeadId) {
      return NextResponse.json({ status: 'ignored: missing crm_lead_id' }, { status: 200 });
    }

    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('id, full_name, email, phone_e164, company_name, linkedin_url')
      .eq('id', crmLeadId)
      .maybeSingle();
    if (!lead) {
      return NextResponse.json({ status: 'ignored: unknown lead' }, { status: 200 });
    }

    const workEmail: string | undefined = contact.work_emails?.find((e: { email?: string }) => e?.email)?.email;
    const phoneCandidate: string | undefined = contact.phones?.find((p: { phone?: string }) => p?.phone)?.phone;
    const normalizedPhone = phoneCandidate ? normalizeIndianPhone(phoneCandidate) : null;
    const foundSomething = Boolean(workEmail || normalizedPhone?.isValid || contact.linkedin_url || contact.company_name);

    if (!foundSomething) {
      await supabaseAdmin
        .from('leads')
        .update({ enrichment_status: 'FAILED', enrichment_payload: { fullenrich: payload } })
        .eq('id', lead.id);
      const apollo = await enrichLeadWithApollo(lead);
      return NextResponse.json({ success: true, crmLeadId, fallback: 'apollo', apolloMatched: apollo.success }, { status: 200 });
    }

    const updates: Record<string, unknown> = {
      enrichment_payload: { fullenrich: payload },
      enrichment_status: 'SUCCESS',
    };
    if (!lead.email && workEmail) updates.email = workEmail.toLowerCase().trim();
    if (!lead.phone_e164 && normalizedPhone?.isValid) updates.phone_e164 = normalizedPhone.e164;
    if (!lead.linkedin_url && contact.linkedin_url) updates.linkedin_url = contact.linkedin_url;
    if (!lead.company_name && contact.company_name) updates.company_name = contact.company_name;

    const { error } = await supabaseAdmin.from('leads').update(updates).eq('id', lead.id);
    if (error) throw error;

    return NextResponse.json({ success: true, crmLeadId }, { status: 200 });
  } catch (err) {
    console.error('FullEnrich callback error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
