/**
 * @file src/app/api/webhooks/fullenrich-callback/route.ts
 * @description Webhook Receiver for Asynchronous FullEnrich v2 Results
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { normalizeIndianPhone } from '@/lib/phone';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const event = payload.event;
    const contact = payload.data || payload.contact;

    if (!contact) {
      return NextResponse.json({ status: 'ignored: no contact data' }, { status: 200 });
    }

    // Extract our custom string-cast internal lead ID
    const crmLeadId = contact.custom?.crm_lead_id;
    if (!crmLeadId) {
      return NextResponse.json({ status: 'ignored: missing crm_lead_id' }, { status: 200 });
    }

    const updates: Record<string, any> = {
      enrichment_payload: payload,
      enrichment_status: 'SUCCESS',
      updated_at: new Date().toISOString(),
    };

    // Extract verified work emails if available
    const workEmails = contact.work_emails || [];
    if (workEmails.length > 0 && workEmails[0].email) {
      updates.email = workEmails[0].email.toLowerCase().trim();
    }

    // Extract verified phone numbers if available
    const phones = contact.phones || [];
    if (phones.length > 0 && phones[0].phone) {
      const norm = normalizeIndianPhone(phones[0].phone);
      if (norm.isValid) updates.phone_e164 = norm.e164;
    }

    if (contact.linkedin_url) updates.linkedin_url = contact.linkedin_url;
    if (contact.company_name) updates.company_name = contact.company_name;

    await supabaseAdmin.from('leads').update(updates).eq('id', crmLeadId);

    return NextResponse.json({ success: true, crmLeadId }, { status: 200 });
  } catch (err) {
    console.error('FullEnrich callback error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
