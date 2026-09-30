/**
 * @file src/lib/supabase.ts
 * @description Supabase Client Initialization & Architecture Guide
 *
 * Infriva Solutions utilizes Supabase as its primary managed PostgreSQL database.
 * This file instantiates the singleton Supabase JavaScript client used across both
 * server-side API routes and client-side components to interact with PostgreSQL.
 *
 * Architecture & Security Decisions:
 * 1. Environment Variables:
 *    - `NEXT_PUBLIC_SUPABASE_URL`: The unique API gateway URL for the Supabase project.
 *    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The public anonymous key. Safe to expose to the browser
 *      because table access is strictly governed by Postgres Row Level Security (RLS) policies.
 * 2. Row Level Security (RLS):
 *    - All tables (`leads`, `chat_messages`) have RLS enabled.
 *    - Anon keys are restricted by RLS to only execute permitted INSERT/SELECT operations.
 * 3. Connection Pooling:
 *    - In serverless environments (Next.js App Router on Vercel), HTTP-based Supabase REST
 *      requests bypass traditional Postgres connection limits (PgBouncer integration).
 */

import { createClient } from '@supabase/supabase-js';

// Project URL from Supabase dashboard (e.g., https://xyzcompany.supabase.co)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Anonymous public API key with Row Level Security (RLS) restrictions
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Shared Supabase Client Instance
 *
 * Can be imported by:
 * - Server Route Handlers (`src/app/api/contact/route.ts`, `src/app/api/meta/webhook/route.ts`)
 * - Client-side state hydration hooks
 *
 * @example
 * ```ts
 * import { supabase } from '@/lib/supabase';
 * const { data, error } = await supabase.from('leads').insert([newLead]);
 * ```
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
