import type { InfrivaServiceTier, LeadSourceChannel, LeadStage, QuotationStatus } from '@/types/crm';

export const QUEUE_LEAD_COLUMNS =
  'id, full_name, company_name, email, phone_e164, phone_raw, source_channel, interested_service, budget_bracket, stage, ' +
  'assigned_rep_id, sla_first_response_due_at, first_responded_at, sla_breached, total_calls_made, last_contacted_at, ' +
  'last_inquiry_at, next_follow_up_at, inquiry_count, is_existing_client, last_response_summary, created_at';

export interface QueueLead {
  id: string;
  full_name: string;
  company_name: string | null;
  email: string | null;
  phone_e164: string | null;
  phone_raw: string | null;
  source_channel: LeadSourceChannel;
  interested_service: InfrivaServiceTier;
  budget_bracket: string | null;
  stage: LeadStage;
  assigned_rep_id: string | null;
  sla_first_response_due_at: string | null;
  first_responded_at: string | null;
  sla_breached: boolean;
  total_calls_made: number;
  last_contacted_at: string | null;
  last_inquiry_at: string | null;
  next_follow_up_at: string | null;
  inquiry_count: number;
  is_existing_client: boolean;
  last_response_summary: string | null;
  created_at: string;
}

export interface RepOption {
  id: string;
  full_name: string;
  is_active: boolean;
}

export interface PendingApproval {
  id: string;
  lead_id: string;
  quote_number: string;
  total_inr: number;
  submitted_at: string | null;
  lead_name: string;
  rep_name: string | null;
}

export interface QuoteLineItem {
  description: string;
  qty: number;
  unit_price_inr: number;
}

export interface LeadQuote {
  id: string;
  quote_number: string;
  title: string | null;
  status: QuotationStatus;
  service_items: QuoteLineItem[];
  subtotal_inr: number;
  discount_inr: number;
  gst_rate: number;
  tax_inr: number;
  total_inr: number;
  notes: string | null;
  review_note: string | null;
  created_by: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface LeadActivity {
  id: string;
  activity_type: string;
  body: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor_id: string | null;
  actor: { full_name: string } | null;
}

export interface LeadReminder {
  id: string;
  scheduled_at: string;
  message_note: string | null;
  status: string;
}

export interface OpenCall {
  id: string;
  call_status: string;
  duration_seconds: number;
  created_at: string;
  provider: string;
}

export const CALL_OUTCOMES = [
  { value: 'INTERESTED', label: 'Interested', connected: true },
  { value: 'CALLBACK', label: 'Call back', connected: true },
  { value: 'NOT_INTERESTED', label: 'Not interested', connected: true },
  { value: 'NO_ANSWER', label: 'No answer', connected: false },
  { value: 'BUSY', label: 'Busy', connected: false },
  { value: 'WRONG_NUMBER', label: 'Wrong number', connected: false },
] as const;

export type CallOutcome = (typeof CALL_OUTCOMES)[number]['value'];

export type ActionResult<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error: string };
