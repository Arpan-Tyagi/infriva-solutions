/**
 * @file src/types/crm.ts
 * @description Enterprise CRM TypeScript Type Definitions
 */

export type UserRole =
  | 'MD_CEO'
  | 'SALES_REP'
  | 'WEB_DEVELOPER'
  | 'SMM_MEDIA'
  | 'DESIGNER_EDITOR'
  | 'SEO_EDITORIAL'
  | 'CLIENT_VIEW';

export type InfrivaServiceTier =
  | 'WEB_DEV_UIUX'
  | 'CUSTOM_CRM'
  | 'FULL_STACK_SEO_GEO'
  | 'PAID_ADS_MGMT'
  | 'WHATSAPP_RETENTION'
  | 'PREMIUM_CONTENT'
  | 'SOCIAL_MEDIA_MGMT';

export type LeadSourceChannel =
  | 'WEBSITE_FORM'
  | 'META_LEAD_ADS'
  | 'GOOGLE_ADS_FORM'
  | 'FULLENRICH'
  | 'APOLLO'
  | 'DIRECT_REFERRAL'
  | 'MANUAL_ENTRY';

export type LeadStage =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'QUOTED'
  | 'WON'
  | 'LOST';

export type QuotationStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export type ReminderStatus =
  | 'PENDING'
  | 'DISPATCHED'
  | 'COMPLETED'
  | 'CANCELLED';

export type EngineeringPhase =
  | '01_CONSULTATION'
  | '02_PLANNING'
  | '03_DESIGN'
  | '04_DEVELOPMENT'
  | '05_LAUNCH_QA'
  | '06_SUPPORT_WARRANTY';

export type ProjectStatus =
  | 'PHASE_1_AUDIT'
  | 'ACTIVE_PRODUCTION'
  | 'INCUBATION_90D'
  | 'WARRANTY_90D'
  | 'COMPLETED'
  | 'ON_HOLD';

export type TaskCategory =
  | 'ARCHITECTURE_PLAN'
  | 'UIUX_HANDOFF'
  | 'FRONTEND_NEXTJS'
  | 'BACKEND_SUPABASE_CRM'
  | 'API_WEBHOOK_INTEGRATION'
  | 'SEO_CWV_QA'
  | 'WARRANTY_BUG';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'PR_OPEN' | 'STAGING_QA' | 'COMPLETED';

export type AssetCategory =
  | 'CLIENT_RAW'
  | 'SMM_RAW_BRIEF'
  | 'BRAND_KIT'
  | 'FIGMA_UI_SYSTEM'
  | 'FINISHED_DESIGN'
  | 'FINISHED_VIDEO';

export type CalendarStatus =
  | 'DRAFT'
  | 'PENDING_CLIENT_APPROVAL'
  | 'APPROVED'
  | 'AUTO_APPROVED'
  | 'CHANGES_REQUESTED';

export type PostFormat = 'STATIC' | 'CAROUSEL' | 'REEL' | 'LONG_FORM_VIDEO' | 'STORY';
export type PostApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AttributionTouch {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  ad_user_data_consent?: 'GRANTED' | 'DENIED';
  ad_consent_recorded_at?: string;
  ad_consent_source?: string;
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  is_internal_agency: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  org_id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone_e164?: string;
  github_username?: string;
  encrypted_google_refresh_token?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  org_id?: string;
  assigned_rep_id?: string;
  converted_org_id?: string;
  source_channel: LeadSourceChannel;
  full_name: string;
  email: string;
  phone_e164: string;
  company_name?: string;
  linkedin_url?: string;
  leadgen_id?: string;
  google_lead_id?: string;
  interested_service: InfrivaServiceTier;
  budget_bracket?: string;
  project_details?: string;
  attribution_touch: AttributionTouch;
  enrichment_payload: Record<string, unknown>;
  enrichment_status: 'PENDING' | 'SUCCESS' | 'FAILED';
  total_calls_made: number;
  last_contacted_at?: string;
  last_response_summary?: string;
  last_quotation_id?: string;
  stage: LeadStage;
  sla_first_response_due_at?: string;
  sla_breached: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_org_id: string;
  source_lead_id?: string;
  name: string;
  service_tier: InfrivaServiceTier;
  engineering_phase: EngineeringPhase;
  status: ProjectStatus;
  start_date: string;
  incubation_end_date?: string;
  warranty_expires_at?: string;
  calendar_sla_day: number;
  approval_window_hours: number;
  created_at: string;
  updated_at: string;
}

export interface DevRepository {
  id: string;
  project_id: string;
  lead_dev_id?: string;
  github_repo_owner: string;
  github_repo_name: string;
  github_repo_url: string;
  vercel_project_id?: string;
  tech_stack: string[];
  production_domain?: string;
  created_at: string;
  updated_at: string;
}

export interface DevDeployment {
  id: string;
  repo_id: string;
  project_id: string;
  git_commit_sha?: string;
  git_branch?: string;
  vercel_deployment_id?: string;
  preview_url: string;
  environment: 'PREVIEW' | 'STAGING' | 'PRODUCTION';
  build_status: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR';
  lcp_ms?: number;
  cwv_passed: boolean;
  seo_qa_approved: boolean;
  seo_qa_reviewer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EngineeringTask {
  id: string;
  project_id: string;
  repo_id?: string;
  assigned_dev_id?: string;
  created_by?: string;
  task_category: TaskCategory;
  title: string;
  description?: string;
  github_issue_number?: number;
  github_pr_url?: string;
  branch_name?: string;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  project_id: string;
  calendar_item_id?: string;
  uploaded_by: string;
  asset_category: AssetCategory;
  file_name: string;
  storage_bucket_path: string;
  mime_type: string;
  file_size_bytes: number;
  specs_validation: Record<string, unknown>;
  ig_ready: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentCalendar {
  id: string;
  project_id: string;
  smm_author_id?: string;
  target_month: string;
  submitted_at?: string;
  sla_met?: boolean;
  approval_deadline_at?: string;
  status: CalendarStatus;
  created_at: string;
  updated_at: string;
}

export interface SocialPost {
  id: string;
  calendar_id: string;
  project_id: string;
  post_format: PostFormat;
  scheduled_publish_at?: string;
  script_text?: string;
  hook_3s_strategy?: string;
  caption?: string;
  media_asset_ids: string[];
  approval_status: PostApprovalStatus;
  client_feedback?: string;
  ig_container_id?: string;
  ig_published_media_id?: string;
  metrics_snapshot: Record<string, unknown>;
  is_evergreen_winner: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdCampaign {
  id: string;
  project_id: string;
  platform: 'META_ADS' | 'GOOGLE_ADS';
  external_campaign_id?: string;
  name: string;
  odax_objective: string;
  budget_mode: 'CBO' | 'ABO';
  daily_budget_cents: number;
  status: string;
  utm_template?: string;
  metrics_rollup: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SeoArticle {
  id: string;
  project_id: string;
  author_id?: string;
  title: string;
  slug: string;
  markdown_body: string;
  target_keywords: string[];
  schema_org_jsonld: Record<string, unknown>;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED';
  published_url?: string;
  last_revalidated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WebAnalyticsSnapshot {
  id: string;
  project_id: string;
  snapshot_date: string;
  page_path: string;
  ga4_sessions: number;
  ga4_avg_session_duration: number;
  ga4_engagement_rate: number;
  ga4_bounce_rate: number;
  gsc_clicks: number;
  gsc_impressions: number;
  gsc_avg_position: number;
  ai_optimization_recommendations: Record<string, unknown>;
  created_at: string;
}
