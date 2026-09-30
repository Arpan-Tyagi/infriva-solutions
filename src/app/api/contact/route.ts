import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';

// Initialize the Resend SDK with the API key
const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory sliding window rate limiter
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(ip: string, limit = 5, windowMs = 60000): boolean {
  const now = Date.now();
  if (rateLimitMap.size > 1000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.expiresAt < now) rateLimitMap.delete(k);
    }
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || entry.expiresAt < now) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return false;
  }
  if (entry.count >= limit) {
    return true;
  }
  entry.count += 1;
  return false;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: Request) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     '127.0.0.1';
    if (isRateLimited(clientIp)) {
      return NextResponse.json({ error: 'Too many submissions. Please wait a minute and try again.' }, { status: 429 });
    }

    const data = await request.json();

    // Honeypot trap: if filled by a spam bot, silently return success without taking action
    if (data._hp_website) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Clean raw strings without pre-encoding HTML entities for database storage
    const cleanString = (val: unknown) => typeof val === 'string' ? val.trim() : '';
    const name = cleanString(data.name);
    const company = cleanString(data.company);
    const email = cleanString(data.email);
    const phone = cleanString(data.phone);
    const service = cleanString(data.service || data['Service Required'] || data.service_required);
    const budget = cleanString(data.budget || data['Budget Range'] || data.budget_range);
    const details = cleanString(data.details);

    // Validate required fields
    if (!name || !email || !service) {
      return NextResponse.json(
        { error: 'Please provide all required fields (name, email, service).' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // 1. Save clean raw strings into Supabase leads table
    const { error: dbError } = await supabase
      .from('leads')
      .insert([
        {
          name,
          company,
          email,
          phone,
          service,
          budget,
          details
        }
      ]);

    if (dbError) {
      console.error('Supabase Error:', dbError);
      return NextResponse.json(
        { error: 'Failed to record your inquiry. Please try again.' },
        { status: 500 }
      );
    }

    // 2. Dispatch Emails in Parallel with strict HTML entity escaping for template strings
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Infriva Solutions <onboarding@resend.dev>';
    const adminEmailPromise = resend.emails.send({
      from: fromAddress,
      to: 'info@infrivasolutions.com',
      replyTo: email,
      subject: `New Lead: ${name} from ${company || 'Direct'}`.replace(/[\r\n]/g, ''),
      html: `
        <h2>New Inquiry from Infriva Solutions Website</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company || 'N/A')}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || 'N/A')}</p>
        <p><strong>Service Required:</strong> ${escapeHtml(service)}</p>
        <p><strong>Budget Range:</strong> ${escapeHtml(budget || 'N/A')}</p>
        <h3>Project Details:</h3>
        <p style="white-space: pre-wrap;">${escapeHtml(details || 'No details provided.')}</p>
      `,
    }).catch(err => {
      console.error('Resend Admin Email Error:', err);
      return null;
    });

    const userEmailPromise = resend.emails.send({
      from: fromAddress,
      to: email,
      subject: `Thank you for contacting Infriva Solutions`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #000;">
          <h2 style="font-weight: 500;">Hello ${escapeHtml(name)},</h2>
          <p>Thank you for submitting your inquiry regarding <strong>${escapeHtml(service)}</strong>.</p>
          <p>We have successfully received your project details and our team is currently reviewing them. One of our digital architects will reach out to you shortly to orchestrate the next steps.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The Infriva Solutions Team</strong></p>
          <p style="color: #666; font-size: 12px; margin-top: 24px;">This is an automated confirmation message. Please do not reply directly to this email.</p>
        </div>
      `,
    }).catch(err => {
      console.error('Resend User Email Error:', err);
      return null;
    });

    // Wait for email dispatches without cascading crash
    const [adminResult, userResult] = await Promise.allSettled([adminEmailPromise, userEmailPromise]);
    if (adminResult.status === 'fulfilled' && adminResult.value && 'error' in adminResult.value && adminResult.value.error) {
      console.error('Resend Admin Email API Error:', adminResult.value.error);
    }
    if (userResult.status === 'fulfilled' && userResult.value && 'error' in userResult.value && userResult.value.error) {
      console.error('Resend User Email API Error:', userResult.value.error);
    }

    // 3. Send Auto-Reply WhatsApp Message to the User (if phone is provided)
    if (phone) {
      // Strip out non-numeric characters for the WhatsApp API
      const cleanPhone = phone.replace(/\D/g, '');
      
      if (cleanPhone.length >= 10) {
        const whatsappMessage = `Hello ${name},\n\nThank you for reaching out to Infriva Solutions regarding ${service}. We have received your inquiry and our team is reviewing your project details. We will be in touch shortly.\n\n- The Infriva Solutions Team`;
        
        try {
          // In production, outbound messages outside 24h window require a pre-approved Meta Template.
          console.log('Mocking WhatsApp outbound to', cleanPhone, 'Message:', whatsappMessage);
        } catch (waError) {
          console.error("Failed to initiate WhatsApp message:", waError);
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
