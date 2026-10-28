/**
 * @file scripts/db/pglite-supabase.mjs
 * @description In-memory Postgres (PGlite) with a minimal Supabase shim.
 *
 * Gives the verification scripts a real Postgres engine to run the migrations,
 * RLS policies and triggers against without Docker or a live project:
 * - roles: anon, authenticated, service_role (BYPASSRLS), supabase_auth_admin
 * - auth schema: users, identities, uid(), jwt(), role()
 * - supabase_realtime publication
 * - Supabase-style default grants on the public schema
 *
 * `asUser(db, claims, fn)` runs `fn` inside a transaction as the
 * `authenticated` (or `service_role`) role with request.jwt.claims set,
 * which is what PostgREST does for each API request.
 */

import { PGlite } from '@electric-sql/pglite';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_SHIM_SQL = `
DO $$ BEGIN
  CREATE ROLE anon NOLOGIN;
  CREATE ROLE authenticated NOLOGIN;
  CREATE ROLE service_role NOLOGIN BYPASSRLS;
  CREATE ROLE supabase_auth_admin NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  instance_id UUID,
  id UUID PRIMARY KEY,
  aud TEXT,
  role TEXT,
  email TEXT,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMPTZ,
  raw_app_meta_data JSONB,
  raw_user_meta_data JSONB,
  confirmation_token TEXT,
  recovery_token TEXT,
  email_change_token_new TEXT,
  email_change TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS auth.identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  identity_data JSONB NOT NULL,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE (provider_id, provider)
);

CREATE OR REPLACE FUNCTION auth.jwt() RETURNS JSONB LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true), '')::jsonb;
$$;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT NULLIF(auth.jwt() ->> 'sub', '')::uuid;
$$;

CREATE OR REPLACE FUNCTION auth.role() RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT auth.jwt() ->> 'role';
$$;

GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

DO $$ BEGIN
  CREATE PUBLICATION supabase_realtime;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`;

export async function createSupabaseShim() {
  const db = new PGlite({ extensions: { uuid_ossp, pgcrypto } });
  await db.exec('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  await db.exec(SUPABASE_SHIM_SQL);
  return db;
}

export function listMigrations(root = process.cwd()) {
  const dir = path.join(root, 'supabase', 'migrations');
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => ({ name: f, sql: fs.readFileSync(path.join(dir, f), 'utf8') }));
}

export async function applyMigrations(db, root = process.cwd()) {
  for (const m of listMigrations(root)) {
    try {
      // Each migration file runs in its own transaction, like `supabase db push`.
      await db.exec(`BEGIN;\n${m.sql}\nCOMMIT;`);
    } catch (err) {
      await db.exec('ROLLBACK;').catch(() => {});
      throw new Error(`Migration ${m.name} failed: ${err.message}`);
    }
  }
}

export async function applySeed(db, file = 'supabase/seed_test_logins.sql', root = process.cwd()) {
  await db.exec(fs.readFileSync(path.join(root, file), 'utf8'));
}

/**
 * Run `fn(tx)` as an API request would: SET ROLE + JWT claims, in a
 * transaction that is committed (or rolled back if `fn` throws).
 */
export async function asUser(db, claims, fn) {
  const pgRole = claims.role === 'service_role' ? 'service_role' : claims.role === 'anon' ? 'anon' : 'authenticated';
  return db.transaction(async (tx) => {
    await tx.query(`SELECT set_config('request.jwt.claims', $1, true)`, [JSON.stringify(claims)]);
    await tx.exec(`SET LOCAL ROLE ${pgRole};`);
    return fn(tx);
  });
}

/** Claims as Supabase issues them for a seeded persona (role/org in app_metadata). */
export function personaClaims(userId, userRole, orgId) {
  return {
    sub: userId,
    role: 'authenticated',
    aud: 'authenticated',
    app_metadata: { provider: 'email', user_role: userRole, org_id: orgId },
    user_metadata: {},
  };
}
