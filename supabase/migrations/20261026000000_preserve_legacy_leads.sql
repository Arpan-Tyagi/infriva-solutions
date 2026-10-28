-- ==============================================================================
-- INFRIVA SOLUTIONS - PRESERVE LEGACY WEBSITE LEADS TABLE
-- Migration Version: 20261026000000 (runs before the CRM core schema)
--
-- The marketing site historically wrote contact-form and chat leads into a
-- flat `public.leads` table (name, company, phone, service, ... / platform,
-- sender_id, message). The CRM core schema needs `public.leads` for its own
-- relational model, so the legacy table is renamed to `public.leads_legacy`
-- (with its indexes, constraints and sequences) before the core migration
-- runs. Rows are copied into the CRM model by 20261028000100.
--
-- Safe to run on a fresh database (no-op) and idempotent on re-run.
-- ==============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Only act when a `leads` table exists that is NOT the CRM model
    -- (the CRM model always has a `stage` column).
    IF to_regclass('public.leads') IS NULL THEN
        RETURN;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'stage'
    ) THEN
        RETURN;
    END IF;

    IF to_regclass('public.leads_legacy') IS NOT NULL THEN
        RAISE EXCEPTION 'Both public.leads (legacy shape) and public.leads_legacy exist; resolve manually before migrating.';
    END IF;

    ALTER TABLE public.leads RENAME TO leads_legacy;

    -- Rename indexes (incl. the primary key index `leads_pkey`) so the CRM
    -- table can create its own `leads_*` objects without name collisions.
    FOR r IN
        SELECT c.relname
        FROM pg_index i
        JOIN pg_class c ON c.oid = i.indexrelid
        WHERE i.indrelid = 'public.leads_legacy'::regclass
          AND c.relname LIKE 'leads\_%'
    LOOP
        EXECUTE format('ALTER INDEX public.%I RENAME TO %I', r.relname, 'leads_legacy_' || substr(r.relname, 7));
    END LOOP;

    -- Rename non-index constraints (CHECK / FK) that carry the old prefix.
    FOR r IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.leads_legacy'::regclass
          AND contype IN ('c', 'f')
          AND conname LIKE 'leads\_%'
    LOOP
        EXECUTE format('ALTER TABLE public.leads_legacy RENAME CONSTRAINT %I TO %I', r.conname, 'leads_legacy_' || substr(r.conname, 7));
    END LOOP;

    -- Rename owned sequences (e.g. `leads_id_seq` from a SERIAL id).
    FOR r IN
        SELECT s.relname
        FROM pg_class s
        JOIN pg_depend d ON d.objid = s.oid AND d.deptype IN ('a', 'i')
        WHERE s.relkind = 'S'
          AND d.refobjid = 'public.leads_legacy'::regclass
          AND s.relname LIKE 'leads\_%'
    LOOP
        EXECUTE format('ALTER SEQUENCE public.%I RENAME TO %I', r.relname, 'leads_legacy_' || substr(r.relname, 7));
    END LOOP;

    RAISE NOTICE 'Renamed legacy public.leads to public.leads_legacy';
END $$;
