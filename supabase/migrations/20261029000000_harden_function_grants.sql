-- ==============================================================================
-- INFRIVA SOLUTIONS - FUNCTION EXECUTE GRANTS (Supabase security advisor)
-- Migration Version: 20261029000000
--
-- Supabase grants EXECUTE on new public functions to anon/authenticated, which
-- exposes them at /rest/v1/rpc/*. Trigger functions only ever run as triggers
-- (EXECUTE is checked when the trigger is created, not when it fires), so
-- nobody needs to call them over the API.
-- ==============================================================================

DO $$
DECLARE
    fn TEXT;
BEGIN
    FOREACH fn IN ARRAY ARRAY[
        'public.sync_profile_claims_to_auth()',
        'public.trg_on_lead_won_provision_project()',
        'public.trg_leads_route_on_insert()',
        'public.trg_leads_log_insert()',
        'public.trg_leads_log_update()',
        'public.trg_call_logs_rollup_insert()',
        'public.trg_call_logs_rollup_status()',
        'public.trg_quotations_after_write()',
        'public.trg_follow_ups_sync_lead()'
    ] LOOP
        EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
    END LOOP;
END $$;

-- Used by the (invoker-rights) quotation workflow trigger while a signed-in
-- user approves a quote, so authenticated keeps it; anonymous callers do not.
REVOKE ALL ON FUNCTION public.current_profile_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_profile_id() TO authenticated, service_role;

-- Pin the search_path of the shared updated_at trigger function.
ALTER FUNCTION public.update_modified_column() SET search_path = '';
