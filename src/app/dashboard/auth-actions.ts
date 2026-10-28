'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { ROLE_HOME, TEST_PERSONA_EMAILS, TEST_PERSONAS_ENABLED, isUserRole } from '@/lib/crm-roles';

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

/**
 * Role Simulator (development only): signs in as the seeded test persona for
 * `role`, so every screen is exercised with that persona's real RLS claims.
 */
export async function simulateRoleAction(role: string): Promise<{ error: string } | void> {
  if (!TEST_PERSONAS_ENABLED) return { error: 'The Role Simulator is disabled in production.' };
  if (!isUserRole(role)) return { error: 'Unknown role.' };

  const supabase = await createClient();
  await supabase.auth.signOut();
  const { error } = await supabase.auth.signInWithPassword({
    email: TEST_PERSONA_EMAILS[role],
    password: process.env.CRM_SEED_PASSWORD || 'Infriva2026!',
  });
  if (error) {
    return { error: `Could not sign in as ${TEST_PERSONA_EMAILS[role]}: ${error.message}. Has supabase/seed_test_logins.sql been run?` };
  }
  redirect(ROLE_HOME[role]);
}
