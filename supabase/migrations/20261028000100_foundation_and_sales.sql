-- ==============================================================================
-- INFRIVA SOLUTIONS - AUTH FOUNDATION FIXES & SALES WORKSPACE SCHEMA
-- Migration Version: 20261028000100
--
-- 1. JWT claim helpers read `user_role` / `org_id` from app_metadata
-- 2. user_profiles -> auth.users claim sync + privilege-escalation guard
-- 3. RLS hardening (anon lead inserts, client/designer/SEO write scopes)
-- 4. WON provisioning trigger runs as definer and is idempotent
-- 5. Leads: nullable contact fields, SLA/assignment/follow-up columns
-- 6. Round-robin assignment of new leads across active SALES_REP users
-- 7. lead_activities timeline (notes, calls, stage changes, quotes)
-- 8. Exotel call logs that roll up into lead counters
-- 9. Quotations: free-form line items, server-side totals, MD approval
-- 10. Follow-up reminders keep leads.next_follow_up_at current
-- 11. Copy rows from leads_legacy into the CRM model
-- 12. Realtime publication for the Sales workspace tables
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. JWT CLAIM HELPERS
-- Supabase puts raw_app_meta_data under the `app_metadata` claim. Read the
-- top-level claim first (custom access token hook, if ever enabled), then
-- app_metadata. user_metadata is user-editable and is never consulted.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.jwt_claim(p_key TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
    SELECT COALESCE(
        NULLIF((SELECT auth.jwt()) ->> p_key, ''),
        NULLIF((SELECT auth.jwt()) -> 'app_metadata' ->> p_key, '')
    );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
    SELECT COALESCE(public.jwt_claim('user_role'), 'CLIENT_VIEW');
$$;

CREATE OR REPLACE FUNCTION public.is_md_ceo()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
    SELECT public.get_user_role() = 'MD_CEO';
$$;

CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
    SELECT public.jwt_claim('org_id')::UUID;
$$;

-- True when the statement comes from an end user through PostgREST
-- (service_role, postgres and migrations are trusted).
CREATE OR REPLACE FUNCTION public.is_end_user_session()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
    SELECT current_user IN ('authenticated', 'anon');
$$;

-- ------------------------------------------------------------------------------
-- 2. USER PROFILES: CLAIM SYNC + PRIVILEGE GUARD
-- ------------------------------------------------------------------------------
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS last_lead_assigned_at TIMESTAMPTZ;

-- Keep auth.users.raw_app_meta_data (-> JWT app_metadata) in step with the
-- profile so RLS sees the right role/org after the next token refresh.
CREATE OR REPLACE FUNCTION public.sync_profile_claims_to_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
        || jsonb_build_object('user_role', NEW.role::TEXT, 'org_id', NEW.org_id::TEXT)
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_profiles_sync_claims ON user_profiles;
CREATE TRIGGER trg_user_profiles_sync_claims
AFTER INSERT OR UPDATE OF role, org_id ON user_profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_claims_to_auth();

-- Only the MD/CEO (or trusted server code) may change role, org or active flag.
CREATE OR REPLACE FUNCTION public.guard_profile_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF public.is_end_user_session()
       AND NOT public.is_md_ceo()
       AND (NEW.role IS DISTINCT FROM OLD.role
            OR NEW.org_id IS DISTINCT FROM OLD.org_id
            OR NEW.is_active IS DISTINCT FROM OLD.is_active
            OR NEW.email IS DISTINCT FROM OLD.email) THEN
        RAISE EXCEPTION 'Only the MD/CEO can change role, organisation, email or active status'
            USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_profiles_guard ON user_profiles;
CREATE TRIGGER trg_user_profiles_guard
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privileged_columns();

-- The original FOR ALL policy let any user INSERT/UPDATE their own row,
-- including role = 'MD_CEO'. Split it into SELECT + guarded UPDATE.
DROP POLICY IF EXISTS "Users can view and edit their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

CREATE POLICY "Users can view their own profile"
ON user_profiles FOR SELECT
USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

-- ------------------------------------------------------------------------------
-- 3. RLS HARDENING
-- ------------------------------------------------------------------------------

-- Leads arrive through server routes using the service role (which bypasses
-- RLS). A WITH CHECK (TRUE) insert policy let anyone with the anon key insert.
DROP POLICY IF EXISTS "Webhooks & service role insert leads" ON leads;

-- Designers and SEO: read every task, write only their own category.
DROP POLICY IF EXISTS "Designers can view and create UIUX handoff tasks" ON engineering_tasks;
DROP POLICY IF EXISTS "SEO team can view and update CWV QA tasks" ON engineering_tasks;
DROP POLICY IF EXISTS "Designers and SEO can view tasks" ON engineering_tasks;
DROP POLICY IF EXISTS "Designers manage UIUX handoff tasks" ON engineering_tasks;
DROP POLICY IF EXISTS "SEO team manages CWV QA tasks" ON engineering_tasks;

CREATE POLICY "Designers and SEO can view tasks"
ON engineering_tasks FOR SELECT
USING (get_user_role() IN ('DESIGNER_EDITOR', 'SEO_EDITORIAL'));

CREATE POLICY "Designers manage UIUX handoff tasks"
ON engineering_tasks FOR ALL
USING (get_user_role() = 'DESIGNER_EDITOR' AND task_category = 'UIUX_HANDOFF')
WITH CHECK (get_user_role() = 'DESIGNER_EDITOR' AND task_category = 'UIUX_HANDOFF');

CREATE POLICY "SEO team manages CWV QA tasks"
ON engineering_tasks FOR ALL
USING (get_user_role() = 'SEO_EDITORIAL' AND task_category = 'SEO_CWV_QA')
WITH CHECK (get_user_role() = 'SEO_EDITORIAL' AND task_category = 'SEO_CWV_QA');

-- Clients: read their social posts, and only approve / leave feedback.
DROP POLICY IF EXISTS "Clients can view and approve social posts for their project" ON social_posts;
DROP POLICY IF EXISTS "Clients can view social posts for their project" ON social_posts;
DROP POLICY IF EXISTS "Clients can approve social posts for their project" ON social_posts;

CREATE POLICY "Clients can view social posts for their project"
ON social_posts FOR SELECT
USING (EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = social_posts.project_id AND p.client_org_id = get_user_org_id()
));

