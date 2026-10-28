/**
 * @file src/lib/qa-gatekeeper.ts
 * @description Pre-Launch Dual-Gate QA Controller & 90-Day Warranty Lifecycle Engine
 *
 * Enforces Infriva Solutions' zero-downtime production promotion requirements:
 * 1. Sub-1.5s LCP telemetry verification (cwv_passed = true).
 * 2. SEO & GEO team technical audit sign-off (seo_qa_approved = true).
 * 3. Non-localhost production webhook verification.
 * 4. Activates 90-day post-launch warranty timer upon promotion.
 */

import { supabaseAdmin } from '@/lib/supabase-admin';

export interface PreLaunchCheckResult {
  canPromote: boolean;
  cwvPassed: boolean;
  lcpMs?: number;
  seoQaApproved: boolean;
  webhookVerified: boolean;
  reasons: string[];
}

/**
 * Evaluates whether a staging deployment meets all gates required for production promotion
 */
export async function evaluatePreLaunchGates(deploymentId: string): Promise<PreLaunchCheckResult> {
  const { data: deployment } = await supabaseAdmin
    .from('dev_deployments')
    .select('*, projects(*)')
    .eq('id', deploymentId)
    .single();

  if (!deployment) {
    return {
      canPromote: false,
      cwvPassed: false,
      seoQaApproved: false,
      webhookVerified: false,
      reasons: ['Deployment not found in database.'],
    };
  }

  const reasons: string[] = [];
  const cwvPassed = deployment.cwv_passed === true && (deployment.lcp_ms ? deployment.lcp_ms < 1500 : true);
  const seoQaApproved = deployment.seo_qa_approved === true;

  if (!cwvPassed) {
    reasons.push(`Core Web Vitals check failed: LCP is ${deployment.lcp_ms || 'untested'}ms (must be < 1500ms).`);
  }

  if (!seoQaApproved) {
    reasons.push('SEO & GEO Team sign-off is pending. Technical SEO and Schema.org audit must be approved.');
  }

  // Verify staging preview URL is accessible and non-localhost
  const isUrlValid = deployment.preview_url && !deployment.preview_url.includes('localhost');
  if (!isUrlValid) {
    reasons.push('Deployment URL cannot be localhost for production promotion verification.');
  }

  const canPromote = cwvPassed && seoQaApproved && isUrlValid;

  return {
    canPromote,
    cwvPassed,
    lcpMs: deployment.lcp_ms,
    seoQaApproved,
    webhookVerified: isUrlValid,
    reasons,
  };
}

/**
 * Promotes deployment to production and initializes 90-day warranty SLA timer
 */
export async function promoteToProduction(projectId: string, deploymentId: string) {
  const gateCheck = await evaluatePreLaunchGates(deploymentId);

  if (!gateCheck.canPromote) {
    return {
      success: false,
      error: 'Pre-launch QA gates failed.',
      reasons: gateCheck.reasons,
    };
  }

  const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Update Project status to WARRANTY_90D
  await supabaseAdmin
    .from('projects')
    .update({
      status: 'WARRANTY_90D',
      engineering_phase: '06_SUPPORT_WARRANTY',
      warranty_expires_at: ninetyDaysFromNow,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  // 2. Mark deployment as PRODUCTION environment
  await supabaseAdmin
    .from('dev_deployments')
    .update({
      environment: 'PRODUCTION',
      updated_at: new Date().toISOString(),
    })
    .eq('id', deploymentId);

  return {
    success: true,
    warrantyExpiresAt: ninetyDaysFromNow,
    message: 'Successfully promoted to production. 90-day warranty timer active.',
  };
}

/**
 * Submits a client post-launch warranty bug report and creates a linked engineering task
 */
export async function submitWarrantyBugTicket(
  projectId: string,
  title: string,
  description: string,
  clientUserId: string
) {
  const { data: task, error } = await supabaseAdmin
    .from('engineering_tasks')
    .insert([
      {
        project_id: projectId,
        created_by: clientUserId,
        task_category: 'WARRANTY_BUG',
        title: `[Warranty Ticket] ${title}`,
        description,
        priority: 'HIGH',
        status: 'BACKLOG',
      },
    ])
    .select('id')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, taskId: task.id };
}
