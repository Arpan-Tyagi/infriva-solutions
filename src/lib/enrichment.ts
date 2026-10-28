/**
 * @file src/lib/enrichment.ts
 * @description Waterfall Lead Enrichment Subsystem (FullEnrich v2 & Apollo.io v1)
 *
 * Implements batch enrichment with string-cast metadata, silentFail tolerance,
 * and automatic credit cost optimization.
 */

import { supabaseAdmin } from '@/lib/supabase-admin';

const FULLENRICH_API_KEY = process.env.FULLENRICH_API_KEY || '';
const APOLLO_API_KEY = process.env.APOLLO_API_KEY || '';
const CRM_WEBHOOK_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.infrivasolutions.com';

export interface LeadForEnrichment {
  id: string;
  full_name: string;
  email: string;
  company_name?: string;
  linkedin_url?: string;
}

/**
 * Triggers batch contact enrichment through FullEnrich API v2.
 * CRITICAL RULE: All values inside the 'custom' payload object MUST be cast to string.
 */
export async function triggerFullEnrichBatch(leads: LeadForEnrichment[]) {
  if (!FULLENRICH_API_KEY || leads.length === 0) {
    return { success: false, reason: 'Missing FullEnrich key or empty batch' };
  }

  // FullEnrich limits bulk payloads to 100 contacts max per request
  const CHUNK_SIZE = 100;
  const leadChunks: LeadForEnrichment[][] = [];
  for (let i = 0; i < leads.length; i += CHUNK_SIZE) {
    leadChunks.push(leads.slice(i, i + CHUNK_SIZE));
  }

  const batchIds: string[] = [];

  for (const chunk of leadChunks) {
    const data = chunk.map((lead) => {
      const parts = (lead.full_name || '').split(' ');
      const first_name = parts[0] || '';
      const last_name = parts.slice(1).join(' ') || '';
      const domain = lead.email.includes('@') ? lead.email.split('@')[1] : undefined;

      return {
        first_name,
        last_name,
        domain,
        company_name: lead.company_name,
        linkedin_url: lead.linkedin_url,
        // String-cast internal metadata ID:
        custom: {
          crm_lead_id: String(lead.id),
        },
      };
    });

    try {
      const response = await fetch('https://app.fullenrich.com/api/v2/contact/enrich/bulk?silentFail=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${FULLENRICH_API_KEY}`,
        },
        body: JSON.stringify({
          name: `Infriva Batch ${Date.now()}`,
          webhook_url: `${CRM_WEBHOOK_BASE_URL}/api/webhooks/fullenrich-callback`,
          webhook_events: ['contact_finished', 'enrichment_finished'],
          enrich_fields: ['contact.work_emails', 'contact.phones'],
          data,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('FullEnrich Batch Error:', response.status, errText);
        return { success: false, error: errText };
      }

      const resJson = await response.json();
      batchIds.push(resJson.id || resJson.batch_id);
    } catch (err: any) {
      console.error('FullEnrich fetch exception:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true, batchIds: batchIds.length === 1 ? batchIds[0] : batchIds };
}

/**
 * Single-lead fallback enrichment using Apollo.io People Match API
 */
export async function enrichLeadWithApollo(lead: LeadForEnrichment) {
  if (!APOLLO_API_KEY) return { success: false, reason: 'Missing Apollo API key' };

  try {
    const parts = (lead.full_name || '').split(' ');
    const params = new URLSearchParams({
      api_key: APOLLO_API_KEY,
      email: lead.email,
      first_name: parts[0] || '',
      last_name: parts.slice(1).join(' ') || '',
      organization_name: lead.company_name || '',
    });

    const response = await fetch(`https://api.apollo.io/api/v1/people/match?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      return { success: false, error: response.statusText };
    }

    const body = await response.json();
    const person = body.person;

    if (person) {
      await supabaseAdmin
        .from('leads')
        .update({
          enrichment_payload: person,
          enrichment_status: 'SUCCESS',
          company_name: lead.company_name || person.organization?.name,
          linkedin_url: lead.linkedin_url || person.linkedin_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id);

      return { success: true, person };
    }

    return { success: false, reason: 'No match found' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
