/**
 * @file src/app/api/webhooks/website-lead/route.ts
 * @description Direct Ingestion Gateway for infrivasolutions.com Leads
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { normalizeIndianPhone } from '@/lib/phone';
import { InfrivaServiceTier } from '@/types/crm';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

function mapServiceToTier(serviceStr: string): InfrivaServiceTier {
  const s = serviceStr.toLowerCase();
  if (s.includes('crm') || s.includes('custom crm')) return 'CUSTOM_CRM';
  if (s.includes('seo') || s.includes('geo')) return 'FULL_STACK_SEO_GEO';
  if (s.includes('paid') || s.includes('ad') || s.includes('meta') || s.includes('google ads')) return 'PAID_ADS_MGMT';
  if (s.includes('whatsapp') || s.includes('retention')) return 'WHATSAPP_RETENTION';
  if (s.includes('content') || s.includes('video') || s.includes('production')) return 'PREMIUM_CONTENT';
  if (s.includes('social') || s.includes('smm')) return 'SOCIAL_MEDIA_MGMT';
  return 'WEB_DEV_UIUX';
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // 1. Honeypot Anti-Spam Check
    if (payload._hp_website) {
      return NextResponse.json({ success: true, message: 'Received' }, { status: 200 });
    }

    const fullName = String(payload.fullName || payload.name || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const rawPhone = String(payload.phone || '').trim();
    const company = String(payload.companyName || payload.company || '').trim();
    const rawService = String(payload.serviceRequired || payload.service || 'Web Development');
    const budget = String(payload.budgetBracket || payload.budget || '');
    const details = String(payload.projectDetails || payload.details || '');
    const attributionTouch = payload.attributionTouch || {};

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    // Validate email format and prevent PostgREST filter injection
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    // 2. Strict Phone Normalization (E.164 91XXXXXXXXXX)
    const phoneResult = normalizeIndianPhone(rawPhone);
    if (!phoneResult.isValid) {
      return NextResponse.json(
        { error: 'Invalid Indian phone number. Expected 10 digits or 91XXXXXXXXXX starting with 6-9.' },
        { status: 400 }
      );
    }
    const phone_e164 = phoneResult.e164;

    const serviceTier = mapServiceToTier(rawService);

    // 3. Log Inbound Webhook Event Idempotently
    const externalEventId = `web_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    await supabaseAdmin.from('inbound_webhook_logs').insert([
      {
        source: 'WEBSITE_FORM',
        external_event_id: externalEventId,
        raw_payload: payload,
        processed: true,
      },
    ]);

    // 4. Idempotent composite lookup against active leads and organizations
    const { data: existingLead } = await supabaseAdmin
      .from('leads')
      .select('id, stage, assigned_rep_id')
      .or(`email.eq.${email},phone_e164.eq.${phone_e164}`)
      .limit(1)
      .maybeSingle();

    let leadId = existingLead?.id;

    if (existingLead) {
      // Update existing lead record with latest inquiry and touchpoint
      await supabaseAdmin
        .from('leads')
        .update({
          project_details: details ? `${details}\n[Recent Inquiry: ${new Date().toISOString()}]` : details,
          attribution_touch: attributionTouch,
          interested_service: serviceTier,
          budget_bracket: budget || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLead.id);
    } else {
      // Insert new lead record with initial 15-minute response SLA timer
      const slaFirstResponseDueAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const { data: newLead, error: insertError } = await supabaseAdmin
        .from('leads')
        .insert([
          {
            source_channel: 'WEBSITE_FORM',
            full_name: fullName,
            email,
            phone_e164,
            company_name: company || null,
            interested_service: serviceTier,
            budget_bracket: budget || null,
            project_details: details || null,
            attribution_touch: attributionTouch,
            stage: 'NEW',
            sla_first_response_due_at: slaFirstResponseDueAt,
            enrichment_status: 'PENDING',
          },
        ])
        .select('id')
        .single();

      if (insertError) {
        console.error('Lead insertion error:', insertError);
        return NextResponse.json({ error: 'Failed to record lead in CRM database.' }, { status: 500 });
      }

      leadId = newLead?.id;
    }

    // 5. Send Notification Emails in parallel
    if (process.env.RESEND_API_KEY) {
      const adminHtml = `
        <h2>New Lead Received on Infriva Solutions</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone_e164}</p>
        <p><strong>Company:</strong> ${company || 'N/A'}</p>
        <p><strong>Service Tier:</strong> ${serviceTier}</p>
        <p><strong>Budget:</strong> ${budget || 'N/A'}</p>
        <p><strong>Details:</strong> ${details || 'N/A'}</p>
        <p><strong>Attribution:</strong> <pre>${JSON.stringify(attributionTouch, null, 2)}</pre></p>
      `;

      Promise.allSettled([
        resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Infriva Solutions <onboarding@resend.dev>',
          to: 'info@infrivasolutions.com',
          subject: `[Lead Alert] ${fullName} - ${serviceTier}`,
          html: adminHtml,
        }),
        resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Infriva Solutions <onboarding@resend.dev>',
          to: email,
          subject: 'We have received your consultation request — Infriva Solutions',
          html: `
            <p>Dear ${fullName},</p>
            <p>Thank you for consulting Infriva Solutions regarding <strong>${serviceTier}</strong>.</p>
            <p>Our engineering and growth team has received your brief and is conducting a preliminary technical audit. A Senior Technical Architect will connect with you within 15 minutes.</p>
            <br/>
            <p>Warm regards,<br/><strong>Infriva Solutions Engineering Team</strong><br/>New Delhi, India</p>
          `,
        }),
      ]).catch((err) => console.warn('Email dispatch warning:', err));
    }

    return NextResponse.json({
      success: true,
      leadId,
      phone_e164,
      serviceTier,
    });
  } catch (error) {
    console.error('Website lead route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
