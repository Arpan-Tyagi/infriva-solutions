/**
 * @file src/lib/crm-roles.ts
 * @description Role metadata shared by the login page, CRM shell and Role Simulator.
 * Safe to import from client and server code.
 */

import type { UserRole } from '@/types/crm';

export const ROLE_HOME: Record<UserRole, string> = {
  MD_CEO: '/dashboard/executive',
  SALES_REP: '/dashboard/sales',
  WEB_DEVELOPER: '/dashboard/engineering',
  SMM_MEDIA: '/dashboard/smm',
  DESIGNER_EDITOR: '/dashboard/creative',
  SEO_EDITORIAL: '/dashboard/seo',
  // The client portal is still on sample data; it moves to the client's real project later.
  CLIENT_VIEW: '/portal/client/proj-flyinglyte',
};

export const ROLE_LABEL: Record<UserRole, string> = {
  MD_CEO: 'MD / CEO',
  SALES_REP: 'Sales & RevOps',
  WEB_DEVELOPER: 'Web Dev & Coding',
  SMM_MEDIA: 'SMM & Paid Media',
  DESIGNER_EDITOR: 'Design & Video',
  SEO_EDITORIAL: 'SEO & GEO',
  CLIENT_VIEW: 'Client',
};

export const ALL_ROLES = Object.keys(ROLE_HOME) as UserRole[];

/** Seeded test logins (supabase/seed_test_logins.sql). */
export const TEST_PERSONA_EMAILS: Record<UserRole, string> = {
  MD_CEO: 'md@infrivasolutions.com',
  SALES_REP: 'sales@infrivasolutions.com',
  WEB_DEVELOPER: 'dev@infrivasolutions.com',
  SMM_MEDIA: 'smm@infrivasolutions.com',
  DESIGNER_EDITOR: 'creative@infrivasolutions.com',
  SEO_EDITORIAL: 'seo@infrivasolutions.com',
  CLIENT_VIEW: 'client@flyinglyte.com',
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (ALL_ROLES as string[]).includes(value);
}

/** Dev tooling (test persona pills, Role Simulator) is off in production unless explicitly enabled. */
export const TEST_PERSONAS_ENABLED =
  process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_CRM_TEST_PERSONAS === 'true';
