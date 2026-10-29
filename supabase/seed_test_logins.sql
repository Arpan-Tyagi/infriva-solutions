-- ==============================================================================
-- INFRIVA SOLUTIONS - ENTERPRISE CRM TEST LOGINS SEED SCRIPT
-- Execute in Supabase SQL Editor to provision all 7 role personas.
-- Default Test Password for all accounts: Infriva2026!
-- ==============================================================================

-- 1. Ensure Organizations Exist
INSERT INTO organizations (id, name, domain, is_internal_agency)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Infriva Solutions HQ', 'infrivasolutions.com', TRUE),
    ('00000000-0000-0000-0000-000000000002', 'FlyingLyte Travel Technologies', 'flyinglyte.com', FALSE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Helper macro to create or update auth user with custom JWT claims
-- In Supabase, auth.users contains raw_app_meta_data which maps to auth.jwt()
CREATE OR REPLACE FUNCTION seed_crm_user(
    p_user_id UUID,
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_role user_role,
    p_org_id UUID
) RETURNS VOID
-- Supabase installs pgcrypto (crypt, gen_salt) in the `extensions` schema.
SET search_path = public, extensions
AS $$
DECLARE
    v_encrypted_pw TEXT;
BEGIN
    v_encrypted_pw := crypt(p_password, gen_salt('bf'));

    -- Insert or update auth.users
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        aud,
        role,
        -- GoTrue scans these as strings; NULL breaks password sign-in.
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    )
    VALUES (
        p_user_id,
        '00000000-0000-0000-0000-000000000000',
        p_email,
        v_encrypted_pw,
        now(),
        jsonb_build_object('provider', 'email', 'providers', array['email'], 'user_role', p_role, 'org_id', p_org_id),
        jsonb_build_object('full_name', p_full_name),
        now(),
        now(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        ''
    )
    ON CONFLICT (id) DO UPDATE SET
        encrypted_password = v_encrypted_pw,
        raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', array['email'], 'user_role', p_role, 'org_id', p_org_id),
        confirmation_token = COALESCE(auth.users.confirmation_token, ''),
        recovery_token = COALESCE(auth.users.recovery_token, ''),
        email_change_token_new = COALESCE(auth.users.email_change_token_new, ''),
        email_change = COALESCE(auth.users.email_change, '');

    -- Email/password sign-in also requires a matching identity row.
    INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        provider,
        identity_data,
        last_sign_in_at,
        created_at,
        updated_at
    )
    VALUES (
        p_user_id,
        p_user_id,
        p_user_id::TEXT,
        'email',
        jsonb_build_object('sub', p_user_id::TEXT, 'email', p_email, 'email_verified', true),
        now(),
        now(),
        now()
    )
    ON CONFLICT (provider_id, provider) DO NOTHING;

    -- Insert or update user_profiles
    INSERT INTO user_profiles (
        id,
        org_id,
        role,
        full_name,
        email,
        phone_e164
    )
    VALUES (
        p_user_id,
        p_org_id,
        p_role,
        p_full_name,
        p_email,
        '919876543210'
    )
    ON CONFLICT (id) DO UPDATE SET
        role = p_role,
        full_name = p_full_name,
        org_id = p_org_id,
        is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- 3. Provision the 7 Role Test Logins
-- Persona 1: Managing Director / CEO (Global oversight)
SELECT seed_crm_user(
    '11111111-1111-1111-1111-111111111111',
    'md@infrivasolutions.com',
    'Infriva2026!',
    'Arpan Tyagi (MD / CEO)',
    'MD_CEO',
    '00000000-0000-0000-0000-000000000001'
);

-- Persona 2: Sales & RevOps (Inbound leads, Twilio calls, quotations)
SELECT seed_crm_user(
    '22222222-2222-2222-2222-222222222222',
    'sales@infrivasolutions.com',
    'Infriva2026!',
    'Rohan Sharma (RevOps Lead)',
    'SALES_REP',
    '00000000-0000-0000-0000-000000000001'
);

-- Persona 3: Web Dev & Coding (Octokit repo generator, Vercel deployments, warranty)
SELECT seed_crm_user(
    '33333333-3333-3333-3333-333333333333',
    'dev@infrivasolutions.com',
    'Infriva2026!',
    'Aditya Verma (Principal Web Architect)',
    'WEB_DEVELOPER',
    '00000000-0000-0000-0000-000000000001'
);

-- Persona 4: SMM & Paid Media (20th SLA calendar, Instagram publisher, Meta ODAX)
SELECT seed_crm_user(
    '44444444-4444-4444-4444-444444444444',
    'smm@infrivasolutions.com',
    'Infriva2026!',
    'Pooja Nair (Growth & Media Lead)',
    'SMM_MEDIA',
    '00000000-0000-0000-0000-000000000001'
);

-- Persona 5: Graphic Designers & Video Editors (Asset studio, FFmpeg check, Figma specs)
SELECT seed_crm_user(
    '55555555-5555-5555-5555-555555555555',
    'creative@infrivasolutions.com',
    'Infriva2026!',
    'Kavita Patel (Creative Director)',
    'DESIGNER_EDITOR',
    '00000000-0000-0000-0000-000000000001'
);

-- Persona 6: SEO, GEO & Editorial (Schema graphs, GA4 telemetry, staging CWV gate)
SELECT seed_crm_user(
    '66666666-6666-6666-6666-666666666666',
    'seo@infrivasolutions.com',
    'Infriva2026!',
    'Sameer Rao (SEO & GEO Engineer)',
    'SEO_EDITORIAL',
    '00000000-0000-0000-0000-000000000001'
);

-- Persona 7: External Client View (Tenant-isolated milestones, staging preview, 48h approval)
SELECT seed_crm_user(
    '77777777-7777-7777-7777-777777777777',
    'client@flyinglyte.com',
    'Infriva2026!',
    'Karan Mehra (FlyingLyte Product Lead)',
    'CLIENT_VIEW',
    '00000000-0000-0000-0000-000000000002'
);

DROP FUNCTION IF EXISTS seed_crm_user;
