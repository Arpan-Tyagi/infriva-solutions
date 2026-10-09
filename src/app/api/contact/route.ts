/**
 * @file src/app/api/contact/route.ts
 * @description Lead Intake & Parallel Notification Gateway
 *
 * This Route Handler processes inquiries submitted through the Infriva Contact page (/contact).
 *
 * Pipeline & Security Architecture:
 * 1. Sliding Window IP Rate Limiting:
 *    - Guards against brute-force flooding and spam exhaustion.
 *    - Allows a maximum of 5 submissions per minute per client IP.
 *    - Features automatic stale cache cleanup when map capacity exceeds 1,000 entries.
 *
 * 2. Honeypot Anti-Bot Defense:
 *    - An invisible field (`_hp_website`) is rendered in the client form, obscured with CSS.
 *    - Human users will never see or populate it; automated bots routinely fill all inputs.
 *    - If populated, the handler immediately returns a mock HTTP 200 without executing DB or email tasks.
 *
 * 3. Data Integrity & XSS Prevention:
 *    - Raw UTF-8 strings are trimmed and saved directly into Supabase without pre-encoding.
 *    - HTML entity escaping (`escapeHtml`) is strictly applied during string interpolation into
 *      HTML email templates, preventing Cross-Site Scripting (XSS) while keeping database text pristine.
 *    - CRLF characters (`\r`, `\n`) are stripped from email subjects to defeat SMTP header injection.
 *
 * 4. Dual-Notification Dispatch:
 *    - Sends parallel transactional emails via the Resend API:
 *      a. Admin notification to `info@infrivasolutions.com` with full lead brief.
 *      b. Client confirmation receipt assuring rapid response from agency leadership.
 *    - Employs `Promise.allSettled()` so an email dispatch hiccup does not fail the primary DB record.
 */

import { NextResponse } from 'next/server';
import { PostHog } from 'posthog-node';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppTemplate } from '@/lib/meta';

// Initialize the Resend transactional email SDK
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * In-memory sliding window rate limiter state.
 * Maps Client IP -> { submission count, timestamp when window expires }
 */
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

/**
 * Evaluates whether an IP address has exceeded the allowed request threshold.
 *
 * @param ip - Client IP address extracted from request headers
 * @param limit - Max requests permitted in the window (default: 5)
 * @param windowMs - Duration of the rolling window in milliseconds (default: 60,000ms / 1 min)
 * @returns boolean - True if client should be throttled (HTTP 429), false if permitted
 */
function isRateLimited(ip: string, limit = 5, windowMs = 60000): boolean {
  const now = Date.now();
  
  // Evict expired entries to prevent memory leak when map grows large
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

/**
 * Escapes dangerous HTML characters to prevent XSS attacks in email templates.
 *
 * @param str - The raw user input string
 * @returns Sanitized string with HTML entities replaced
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * POST Handler: Process Lead Submission
 */
export async function POST(request: Request) {
  try {
    // 1. Resolve client IP address for rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     '127.0.0.1';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please wait a minute and try again.' }, 
        { status: 429 }
      );
    }

    const data = await request.json();

    // 2. Honeypot Validation: Neutralize automated form scrapers
    if (data._hp_website) {
      // Return synthetic success so spambots believe their submission went through
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // 3. Extract and sanitize raw input fields
    const cleanString = (val: unknown) => typeof val === 'string' ? val.trim() : '';
    const name = cleanString(data.name);
    const company = cleanString(data.company);
    const email = cleanString(data.email);
    const phone = cleanString(data.phone);
    const service = cleanString(data.service || data['Service Required'] || data.service_required);
    const budget = cleanString(data.budget || data['Budget Range'] || data.budget_range);
    const details = cleanString(data.details);

    // 4. Validate mandatory fields
    if (!name || !email || !service) {
      return NextResponse.json(
        { error: 'Please provide all required fields (name, email, service).' },
        { status: 400 }
      );
    }

    // Validate email format with standard RFC regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // 5. Store clean raw data into Supabase 'leads' table
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

    // Handle database connection or insertion errors
    if (dbError) {
      console.error('Supabase Error:', dbError);
      return NextResponse.json(
        { error: 'Failed to record your inquiry. Please try again.' },
        { status: 500 }
      );
    }

    // 6. Dispatch parallel transactional emails via Resend
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Infriva Solutions <onboarding@resend.dev>';
    
    // Admin notification email promise
    const adminEmailPromise = resend.emails.send({
      from: fromAddress,
      to: 'info@infrivasolutions.com',
      replyTo: email,
      // Strip CRLF to prevent email header injection attacks
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

    // Client confirmation receipt promise
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

    // Await email dispatches gracefully using Promise.allSettled
    const [adminResult, userResult] = await Promise.allSettled([adminEmailPromise, userEmailPromise]);
    if (adminResult.status === 'fulfilled' && adminResult.value && 'error' in adminResult.value && adminResult.value.error) {
      console.error('Resend Admin Email API Error:', adminResult.value.error);
    }
    if (userResult.status === 'fulfilled' && userResult.value && 'error' in userResult.value && userResult.value.error) {
      console.error('Resend User Email API Error:', userResult.value.error);
    }

    // 7. WhatsApp Lead Notification (Optional Hook)
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length >= 10) {
        try {
          // Send outbound notification hook using Meta Graph API (Must use template outside 24h window)
          await sendWhatsAppTemplate(cleanPhone, 'lead_confirmation', 'en_US', [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: name }
              ]
            }
          ]);
        } catch (waError) {
          console.error("Failed to initiate WhatsApp message:", waError);
        }
      }
    }

        // 8. Capture PostHog Event for Contact Form Submission
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      const ph = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
      });
      ph.capture({
        distinctId: email,
        event: 'contact_form_submitted',
        properties: {
          service: service,
          budget: budget,
          company_provided: !!company,
          phone_provided: !!phone
        }
      });
      await ph.shutdown();
    }

    // 9. Return success response to client form
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Contact Route Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
