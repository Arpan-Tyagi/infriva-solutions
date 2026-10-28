-- ==============================================================================
-- INFRIVA SOLUTIONS - ENTERPRISE CRM & AGENCY ERP CORE SCHEMA MIGRATION
-- Migration Version: 20261027000000
-- Target Engine: PostgreSQL 15+ / Supabase with Row-Level Security (RLS)
-- Optimized with: Supabase Postgres Best Practices (FK indexes, cached JWT RLS)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS & SCHEMA SETUP
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. CUSTOM ENUM TYPES
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'MD_CEO',
        'SALES_REP',
        'WEB_DEVELOPER',
        'SMM_MEDIA',
        'DESIGNER_EDITOR',
        'SEO_EDITORIAL',
        'CLIENT_VIEW'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE infriva_service_tier AS ENUM (
        'WEB_DEV_UIUX',
        'CUSTOM_CRM',
        'FULL_STACK_SEO_GEO',
        'PAID_ADS_MGMT',
        'WHATSAPP_RETENTION',
        'PREMIUM_CONTENT',
        'SOCIAL_MEDIA_MGMT'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE lead_source_channel AS ENUM (
        'WEBSITE_FORM',
        'META_LEAD_ADS',
        'GOOGLE_ADS_FORM',
        'FULLENRICH',
        'APOLLO',
        'DIRECT_REFERRAL'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE lead_stage AS ENUM (
        'NEW',
        'CONTACTED',
        'QUALIFIED',
        'QUOTED',
        'WON',
        'LOST'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE quotation_status AS ENUM (
        'DRAFT',
        'SENT',
        'ACCEPTED',
        'REJECTED',
        'EXPIRED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE reminder_status AS ENUM (
        'PENDING',
        'DISPATCHED',
        'COMPLETED',
        'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE engineering_phase AS ENUM (
        '01_CONSULTATION',
        '02_PLANNING',
        '03_DESIGN',
        '04_DEVELOPMENT',
        '05_LAUNCH_QA',
        '06_SUPPORT_WARRANTY'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM (
        'PHASE_1_AUDIT',
        'ACTIVE_PRODUCTION',
        'INCUBATION_90D',
        'WARRANTY_90D',
        'COMPLETED',
        'ON_HOLD'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE deployment_env AS ENUM (
        'PREVIEW',
        'STAGING',
        'PRODUCTION'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE build_status AS ENUM (
        'QUEUED',
        'BUILDING',
        'READY',
        'ERROR'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_category AS ENUM (
        'ARCHITECTURE_PLAN',
        'UIUX_HANDOFF',
        'FRONTEND_NEXTJS',
        'BACKEND_SUPABASE_CRM',
        'API_WEBHOOK_INTEGRATION',
        'SEO_CWV_QA',
        'WARRANTY_BUG'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM (
        'BACKLOG',
        'IN_PROGRESS',
        'PR_OPEN',
        'STAGING_QA',
        'COMPLETED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE asset_category AS ENUM (
        'CLIENT_RAW',
        'SMM_RAW_BRIEF',
        'BRAND_KIT',
        'FIGMA_UI_SYSTEM',
        'FINISHED_DESIGN',
        'FINISHED_VIDEO'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE calendar_status AS ENUM (
        'DRAFT',
        'PENDING_CLIENT_APPROVAL',
        'APPROVED',
        'AUTO_APPROVED',
        'CHANGES_REQUESTED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE post_format AS ENUM (
        'STATIC',
        'CAROUSEL',
        'REEL',
        'LONG_FORM_VIDEO',
        'STORY'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE post_approval_status AS ENUM (
        'PENDING',
        'APPROVED',
        'REJECTED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ------------------------------------------------------------------------------
-- 3. CORE RELATIONAL TABLES
-- ------------------------------------------------------------------------------

-- (1) Organizations (Agency vs Client Tenants)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT,
    is_internal_agency BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- (2) User Profiles (Maps Supabase auth.users to Agency Roles and Orgs)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    role user_role NOT NULL DEFAULT 'CLIENT_VIEW',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_e164 TEXT,
    github_username TEXT,
    encrypted_google_refresh_token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- (3) Leads (Omnichannel Ingestion & Waterfall Enrichment)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    assigned_rep_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    converted_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    source_channel lead_source_channel NOT NULL DEFAULT 'WEBSITE_FORM',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_e164 TEXT NOT NULL,
    company_name TEXT,
    linkedin_url TEXT,
    leadgen_id TEXT UNIQUE,
    google_lead_id TEXT UNIQUE,
    interested_service infriva_service_tier NOT NULL DEFAULT 'WEB_DEV_UIUX',
    budget_bracket TEXT,
    project_details TEXT,
    attribution_touch JSONB NOT NULL DEFAULT '{}'::jsonb,
    enrichment_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    enrichment_status TEXT NOT NULL DEFAULT 'PENDING',
    total_calls_made INT NOT NULL DEFAULT 0,
    last_contacted_at TIMESTAMPTZ,
    last_response_summary TEXT,
    last_quotation_id UUID,
    stage lead_stage NOT NULL DEFAULT 'NEW',
    sla_first_response_due_at TIMESTAMPTZ,
    sla_breached BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT phone_format_check CHECK (phone_e164 ~ '^91[0-9]{10}$')
);

-- (4) Inbound Webhook Audit Logs (Idempotency Guard)
CREATE TABLE IF NOT EXISTS inbound_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    external_event_id TEXT UNIQUE,
    raw_payload JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- (5) Sales Call Logs (Twilio Voice Telemetry)
CREATE TABLE IF NOT EXISTS sales_call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    rep_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    twilio_call_sid TEXT UNIQUE,
    call_status TEXT NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 0,
    recording_url TEXT,
    rep_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- (6) Quotations (Commercial Service Pricing & Proposals)
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    client_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
    quote_number TEXT NOT NULL UNIQUE,
    service_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal_inr NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    tax_inr NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_inr NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status quotation_status NOT NULL DEFAULT 'DRAFT',
    valid_until DATE,
    pdf_storage_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- (7) Follow-Up Reminders (Google Calendar & WhatsApp Dispatch)
CREATE TABLE IF NOT EXISTS follow_up_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    rep_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    channels TEXT[] NOT NULL DEFAULT ARRAY['EMAIL']::TEXT[],
    message_note TEXT,
    gcal_event_id TEXT,
    whatsapp_message_id TEXT,
    status reminder_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- (8) Projects & SLA Timers (6-Stage Web/CRM or 90-Day Incubation)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    source_lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    service_tier infriva_service_tier NOT NULL,
    engineering_phase engineering_phase NOT NULL DEFAULT '01_CONSULTATION',
    status project_status NOT NULL DEFAULT 'ACTIVE_PRODUCTION',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    incubation_end_date DATE,
    warranty_expires_at TIMESTAMPTZ,
    calendar_sla_day INT NOT NULL DEFAULT 20,
    approval_window_hours INT NOT NULL DEFAULT 48,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- (9) Dev Repositories (GitHub Octokit Sync)
CREATE TABLE IF NOT EXISTS dev_repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    lead_dev_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    github_repo_owner TEXT NOT NULL,
    github_repo_name TEXT NOT NULL,
    github_repo_url TEXT NOT NULL,
    vercel_project_id TEXT,
    tech_stack JSONB NOT NULL DEFAULT '["Next.js 16", "React 19", "Supabase", "TypeScript"]'::jsonb,
    production_domain TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- (10) Dev Deployments & Vercel QA Telemetry
CREATE TABLE IF NOT EXISTS dev_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id UUID NOT NULL REFERENCES dev_repositories(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    git_commit_sha TEXT,
    git_branch TEXT,
    vercel_deployment_id TEXT UNIQUE,
    preview_url TEXT NOT NULL,
    environment deployment_env NOT NULL DEFAULT 'PREVIEW',
    build_status build_status NOT NULL DEFAULT 'BUILDING',
    lcp_ms INT,
    cwv_passed BOOLEAN NOT NULL DEFAULT FALSE,
    seo_qa_approved BOOLEAN NOT NULL DEFAULT FALSE,
    seo_qa_reviewer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- (11) Engineering Tasks & 90-Day Warranty Tickets
CREATE TABLE IF NOT EXISTS engineering_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    repo_id UUID REFERENCES dev_repositories(id) ON DELETE SET NULL,
    assigned_dev_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    task_category task_category NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    github_issue_number INT,
    github_pr_url TEXT,
    branch_name TEXT,
    priority task_priority NOT NULL DEFAULT 'MEDIUM',
    status task_status NOT NULL DEFAULT 'BACKLOG',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- (12) Media Assets (Binary Specs & FFmpeg Validation)
CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    calendar_item_id UUID,
    uploaded_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
    asset_category asset_category NOT NULL,
    file_name TEXT NOT NULL,
    storage_bucket_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    specs_validation JSONB NOT NULL DEFAULT '{}'::jsonb,
    ig_ready BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- (13) Content Calendars (20th SLA & 48h Client Approval State Machine)
CREATE TABLE IF NOT EXISTS content_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    smm_author_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    target_month DATE NOT NULL,
    submitted_at TIMESTAMPTZ,
    sla_met BOOLEAN,
    approval_deadline_at TIMESTAMPTZ,
    status calendar_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- (14) Social Posts (Instagram Async Container Publisher & Evergreen Winners)
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES content_calendars(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    post_format post_format NOT NULL DEFAULT 'STATIC',
    scheduled_publish_at TIMESTAMPTZ,
    script_text TEXT,
    hook_3s_strategy TEXT,
    caption TEXT,
    media_asset_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    approval_status post_approval_status NOT NULL DEFAULT 'PENDING',
    client_feedback TEXT,
    ig_container_id TEXT,
    ig_published_media_id TEXT,
    metrics_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_evergreen_winner BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- (15) Paid Ad Campaigns & ODAX Telemetry
CREATE TABLE IF NOT EXISTS ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    platform TEXT NOT NULL DEFAULT 'META_ADS',
    external_campaign_id TEXT UNIQUE,
    name TEXT NOT NULL,
    odax_objective TEXT NOT NULL,
    budget_mode TEXT NOT NULL CHECK (budget_mode IN ('CBO', 'ABO')),
    daily_budget_cents BIGINT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'PAUSED',
    utm_template TEXT,
    metrics_rollup JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- (16) SEO Articles & Web Telemetry Snapshots
CREATE TABLE IF NOT EXISTS seo_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    author_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    markdown_body TEXT NOT NULL,
    target_keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    schema_org_jsonld JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'REVIEW', 'PUBLISHED')),
    published_url TEXT,
    last_revalidated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS web_analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    page_path TEXT NOT NULL,
    ga4_sessions INT NOT NULL DEFAULT 0,
    ga4_avg_session_duration NUMERIC(10,2) NOT NULL DEFAULT 0,
    ga4_engagement_rate NUMERIC(6,4) NOT NULL DEFAULT 0,
    ga4_bounce_rate NUMERIC(6,4) NOT NULL DEFAULT 0,
    gsc_clicks INT NOT NULL DEFAULT 0,
    gsc_impressions INT NOT NULL DEFAULT 0,
    gsc_avg_position NUMERIC(6,2) NOT NULL DEFAULT 0,
    ai_optimization_recommendations JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. PERFORMANCE INDEXES (Supabase Best Practices: FK Indexes & Deduplication)
-- ------------------------------------------------------------------------------

-- Foreign Key B-Tree Indexes (prevents sequential scans on JOINs and CASCADES)
CREATE INDEX IF NOT EXISTS idx_user_profiles_org_id ON user_profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON leads(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_rep_id ON leads(assigned_rep_id);
CREATE INDEX IF NOT EXISTS idx_leads_converted_org_id ON leads(converted_org_id);
CREATE INDEX IF NOT EXISTS idx_sales_call_logs_lead_id ON sales_call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_sales_call_logs_rep_id ON sales_call_logs(rep_id);
CREATE INDEX IF NOT EXISTS idx_quotations_lead_id ON quotations(lead_id);
CREATE INDEX IF NOT EXISTS idx_quotations_client_org_id ON quotations(client_org_id);
CREATE INDEX IF NOT EXISTS idx_quotations_created_by ON quotations(created_by);
CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_lead_id ON follow_up_reminders(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_rep_id ON follow_up_reminders(rep_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_org_id ON projects(client_org_id);
CREATE INDEX IF NOT EXISTS idx_projects_source_lead_id ON projects(source_lead_id);
CREATE INDEX IF NOT EXISTS idx_dev_repositories_project_id ON dev_repositories(project_id);
CREATE INDEX IF NOT EXISTS idx_dev_repositories_lead_dev_id ON dev_repositories(lead_dev_id);
CREATE INDEX IF NOT EXISTS idx_dev_deployments_repo_id ON dev_deployments(repo_id);
CREATE INDEX IF NOT EXISTS idx_dev_deployments_project_id ON dev_deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_dev_deployments_seo_reviewer ON dev_deployments(seo_qa_reviewer_id);
CREATE INDEX IF NOT EXISTS idx_engineering_tasks_project_id ON engineering_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_engineering_tasks_repo_id ON engineering_tasks(repo_id);
CREATE INDEX IF NOT EXISTS idx_engineering_tasks_assigned_dev ON engineering_tasks(assigned_dev_id);
CREATE INDEX IF NOT EXISTS idx_engineering_tasks_created_by ON engineering_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_media_assets_project_id ON media_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by ON media_assets(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_content_calendars_project_id ON content_calendars(project_id);
CREATE INDEX IF NOT EXISTS idx_content_calendars_smm_author ON content_calendars(smm_author_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_calendar_id ON social_posts(calendar_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_project_id ON social_posts(project_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_project_id ON ad_campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_seo_articles_project_id ON seo_articles(project_id);
CREATE INDEX IF NOT EXISTS idx_seo_articles_author_id ON seo_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_web_analytics_project_id ON web_analytics_snapshots(project_id);

-- Deduplication & Query Performance Indexes
CREATE INDEX IF NOT EXISTS idx_leads_phone_e164 ON leads(phone_e164);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_leadgen_id ON leads(leadgen_id);
CREATE INDEX IF NOT EXISTS idx_leads_google_lead_id ON leads(google_lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage_created ON leads(stage, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_dev_deployments_latest ON dev_deployments(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engineering_tasks_status ON engineering_tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(calendar_id, scheduled_publish_at);
CREATE INDEX IF NOT EXISTS idx_web_analytics_lookup ON web_analytics_snapshots(project_id, snapshot_date DESC, page_path);

-- ------------------------------------------------------------------------------
-- 5. AUTOMATED PL/PGSQL TRIGGERS & FUNCTIONS
-- ------------------------------------------------------------------------------

-- Generic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'organizations', 'user_profiles', 'leads', 'quotations',
        'follow_up_reminders', 'projects', 'dev_repositories', 'dev_deployments',
        'engineering_tasks', 'media_assets', 'content_calendars', 'social_posts',
        'ad_campaigns', 'seo_articles'
    ]) LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I;
            CREATE TRIGGER trg_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
        ', tbl, tbl, tbl, tbl);
    END LOOP;
END $$;

-- Automated Lead WON -> Project & Engineering Tasks Provisioning Trigger
CREATE OR REPLACE FUNCTION trg_on_lead_won_provision_project()
RETURNS TRIGGER AS $$
DECLARE
    v_org_id UUID;
    v_project_id UUID;
BEGIN
    -- Only trigger when stage transitions to 'WON'
    IF NEW.stage = 'WON' AND (OLD.stage IS NULL OR OLD.stage <> 'WON') THEN
        
        -- 1. Ensure or create a client organization
        IF NEW.converted_org_id IS NOT NULL THEN
            v_org_id := NEW.converted_org_id;
        ELSE
            INSERT INTO organizations (name, domain, is_internal_agency)
            VALUES (
                COALESCE(NEW.company_name, NEW.full_name || ' Client Org'),
                LOWER(SPLIT_PART(NEW.email, '@', 2)),
                FALSE
            )
            RETURNING id INTO v_org_id;

            -- Link back to lead record
            NEW.converted_org_id := v_org_id;
        END IF;

        -- 2. Provision the project record
        INSERT INTO projects (
            client_org_id,
            source_lead_id,
            name,
            service_tier,
            engineering_phase,
            status,
            start_date,
            incubation_end_date,
            warranty_expires_at,
            calendar_sla_day,
            approval_window_hours
        )
        VALUES (
            v_org_id,
            NEW.id,
            COALESCE(NEW.company_name, NEW.full_name) || ' — ' || NEW.interested_service,
            NEW.interested_service,
            CASE 
                WHEN NEW.interested_service IN ('WEB_DEV_UIUX', 'CUSTOM_CRM') THEN '01_CONSULTATION'::engineering_phase
                ELSE '02_PLANNING'::engineering_phase
            END,
            CASE 
                WHEN NEW.interested_service IN ('WEB_DEV_UIUX', 'CUSTOM_CRM') THEN 'ACTIVE_PRODUCTION'::project_status
                ELSE 'INCUBATION_90D'::project_status
            END,
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '90 days',
            NULL,
            20,
            48
        )
        RETURNING id INTO v_project_id;

        -- 3. Seed initial engineering tasks for Web Dev or Custom CRM builds
        IF NEW.interested_service IN ('WEB_DEV_UIUX', 'CUSTOM_CRM') THEN
            INSERT INTO engineering_tasks (project_id, task_category, title, description, priority, status)
            VALUES
                (v_project_id, 'ARCHITECTURE_PLAN', '01 Consultation & System Architecture Specification', 'Map relational schema, API payloads, and bottleneck audit.', 'HIGH', 'BACKLOG'),
                (v_project_id, 'ARCHITECTURE_PLAN', '02 Data Flow & Webhook Architecture Blueprint', 'Design edge webhook capture, E.164 normalization, and routing.', 'HIGH', 'BACKLOG'),
                (v_project_id, 'UIUX_HANDOFF', '03 High-Fidelity Figma Design System Handoff', 'Design brutalist-luxury UI tokens, templates, and mobile views.', 'HIGH', 'BACKLOG'),
                (v_project_id, 'FRONTEND_NEXTJS', '04 Next.js 16 + React 19 Full-Stack Engineering', 'Implement App Router, Supabase RLS, and dynamic components.', 'HIGH', 'BACKLOG'),
                (v_project_id, 'SEO_CWV_QA', '05 Pre-Launch Stress Testing & Sub-1.5s LCP Verification', 'Audit Core Web Vitals, Schema.org graph, and staging build.', 'CRITICAL', 'BACKLOG'),
                (v_project_id, 'ARCHITECTURE_PLAN', '06 Production Deployment & 90-Day Warranty Setup', 'Execute zero-downtime launch, activate 90-day warranty timer.', 'CRITICAL', 'BACKLOG');
        ELSE
            -- Seed tasks for SMM / SEO / Growth Retainers
            INSERT INTO engineering_tasks (project_id, task_category, title, description, priority, status)
            VALUES
                (v_project_id, 'ARCHITECTURE_PLAN', 'Phase 01 Brand Kit & Audience Strategy Audit', 'Extract core positioning, customer avatar, and 3s hook angles.', 'HIGH', 'BACKLOG'),
                (v_project_id, 'ARCHITECTURE_PLAN', 'Monthly Content Calendar Blueprint (20th SLA)', 'Structure 12 Reels, monthly long-form video, and daily statics.', 'HIGH', 'BACKLOG');
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lead_won_provision ON leads;
CREATE TRIGGER trg_lead_won_provision
BEFORE UPDATE OF stage ON leads
FOR EACH ROW
EXECUTE FUNCTION trg_on_lead_won_provision_project();

-- ------------------------------------------------------------------------------
-- 6. ROW-LEVEL SECURITY (RLS) POLICIES (7-Level Persona Kernel)
-- ------------------------------------------------------------------------------

-- Enable RLS across all 16 tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Current User Executive MD/CEO
CREATE OR REPLACE FUNCTION is_md_ceo()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(
        ((SELECT auth.jwt()) ->> 'user_role') = 'MD_CEO',
        FALSE
    );
$$;

-- Helper function: Get Current User Role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(
        ((SELECT auth.jwt()) ->> 'user_role'),
        'CLIENT_VIEW'
    );
$$;

-- Helper function: Get Current User Org ID
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
    SELECT NULLIF(((SELECT auth.jwt()) ->> 'org_id'), '')::UUID;
$$;

-- 6.1 Organizations Policies
CREATE POLICY "MD_CEO has full access to organizations"
ON organizations FOR ALL
USING (is_md_ceo());

CREATE POLICY "Internal staff can view organizations"
ON organizations FOR SELECT
USING (get_user_role() IN ('SALES_REP', 'WEB_DEVELOPER', 'SMM_MEDIA', 'DESIGNER_EDITOR', 'SEO_EDITORIAL'));

CREATE POLICY "Clients can only view their own organization"
ON organizations FOR SELECT
USING (id = get_user_org_id());

-- 6.2 User Profiles Policies
CREATE POLICY "MD_CEO has full access to user profiles"
ON user_profiles FOR ALL
USING (is_md_ceo());

CREATE POLICY "Users can view and edit their own profile"
ON user_profiles FOR ALL
USING (id = (SELECT auth.uid()));

CREATE POLICY "Internal staff can view colleague profiles"
ON user_profiles FOR SELECT
USING (get_user_role() IN ('SALES_REP', 'WEB_DEVELOPER', 'SMM_MEDIA', 'DESIGNER_EDITOR', 'SEO_EDITORIAL'));

-- 6.3 Leads Policies
CREATE POLICY "MD_CEO has full access to leads"
ON leads FOR ALL
USING (is_md_ceo());

CREATE POLICY "Sales reps full access to leads"
ON leads FOR ALL
USING (get_user_role() = 'SALES_REP');

CREATE POLICY "Webhooks & service role insert leads"
ON leads FOR INSERT
WITH CHECK (TRUE);

-- 6.4 Inbound Webhook Logs Policies
CREATE POLICY "MD_CEO and Sales can view webhook audit logs"
ON inbound_webhook_logs FOR SELECT
USING (get_user_role() IN ('MD_CEO', 'SALES_REP'));

-- 6.5 Sales Call Logs & Quotations Policies
CREATE POLICY "MD_CEO and Sales full access to sales call logs"
ON sales_call_logs FOR ALL
USING (get_user_role() IN ('MD_CEO', 'SALES_REP'));

CREATE POLICY "MD_CEO and Sales full access to quotations"
ON quotations FOR ALL
USING (get_user_role() IN ('MD_CEO', 'SALES_REP'));

CREATE POLICY "Clients can view accepted/sent quotations for their org"
ON quotations FOR SELECT
USING (client_org_id = get_user_org_id() AND status IN ('SENT', 'ACCEPTED'));

CREATE POLICY "MD_CEO and Sales full access to reminders"
ON follow_up_reminders FOR ALL
USING (get_user_role() IN ('MD_CEO', 'SALES_REP'));

-- 6.6 Projects Policies
CREATE POLICY "MD_CEO has full access to projects"
ON projects FOR ALL
USING (is_md_ceo());

CREATE POLICY "Internal staff can view all projects"
ON projects FOR SELECT
USING (get_user_role() IN ('SALES_REP', 'WEB_DEVELOPER', 'SMM_MEDIA', 'DESIGNER_EDITOR', 'SEO_EDITORIAL'));

CREATE POLICY "Internal staff can update assigned projects"
ON projects FOR UPDATE
USING (get_user_role() IN ('WEB_DEVELOPER', 'SMM_MEDIA', 'SEO_EDITORIAL'));

CREATE POLICY "Clients can view their own projects"
ON projects FOR SELECT
USING (client_org_id = get_user_org_id());

-- 6.7 Dev Repositories & Dev Deployments Policies
CREATE POLICY "MD_CEO and Web Dev full access to repositories"
ON dev_repositories FOR ALL
USING (get_user_role() IN ('MD_CEO', 'WEB_DEVELOPER'));

CREATE POLICY "Designers and SEO can view repositories"
ON dev_repositories FOR SELECT
USING (get_user_role() IN ('DESIGNER_EDITOR', 'SEO_EDITORIAL'));

CREATE POLICY "MD_CEO and Web Dev full access to deployments"
ON dev_deployments FOR ALL
USING (get_user_role() IN ('MD_CEO', 'WEB_DEVELOPER'));

CREATE POLICY "SEO team can update deployment SEO QA sign-off"
ON dev_deployments FOR UPDATE
USING (get_user_role() = 'SEO_EDITORIAL')
WITH CHECK (get_user_role() = 'SEO_EDITORIAL');

CREATE POLICY "Designers can view preview deployments"
ON dev_deployments FOR SELECT
USING (get_user_role() = 'DESIGNER_EDITOR');

CREATE POLICY "Clients can view preview and production deployments for their projects"
ON dev_deployments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = dev_deployments.project_id
        AND p.client_org_id = get_user_org_id()
    )
);

-- 6.8 Engineering Tasks Policies
CREATE POLICY "MD_CEO and Web Dev full access to tasks"
ON engineering_tasks FOR ALL
USING (get_user_role() IN ('MD_CEO', 'WEB_DEVELOPER'));

CREATE POLICY "Designers can view and create UIUX handoff tasks"
ON engineering_tasks FOR ALL
USING (get_user_role() = 'DESIGNER_EDITOR');

CREATE POLICY "SEO team can view and update CWV QA tasks"
ON engineering_tasks FOR ALL
USING (get_user_role() = 'SEO_EDITORIAL');

CREATE POLICY "Clients can create and view warranty bug tickets for their projects"
ON engineering_tasks FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = engineering_tasks.project_id
        AND p.client_org_id = get_user_org_id()
    )
);

CREATE POLICY "Clients can insert warranty bug tickets"
ON engineering_tasks FOR INSERT
WITH CHECK (
    task_category = 'WARRANTY_BUG' AND
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = engineering_tasks.project_id
        AND p.client_org_id = get_user_org_id()
    )
);

-- 6.9 Media Assets Policies
CREATE POLICY "Internal staff full access to media assets"
ON media_assets FOR ALL
USING (get_user_role() IN ('MD_CEO', 'SMM_MEDIA', 'DESIGNER_EDITOR', 'WEB_DEVELOPER'));

CREATE POLICY "Clients can upload raw assets and view finished media"
ON media_assets FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = media_assets.project_id
        AND p.client_org_id = get_user_org_id()
    )
);

CREATE POLICY "Clients can insert raw client assets"
ON media_assets FOR INSERT
WITH CHECK (
    asset_category = 'CLIENT_RAW' AND
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = media_assets.project_id
        AND p.client_org_id = get_user_org_id()
    )
);

-- 6.10 Content Calendars & Social Posts Policies
CREATE POLICY "MD_CEO and SMM full access to content calendars"
ON content_calendars FOR ALL
USING (get_user_role() IN ('MD_CEO', 'SMM_MEDIA'));

CREATE POLICY "Designers and Editors can view content calendars"
ON content_calendars FOR SELECT
USING (get_user_role() = 'DESIGNER_EDITOR');

CREATE POLICY "Clients can view calendars submitted for approval"
ON content_calendars FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = content_calendars.project_id
        AND p.client_org_id = get_user_org_id()
    )
);

CREATE POLICY "Clients can update approval status on pending calendars"
ON content_calendars FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = content_calendars.project_id
        AND p.client_org_id = get_user_org_id()
    )
);

CREATE POLICY "MD_CEO and SMM full access to social posts"
ON social_posts FOR ALL
USING (get_user_role() IN ('MD_CEO', 'SMM_MEDIA'));

CREATE POLICY "Designers and Editors can view social posts"
ON social_posts FOR SELECT
USING (get_user_role() = 'DESIGNER_EDITOR');

CREATE POLICY "Clients can view and approve social posts for their project"
ON social_posts FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = social_posts.project_id
        AND p.client_org_id = get_user_org_id()
    )
);

-- 6.11 Paid Ad Campaigns Policies
CREATE POLICY "MD_CEO and SMM full access to ad campaigns"
ON ad_campaigns FOR ALL
USING (get_user_role() IN ('MD_CEO', 'SMM_MEDIA'));

CREATE POLICY "Clients can view aggregated campaign telemetry"
ON ad_campaigns FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = ad_campaigns.project_id
        AND p.client_org_id = get_user_org_id()
    )
);

-- 6.12 SEO Articles & Web Analytics Snapshots Policies
CREATE POLICY "MD_CEO and SEO team full access to seo articles"
ON seo_articles FOR ALL
USING (get_user_role() IN ('MD_CEO', 'SEO_EDITORIAL'));

CREATE POLICY "Web developers can read published articles"
ON seo_articles FOR SELECT
USING (get_user_role() = 'WEB_DEVELOPER' AND status = 'PUBLISHED');

CREATE POLICY "Public / Webhooks can read published articles"
ON seo_articles FOR SELECT
USING (status = 'PUBLISHED');

CREATE POLICY "MD_CEO and SEO team full access to web analytics"
ON web_analytics_snapshots FOR ALL
USING (get_user_role() IN ('MD_CEO', 'SEO_EDITORIAL'));

CREATE POLICY "Web developers can view web analytics for CWV"
ON web_analytics_snapshots FOR SELECT
USING (get_user_role() = 'WEB_DEVELOPER');

CREATE POLICY "Clients can view analytics snapshots for their domain"
ON web_analytics_snapshots FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = web_analytics_snapshots.project_id
        AND p.client_org_id = get_user_org_id()
    )
);
