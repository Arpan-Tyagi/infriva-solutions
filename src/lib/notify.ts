/**
 * @file src/lib/notify.ts
 * @description Internal team alerts over WhatsApp (Cloud API utility template) and email (Resend).
 *
 * WhatsApp needs a pre-approved utility template because alerts are business-initiated.
 * Create one in WhatsApp Manager, e.g. name `crm_alert`, language `en`, body:
 *   "Infriva CRM: {{1}}"
 * and set WHATSAPP_CRM_ALERT_TEMPLATE=crm_alert (WHATSAPP_CRM_ALERT_LANG defaults to `en`).
 * Each channel is best-effort and reported independently; one failing never blocks the other.
 */

import { Resend } from 'resend';
import { sendWhatsAppTemplate } from '@/lib/meta';

export interface AlertRecipient {
  full_name: string;
  email?: string | null;
  phone_e164?: string | null;
}

export interface AlertMessage {
  subject: string;
  /** One line, used as the WhatsApp template parameter and email preview. */
  text: string;
  /** Absolute link into the CRM, appended to both channels. */
  link?: string;
}

export interface AlertResult {
  whatsapp: 'sent' | 'skipped' | 'failed';
  email: 'sent' | 'skipped' | 'failed';
  errors: string[];
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.infrivasolutions.com').replace(/\/$/, '');

export function crmLink(path: string) {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendTeamAlert(to: AlertRecipient, message: AlertMessage): Promise<AlertResult> {
  const result: AlertResult = { whatsapp: 'skipped', email: 'skipped', errors: [] };
  const line = message.link ? `${message.text} ${message.link}` : message.text;

  const template = process.env.WHATSAPP_CRM_ALERT_TEMPLATE;
  if (template && to.phone_e164 && process.env.META_ACCESS_TOKEN && process.env.META_WHATSAPP_PHONE_ID) {
    try {
      await sendWhatsAppTemplate(to.phone_e164, template, process.env.WHATSAPP_CRM_ALERT_LANG || 'en', [
        // WhatsApp rejects template params containing newlines or 4+ consecutive spaces.
        { type: 'body', parameters: [{ type: 'text', text: line.replace(/\s+/g, ' ').slice(0, 1000) }] },
      ]);
      result.whatsapp = 'sent';
    } catch (err) {
      result.whatsapp = 'failed';
      result.errors.push(`whatsapp: ${(err as Error).message}`);
    }
  }

  if (process.env.RESEND_API_KEY && to.email) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Infriva CRM <onboarding@resend.dev>',
        to: to.email,
        subject: message.subject.replace(/[\r\n]/g, ' '),
        html: `
          <div style="font-family: sans-serif; max-width: 560px;">
            <p>Hi ${escapeHtml(to.full_name.split(' ')[0] || to.full_name)},</p>
            <p>${escapeHtml(message.text)}</p>
            ${message.link ? `<p><a href="${escapeHtml(message.link)}">Open in Infriva CRM →</a></p>` : ''}
          </div>`,
      });
      if (error) throw new Error(error.message);
      result.email = 'sent';
    } catch (err) {
      result.email = 'failed';
      result.errors.push(`email: ${(err as Error).message}`);
    }
  }

  if (result.errors.length) console.warn('[notify] Partial alert failure:', result.errors);
  return result;
}
