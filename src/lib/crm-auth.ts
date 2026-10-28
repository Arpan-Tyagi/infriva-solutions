/**
 * @file src/lib/crm-auth.ts
 * @description Server-side session + role checks for CRM pages and server actions.
 *
 * The role comes from user_profiles (the source of truth that RLS claims are
 * synced from), read through the user's own RLS-scoped client.
 */

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { ROLE_HOME, isUserRole } from '@/lib/crm-roles';
import type { UserRole } from '@/types/crm';

export interface Viewer {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  orgId: string;
  phoneE164: string | null;
  initials: string;
}

function initialsOf(name: string) {
  return (
    name
      .replace(/\(.*?\)/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('') || '?'
  );
}

/** The signed-in CRM user, or null. Deduplicated per request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, email, full_name, role, org_id, phone_e164, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !profile.is_active || !isUserRole(profile.role)) return null;

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    orgId: profile.org_id,
    phoneE164: profile.phone_e164,
    initials: initialsOf(profile.full_name),
  };
});

/** For pages: redirects to /login when signed out, or to the role's home when not allowed. */
export async function requireViewer(allowed?: UserRole[]): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect('/login');
  if (allowed && !allowed.includes(viewer.role)) redirect(ROLE_HOME[viewer.role]);
  return viewer;
}

export class CrmAuthError extends Error {}

/** For server actions: throws instead of redirecting so the UI can show the reason. */
export async function assertViewer(allowed: UserRole[]): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) throw new CrmAuthError('Your session has expired. Please sign in again.');
  if (!allowed.includes(viewer.role)) throw new CrmAuthError('Your role is not allowed to do this.');
  return viewer;
}