CREATE POLICY "Clients can approve social posts for their project"
ON social_posts FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = social_posts.project_id AND p.client_org_id = get_user_org_id()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = social_posts.project_id AND p.client_org_id = get_user_org_id()
));

-- Column scope for client edits: everything except the approval fields is
-- reset to its previous value.
CREATE OR REPLACE FUNCTION public.guard_client_social_post_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    v_status public.post_approval_status := NEW.approval_status;
    v_feedback TEXT := NEW.client_feedback;
BEGIN
    IF public.is_end_user_session() AND public.get_user_role() = 'CLIENT_VIEW' THEN
        NEW := OLD;
        NEW.approval_status := v_status;
        NEW.client_feedback := v_feedback;
        NEW.updated_at := now();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_social_posts_client_guard ON social_posts;
CREATE TRIGGER trg_social_posts_client_guard
BEFORE UPDATE ON social_posts
FOR EACH ROW EXECUTE FUNCTION public.guard_client_social_post_update();

CREATE OR REPLACE FUNCTION public.guard_client_calendar_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    v_status public.calendar_status := NEW.status;
BEGIN
    IF public.is_end_user_session() AND public.get_user_role() = 'CLIENT_VIEW' THEN
        IF OLD.status <> 'PENDING_CLIENT_APPROVAL'
           OR v_status NOT IN ('APPROVED', 'CHANGES_REQUESTED') THEN
            RAISE EXCEPTION 'Clients can only approve or request changes on calendars awaiting approval'
                USING ERRCODE = '42501';
        END IF;
        NEW := OLD;
        NEW.status := v_status;
        NEW.updated_at := now();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_content_calendars_client_guard ON content_calendars;
CREATE TRIGGER trg_content_calendars_client_guard
BEFORE UPDATE ON content_calendars
FOR EACH ROW EXECUTE FUNCTION public.guard_client_calendar_update();

-- ------------------------------------------------------------------------------
-- 4. WON -> PROJECT PROVISIONING (definer rights, idempotent)
-- A SALES_REP has no INSERT rights on organizations/projects/engineering_tasks,
-- so the invoker-rights version failed the whole stage update under RLS.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_on_lead_won_provision_project()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id UUID;
    v_project_id UUID;
BEGIN
    IF NEW.stage = 'WON' AND (OLD.stage IS NULL OR OLD.stage <> 'WON') THEN

        -- A lead that was WON before (WON -> LOST -> WON) keeps its project.
        IF EXISTS (SELECT 1 FROM projects WHERE source_lead_id = NEW.id) THEN
            RETURN NEW;
        END IF;

        IF NEW.converted_org_id IS NOT NULL THEN
            v_org_id := NEW.converted_org_id;
        ELSE
            INSERT INTO organizations (name, domain, is_internal_agency)
            VALUES (
                COALESCE(NEW.company_name, NEW.full_name || ' Client Org'),
                NULLIF(LOWER(SPLIT_PART(COALESCE(NEW.email, ''), '@', 2)), ''),
                FALSE
            )
            RETURNING id INTO v_org_id;

            NEW.converted_org_id := v_org_id;
        END IF;

        INSERT INTO projects (
            client_org_id, source_lead_id, name, service_tier, engineering_phase, status,
            start_date, incubation_end_date, warranty_expires_at, calendar_sla_day, approval_window_hours
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
            INSERT INTO engineering_tasks (project_id, task_category, title, description, priority, status)
            VALUES
                (v_project_id, 'ARCHITECTURE_PLAN', 'Phase 01 Brand Kit & Audience Strategy Audit', 'Extract core positioning, customer avatar, and 3s hook angles.', 'HIGH', 'BACKLOG'),
                (v_project_id, 'ARCHITECTURE_PLAN', 'Monthly Content Calendar Blueprint (20th SLA)', 'Structure 12 Reels, monthly long-form video, and daily statics.', 'HIGH', 'BACKLOG');
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. LEADS: CONTACT FIELDS, SLA, ASSIGNMENT, FOLLOW-UP COLUMNS
-- A lead needs an email OR a valid Indian mobile. Unparseable phones are kept
-- in phone_raw instead of being replaced by a shared placeholder number.
-- ------------------------------------------------------------------------------
ALTER TABLE leads ALTER COLUMN email DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN phone_e164 DROP NOT NULL;

ALTER TABLE leads DROP CONSTRAINT IF EXISTS phone_format_check;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_phone_e164_format;
ALTER TABLE leads ADD CONSTRAINT leads_phone_e164_format
    CHECK (phone_e164 IS NULL OR phone_e164 ~ '^91[6-9][0-9]{9}$');

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_contact_present;
ALTER TABLE leads ADD CONSTRAINT leads_contact_present
    CHECK (email IS NOT NULL OR phone_e164 IS NOT NULL);

ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS phone_raw TEXT,
    ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS first_responded_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS inquiry_count INT NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS last_inquiry_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS is_existing_client BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS lost_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_email_lower ON leads (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_leads_queue ON leads (assigned_rep_id, stage, sla_first_response_due_at);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON leads (next_follow_up_at) WHERE next_follow_up_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_last_quotation_id ON leads (last_quotation_id);

-- ------------------------------------------------------------------------------
-- 6. ROUND-ROBIN ASSIGNMENT + 5-MINUTE FIRST-RESPONSE SLA
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.pick_next_sales_rep()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_rep UUID;
BEGIN
    -- Least-recently-assigned active rep. SKIP LOCKED lets concurrent inserts
    -- pick different reps instead of queueing on the same row.
    SELECT id INTO v_rep
    FROM user_profiles
    WHERE role = 'SALES_REP' AND is_active
    ORDER BY last_lead_assigned_at ASC NULLS FIRST, created_at ASC, id ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_rep IS NULL THEN
        SELECT id INTO v_rep
        FROM user_profiles
        WHERE role = 'SALES_REP' AND is_active
        ORDER BY last_lead_assigned_at ASC NULLS FIRST, created_at ASC, id ASC
        LIMIT 1;
    END IF;

    IF v_rep IS NOT NULL THEN
        -- clock_timestamp(): several leads inserted in one transaction must
        -- still rotate, which now() (frozen per transaction) would not do.
        UPDATE user_profiles SET last_lead_assigned_at = clock_timestamp() WHERE id = v_rep;
    END IF;

    RETURN v_rep;
END;
$$;

REVOKE ALL ON FUNCTION public.pick_next_sales_rep() FROM PUBLIC, anon, authenticated;

-- Spread unassigned leads (e.g. imported before any rep existed) across reps.
-- Callable by the MD/CEO through RPC, or by trusted server code.
CREATE OR REPLACE FUNCTION public.distribute_unassigned_leads()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_lead UUID;
    v_rep UUID;
    v_count INT := 0;
BEGIN
    -- current_user is the definer here, so authorise from the JWT instead.
    IF (SELECT auth.jwt()) IS NOT NULL
       AND COALESCE((SELECT auth.jwt()) ->> 'role', '') <> 'service_role'
       AND NOT public.is_md_ceo() THEN
        RAISE EXCEPTION 'Only the MD/CEO can bulk-assign leads' USING ERRCODE = '42501';
    END IF;

    FOR v_lead IN
        SELECT id FROM leads
        WHERE assigned_rep_id IS NULL AND stage NOT IN ('WON', 'LOST')
        ORDER BY created_at
    LOOP
        v_rep := public.pick_next_sales_rep();
        EXIT WHEN v_rep IS NULL;
        UPDATE leads SET assigned_rep_id = v_rep WHERE id = v_lead;
        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.distribute_unassigned_leads() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.distribute_unassigned_leads() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.trg_leads_route_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.assigned_rep_id IS NULL THEN
        NEW.assigned_rep_id := public.pick_next_sales_rep();
    END IF;
    IF NEW.assigned_rep_id IS NOT NULL AND NEW.assigned_at IS NULL THEN
        NEW.assigned_at := now();
    END IF;
    IF NEW.sla_first_response_due_at IS NULL AND NEW.first_responded_at IS NULL THEN
        NEW.sla_first_response_due_at := now() + INTERVAL '5 minutes';
    END IF;
    NEW.last_inquiry_at := COALESCE(NEW.last_inquiry_at, NEW.created_at, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_leads_route ON leads;
CREATE TRIGGER trg_leads_route
BEFORE INSERT ON leads
FOR EACH ROW EXECUTE FUNCTION public.trg_leads_route_on_insert();

CREATE OR REPLACE FUNCTION public.trg_leads_stamp_reassignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.assigned_rep_id IS DISTINCT FROM OLD.assigned_rep_id THEN
        NEW.assigned_at := CASE WHEN NEW.assigned_rep_id IS NULL THEN NULL ELSE now() END;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_leads_stamp_reassignment ON leads;
CREATE TRIGGER trg_leads_stamp_reassignment
BEFORE UPDATE OF assigned_rep_id ON leads
FOR EACH ROW EXECUTE FUNCTION public.trg_leads_stamp_reassignment();

-- ------------------------------------------------------------------------------
-- 7. LEAD ACTIVITY TIMELINE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'NOTE', 'CALL', 'STAGE_CHANGE', 'ASSIGNMENT', 'QUOTE',
        'FOLLOW_UP', 'WHATSAPP', 'EMAIL', 'INQUIRY', 'SYSTEM'
    )),
    body TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_created ON lead_activities (lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_actor_id ON lead_activities (actor_id);

ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "MD_CEO and Sales can read lead activity" ON lead_activities;
DROP POLICY IF EXISTS "MD_CEO and Sales can add lead activity as themselves" ON lead_activities;
DROP POLICY IF EXISTS "Authors and MD_CEO can edit notes" ON lead_activities;
DROP POLICY IF EXISTS "Authors and MD_CEO can delete notes" ON lead_activities;

CREATE POLICY "MD_CEO and Sales can read lead activity"
ON lead_activities FOR SELECT
USING (get_user_role() IN ('MD_CEO', 'SALES_REP'));

CREATE POLICY "MD_CEO and Sales can add lead activity as themselves"
ON lead_activities FOR INSERT
WITH CHECK (
    get_user_role() IN ('MD_CEO', 'SALES_REP')
    AND actor_id = (SELECT auth.uid())
);

CREATE POLICY "Authors and MD_CEO can edit notes"
ON lead_activities FOR UPDATE
USING (activity_type = 'NOTE' AND (actor_id = (SELECT auth.uid()) OR is_md_ceo()))
WITH CHECK (activity_type = 'NOTE' AND (actor_id = (SELECT auth.uid()) OR is_md_ceo()));

CREATE POLICY "Authors and MD_CEO can delete notes"
ON lead_activities FOR DELETE
USING (activity_type = 'NOTE' AND (actor_id = (SELECT auth.uid()) OR is_md_ceo()));

-- Current app user as a profile id (NULL for webhooks / service role).
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM user_profiles WHERE id = (SELECT auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.trg_leads_log_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO lead_activities (lead_id, actor_id, activity_type, body, metadata)
    VALUES (
        NEW.id,
        public.current_profile_id(),
        'INQUIRY',
        'Lead captured via ' || NEW.source_channel,
        jsonb_build_object('source_channel', NEW.source_channel, 'interested_service', NEW.interested_service)
    );

    IF NEW.assigned_rep_id IS NOT NULL THEN
        INSERT INTO lead_activities (lead_id, actor_id, activity_type, body, metadata)
        VALUES (NEW.id, NULL, 'ASSIGNMENT', 'Assigned by round-robin',
                jsonb_build_object('to', NEW.assigned_rep_id));
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_leads_log_insert ON leads;
CREATE TRIGGER trg_leads_log_insert
AFTER INSERT ON leads
FOR EACH ROW EXECUTE FUNCTION public.trg_leads_log_insert();

CREATE OR REPLACE FUNCTION public.trg_leads_log_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actor UUID := public.current_profile_id();
BEGIN
    IF NEW.stage IS DISTINCT FROM OLD.stage THEN
        INSERT INTO lead_activities (lead_id, actor_id, activity_type, body, metadata)
        VALUES (NEW.id, v_actor, 'STAGE_CHANGE', OLD.stage || ' → ' || NEW.stage,
                jsonb_build_object('from', OLD.stage, 'to', NEW.stage, 'lost_reason', NEW.lost_reason));
    END IF;

    IF NEW.assigned_rep_id IS DISTINCT FROM OLD.assigned_rep_id THEN
        INSERT INTO lead_activities (lead_id, actor_id, activity_type, body, metadata)
        VALUES (NEW.id, v_actor, 'ASSIGNMENT', 'Lead reassigned',
                jsonb_build_object('from', OLD.assigned_rep_id, 'to', NEW.assigned_rep_id));
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_leads_log_update ON leads;
CREATE TRIGGER trg_leads_log_update
AFTER UPDATE OF stage, assigned_rep_id ON leads
FOR EACH ROW EXECUTE FUNCTION public.trg_leads_log_update();

-- ------------------------------------------------------------------------------
-- 8. CALL LOGS (EXOTEL)
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'sales_call_logs' AND column_name = 'twilio_call_sid'
    ) THEN
        ALTER TABLE sales_call_logs RENAME COLUMN twilio_call_sid TO call_sid;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_call_logs_twilio_call_sid_key') THEN
        ALTER TABLE sales_call_logs RENAME CONSTRAINT sales_call_logs_twilio_call_sid_key TO sales_call_logs_call_sid_key;
    END IF;
END $$;

ALTER TABLE sales_call_logs
    ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'EXOTEL',
    ADD COLUMN IF NOT EXISTS outcome TEXT,
    ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE sales_call_logs DROP CONSTRAINT IF EXISTS sales_call_logs_outcome_check;
ALTER TABLE sales_call_logs ADD CONSTRAINT sales_call_logs_outcome_check CHECK (outcome IS NULL OR outcome IN (
    'INTERESTED', 'CALLBACK', 'NO_ANSWER', 'BUSY', 'NOT_INTERESTED', 'WRONG_NUMBER'
));

DROP TRIGGER IF EXISTS trg_sales_call_logs_updated_at ON sales_call_logs;
CREATE TRIGGER trg_sales_call_logs_updated_at
BEFORE UPDATE ON sales_call_logs
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Every dial attempt counts as a call and as the first response for the SLA.
CREATE OR REPLACE FUNCTION public.trg_call_logs_rollup_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE leads
    SET total_calls_made = total_calls_made + 1,
        last_contacted_at = now(),
        first_responded_at = COALESCE(first_responded_at, now())
    WHERE id = NEW.lead_id;

    INSERT INTO lead_activities (lead_id, actor_id, activity_type, body, metadata)
    VALUES (NEW.lead_id, NEW.rep_id, 'CALL', 'Call started',
            jsonb_build_object('call_log_id', NEW.id, 'call_sid', NEW.call_sid, 'provider', NEW.provider));
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_call_logs_rollup_insert ON sales_call_logs;
CREATE TRIGGER trg_call_logs_rollup_insert
AFTER INSERT ON sales_call_logs
FOR EACH ROW EXECUTE FUNCTION public.trg_call_logs_rollup_insert();

-- A connected call moves a NEW lead to CONTACTED (never moves a lead backwards).
CREATE OR REPLACE FUNCTION public.trg_call_logs_rollup_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.call_status = 'completed' AND NEW.duration_seconds > 0
       AND OLD.call_status IS DISTINCT FROM 'completed' THEN
        UPDATE leads SET stage = 'CONTACTED' WHERE id = NEW.lead_id AND stage = 'NEW';
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_call_logs_rollup_status ON sales_call_logs;
CREATE TRIGGER trg_call_logs_rollup_status
AFTER UPDATE OF call_status, duration_seconds ON sales_call_logs
FOR EACH ROW EXECUTE FUNCTION public.trg_call_logs_rollup_status();

-- ------------------------------------------------------------------------------
-- 9. QUOTATIONS: FREE-FORM LINE ITEMS + MD APPROVAL
-- service_items: [{ "description": text, "qty": number, "unit_price_inr": number }]
-- Totals are always recomputed here; client-sent totals are ignored.
-- ------------------------------------------------------------------------------
ALTER TABLE quotations ALTER COLUMN client_org_id DROP NOT NULL;

ALTER TABLE quotations
    ADD COLUMN IF NOT EXISTS title TEXT,
    ADD COLUMN IF NOT EXISTS discount_inr NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS review_note TEXT,
    ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_discount_non_negative;
ALTER TABLE quotations ADD CONSTRAINT quotations_discount_non_negative CHECK (discount_inr >= 0);
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_gst_rate_range;
ALTER TABLE quotations ADD CONSTRAINT quotations_gst_rate_range CHECK (gst_rate >= 0 AND gst_rate <= 28);

CREATE INDEX IF NOT EXISTS idx_quotations_reviewed_by ON quotations (reviewed_by);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations (status, submitted_at);

CREATE SEQUENCE IF NOT EXISTS quotation_number_seq;
GRANT USAGE ON SEQUENCE quotation_number_seq TO authenticated, service_role;

ALTER TABLE quotations ALTER COLUMN quote_number SET DEFAULT (
    'INF-Q-' || to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YYYY') || '-' || lpad(nextval('quotation_number_seq')::TEXT, 4, '0')
);

CREATE OR REPLACE FUNCTION public.trg_quotations_workflow()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_item JSONB;
    v_qty NUMERIC;
    v_price NUMERIC;
    v_subtotal NUMERIC(12,2) := 0;
    v_end_user BOOLEAN := public.is_end_user_session();
BEGIN
    -- Closed quotations are read-only for end users.
    IF TG_OP = 'UPDATE' AND v_end_user AND OLD.status IN ('ACCEPTED', 'REJECTED', 'EXPIRED') THEN
        RAISE EXCEPTION 'Quotation % is closed (%) and can no longer be edited', OLD.quote_number, OLD.status
            USING ERRCODE = '42501';
    END IF;

    -- Validate line items and compute totals.
    IF jsonb_typeof(NEW.service_items) <> 'array' OR jsonb_array_length(NEW.service_items) = 0 THEN
        RAISE EXCEPTION 'A quotation needs at least one line item';
    END IF;

    FOR v_item IN SELECT value FROM jsonb_array_elements(NEW.service_items) LOOP
        IF COALESCE(btrim(v_item ->> 'description'), '') = '' THEN
            RAISE EXCEPTION 'Every line item needs a description';
        END IF;
        v_qty := COALESCE((v_item ->> 'qty')::NUMERIC, 1);
        v_price := COALESCE((v_item ->> 'unit_price_inr')::NUMERIC, 0);
        IF v_qty <= 0 OR v_price < 0 THEN
            RAISE EXCEPTION 'Line item quantity must be above 0 and price cannot be negative';
        END IF;
        v_subtotal := v_subtotal + round(v_qty * v_price, 2);
    END LOOP;

    IF NEW.discount_inr > v_subtotal THEN
        RAISE EXCEPTION 'Discount (₹%) cannot exceed the subtotal (₹%)', NEW.discount_inr, v_subtotal;
    END IF;

    NEW.subtotal_inr := v_subtotal;
    NEW.tax_inr := round((v_subtotal - NEW.discount_inr) * NEW.gst_rate / 100, 2);
    NEW.total_inr := v_subtotal - NEW.discount_inr + NEW.tax_inr;

    IF TG_OP = 'INSERT' THEN
        IF v_end_user AND NEW.status NOT IN ('DRAFT', 'PENDING_APPROVAL') THEN
            RAISE EXCEPTION 'New quotations start as DRAFT or PENDING_APPROVAL';
        END IF;
        IF NEW.status = 'PENDING_APPROVAL' THEN
            NEW.submitted_at := now();
        END IF;
        RETURN NEW;
    END IF;

    -- Editing the commercials of an approved/sent quote sends it back to DRAFT.
    IF NEW.status = OLD.status
       AND OLD.status IN ('APPROVED', 'SENT')
       AND (NEW.service_items IS DISTINCT FROM OLD.service_items
            OR NEW.discount_inr IS DISTINCT FROM OLD.discount_inr
            OR NEW.gst_rate IS DISTINCT FROM OLD.gst_rate) THEN
        NEW.status := 'DRAFT';
        NEW.reviewed_by := NULL;
        NEW.reviewed_at := NULL;
    END IF;

    IF NEW.status IS DISTINCT FROM OLD.status THEN
        IF v_end_user AND NOT (
            (OLD.status IN ('DRAFT', 'CHANGES_REQUESTED') AND NEW.status IN ('DRAFT', 'PENDING_APPROVAL'))
            OR (OLD.status = 'PENDING_APPROVAL' AND NEW.status IN ('APPROVED', 'CHANGES_REQUESTED', 'DRAFT'))
            OR (OLD.status = 'APPROVED' AND NEW.status IN ('SENT', 'ACCEPTED', 'REJECTED', 'DRAFT'))
            OR (OLD.status = 'SENT' AND NEW.status IN ('ACCEPTED', 'REJECTED', 'EXPIRED', 'DRAFT'))
        ) THEN
            RAISE EXCEPTION 'A quotation cannot move from % to %', OLD.status, NEW.status;
        END IF;

        IF v_end_user AND NEW.status IN ('APPROVED', 'CHANGES_REQUESTED') AND NOT public.is_md_ceo() THEN
            RAISE EXCEPTION 'Only the MD/CEO can approve quotations or request changes'
                USING ERRCODE = '42501';
        END IF;

        CASE NEW.status
            WHEN 'PENDING_APPROVAL' THEN
                NEW.submitted_at := now();
                NEW.reviewed_by := NULL;
                NEW.reviewed_at := NULL;
            WHEN 'APPROVED', 'CHANGES_REQUESTED' THEN
                NEW.reviewed_by := public.current_profile_id();
                NEW.reviewed_at := now();
            WHEN 'ACCEPTED' THEN
                NEW.accepted_at := now();
            ELSE
                NULL;
        END CASE;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quotations_workflow ON quotations;
CREATE TRIGGER trg_quotations_workflow
BEFORE INSERT OR UPDATE ON quotations
FOR EACH ROW EXECUTE FUNCTION public.trg_quotations_workflow();

-- Quote events drive the lead: approved -> QUOTED, accepted -> WON (which
-- provisions the project through trg_lead_won_provision).
CREATE OR REPLACE FUNCTION public.trg_quotations_after_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE leads SET last_quotation_id = NEW.id WHERE id = NEW.lead_id;
        INSERT INTO lead_activities (lead_id, actor_id, activity_type, body, metadata)
        VALUES (NEW.lead_id, public.current_profile_id(), 'QUOTE',
                'Quotation ' || NEW.quote_number || ' created (' || NEW.status || ')',
                jsonb_build_object('quotation_id', NEW.id, 'status', NEW.status, 'total_inr', NEW.total_inr));
        RETURN NULL;
    END IF;

    IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
        RETURN NULL;
    END IF;

    INSERT INTO lead_activities (lead_id, actor_id, activity_type, body, metadata)
    VALUES (NEW.lead_id, public.current_profile_id(), 'QUOTE',
            'Quotation ' || NEW.quote_number || ': ' || OLD.status || ' → ' || NEW.status
                || COALESCE(' — ' || NEW.review_note, ''),
            jsonb_build_object('quotation_id', NEW.id, 'from', OLD.status, 'to', NEW.status, 'total_inr', NEW.total_inr));

    IF NEW.status = 'APPROVED' THEN
        UPDATE leads SET stage = 'QUOTED'
        WHERE id = NEW.lead_id AND stage IN ('NEW', 'CONTACTED', 'QUALIFIED');
    ELSIF NEW.status = 'ACCEPTED' THEN
        UPDATE leads SET stage = 'WON', last_quotation_id = NEW.id
        WHERE id = NEW.lead_id AND stage <> 'WON';

        SELECT converted_org_id INTO v_org FROM leads WHERE id = NEW.lead_id;
        IF v_org IS NOT NULL AND NEW.client_org_id IS NULL THEN
            UPDATE quotations SET client_org_id = v_org WHERE id = NEW.id;
        END IF;
    END IF;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_quotations_after_write ON quotations;
CREATE TRIGGER trg_quotations_after_write
AFTER INSERT OR UPDATE OF status ON quotations
FOR EACH ROW EXECUTE FUNCTION public.trg_quotations_after_write();

-- ------------------------------------------------------------------------------
-- 10. FOLLOW-UP REMINDERS -> leads.next_follow_up_at
-- ------------------------------------------------------------------------------
ALTER TABLE follow_up_reminders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE follow_up_reminders ALTER COLUMN channels SET DEFAULT ARRAY['WHATSAPP', 'EMAIL']::TEXT[];
CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_due ON follow_up_reminders (status, scheduled_at);

CREATE OR REPLACE FUNCTION public.trg_follow_ups_sync_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_lead UUID := COALESCE(NEW.lead_id, OLD.lead_id);
BEGIN
    UPDATE leads
    SET next_follow_up_at = (
        SELECT MIN(scheduled_at) FROM follow_up_reminders
        WHERE lead_id = v_lead AND status IN ('PENDING', 'DISPATCHED')
    )
    WHERE id = v_lead;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO lead_activities (lead_id, actor_id, activity_type, body, metadata)
        VALUES (NEW.lead_id, NEW.rep_id, 'FOLLOW_UP',
                'Follow-up scheduled' || COALESCE(': ' || NEW.message_note, ''),
                jsonb_build_object('reminder_id', NEW.id, 'scheduled_at', NEW.scheduled_at, 'channels', NEW.channels));
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_follow_ups_sync_lead ON follow_up_reminders;
CREATE TRIGGER trg_follow_ups_sync_lead
AFTER INSERT OR UPDATE OF status, scheduled_at OR DELETE ON follow_up_reminders
FOR EACH ROW EXECUTE FUNCTION public.trg_follow_ups_sync_lead();

-- ------------------------------------------------------------------------------
-- 11a. LEGACY TABLE FOR CHAT/DM LEADS
-- The Instagram/Messenger/WhatsApp chatbot (/api/meta/webhook) logs DM leads
-- that carry only a platform sender id, not an email or phone. They live in
-- leads_legacy (created here on fresh databases) and are visible to Sales.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads_legacy (
    id BIGSERIAL PRIMARY KEY,
    name TEXT,
    company TEXT,
    email TEXT,
    phone TEXT,
    service TEXT,
    budget TEXT,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE leads_legacy
    ADD COLUMN IF NOT EXISTS platform TEXT,
    ADD COLUMN IF NOT EXISTS sender_id TEXT,
    ADD COLUMN IF NOT EXISTS message TEXT;

ALTER TABLE leads_legacy ENABLE ROW LEVEL SECURITY;

-- The old site inserted with the anon key; every writer now uses server code.
DROP POLICY IF EXISTS "Allow public insert to leads" ON leads_legacy;

DROP POLICY IF EXISTS "MD_CEO and Sales can read legacy leads" ON leads_legacy;
CREATE POLICY "MD_CEO and Sales can read legacy leads"
ON leads_legacy FOR SELECT
USING (get_user_role() IN ('MD_CEO', 'SALES_REP'));

-- ------------------------------------------------------------------------------
-- 11b. COPY LEGACY WEBSITE LEADS INTO THE CRM MODEL
-- Historic rows are imported as already-responded (no SLA alarms) and are
-- spread across reps by the round-robin trigger. leads_legacy is kept intact.
-- Rows without a usable email or Indian mobile (e.g. chat DMs) stay legacy-only.
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF to_regclass('public.leads_legacy') IS NULL THEN
        RETURN;
    END IF;

    INSERT INTO leads (
        source_channel, full_name, email, phone_e164, phone_raw, company_name,
        interested_service, budget_bracket, project_details, attribution_touch,
        stage, first_responded_at, sla_first_response_due_at, last_inquiry_at, created_at
    )
    SELECT
        'WEBSITE_FORM',
        COALESCE(NULLIF(btrim(d.j ->> 'name'), ''), NULLIF(btrim(d.j ->> 'full_name'), ''), 'Website Visitor'),
        d.email_norm,
        d.phone_norm,
        NULLIF(btrim(d.j ->> 'phone'), ''),
        NULLIF(btrim(COALESCE(d.j ->> 'company', d.j ->> 'company_name')), ''),
        CASE
            WHEN LOWER(COALESCE(d.j ->> 'service', '')) LIKE '%crm%' THEN 'CUSTOM_CRM'
            WHEN LOWER(COALESCE(d.j ->> 'service', '')) ~ '(seo|geo)' THEN 'FULL_STACK_SEO_GEO'
            WHEN LOWER(COALESCE(d.j ->> 'service', '')) ~ '(paid|ads|meta|google)' THEN 'PAID_ADS_MGMT'
            WHEN LOWER(COALESCE(d.j ->> 'service', '')) ~ '(whatsapp|retention)' THEN 'WHATSAPP_RETENTION'
            WHEN LOWER(COALESCE(d.j ->> 'service', '')) ~ '(content|video|production)' THEN 'PREMIUM_CONTENT'
            WHEN LOWER(COALESCE(d.j ->> 'service', '')) ~ '(social|smm)' THEN 'SOCIAL_MEDIA_MGMT'
            ELSE 'WEB_DEV_UIUX'
        END::infriva_service_tier,
        NULLIF(btrim(d.j ->> 'budget'), ''),
        NULLIF(btrim(COALESCE(d.j ->> 'details', d.j ->> 'message')), ''),
        jsonb_build_object('imported_from', 'leads_legacy', 'legacy_id', d.j ->> 'id'),
        'NEW',
        d.created_ts,
        d.created_ts,
        d.created_ts,
        d.created_ts
    FROM (
        SELECT DISTINCT ON (COALESCE(n.email_norm, n.phone_norm)) n.*
        FROM (
            SELECT
                src.j,
                CASE
                    WHEN LOWER(btrim(src.j ->> 'email')) ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
                    THEN LOWER(btrim(src.j ->> 'email'))
                END AS email_norm,
                CASE
                    WHEN right(regexp_replace(COALESCE(src.j ->> 'phone', ''), '\D', '', 'g'), 10) ~ '^[6-9][0-9]{9}$'
                    THEN '91' || right(regexp_replace(src.j ->> 'phone', '\D', '', 'g'), 10)
                END AS phone_norm,
                COALESCE((src.j ->> 'created_at')::TIMESTAMPTZ, now()) AS created_ts
            FROM (SELECT to_jsonb(l) AS j FROM public.leads_legacy l) src
        ) n
        WHERE n.email_norm IS NOT NULL OR n.phone_norm IS NOT NULL
        ORDER BY COALESCE(n.email_norm, n.phone_norm), n.created_ts DESC
    ) d
    WHERE NOT EXISTS (
        SELECT 1 FROM leads x
        WHERE x.attribution_touch ->> 'legacy_id' = d.j ->> 'id'
           OR (d.email_norm IS NOT NULL AND LOWER(x.email) = d.email_norm)
           OR (d.phone_norm IS NOT NULL AND x.phone_e164 = d.phone_norm)
    );
END $$;

-- ------------------------------------------------------------------------------
-- 12. REALTIME
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    t TEXT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        RETURN;
    END IF;
    FOREACH t IN ARRAY ARRAY['leads', 'lead_activities', 'quotations', 'follow_up_reminders', 'sales_call_logs'] LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
        END IF;
    END LOOP;
END $$;
