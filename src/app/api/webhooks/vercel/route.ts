/**
 * @file src/app/api/webhooks/vercel/route.ts
 * @description Vercel Edge Deployment Webhook Receiver
 *
 * Ingests deployment.created, deployment.succeeded, deployment.error.
 * Upserts dev_deployments with preview_url, branch, and commit metadata.
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { safeTimingEqual } from '@/lib/crypto-safe';

const VERCEL_WEBHOOK_SECRET = process.env.VERCEL_WEBHOOK_SECRET || '';

function verifyVercelSignature(payload: string, signature: string | null): boolean {
  if (!VERCEL_WEBHOOK_SECRET) {
    if (process.env.NODE_ENV === 'production') return false;
    return true; // dev bypass
  }
  if (!signature) return false;

  const digest = crypto
    .createHmac('sha1', VERCEL_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return safeTimingEqual(digest, signature);
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-vercel-signature');

    if (!verifyVercelSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid Vercel signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const type = payload.type; // deployment.created, deployment.succeeded, deployment.error
    const deployment = payload.payload?.deployment || payload.deployment || {};

    const vercelDeploymentId = deployment.id;
    const previewUrl = deployment.url ? `https://${deployment.url}` : '';
    const gitBranch = deployment.meta?.githubCommitRef || deployment.meta?.gitBranch || 'main';
    const gitCommitSha = deployment.meta?.githubCommitSha || deployment.meta?.gitCommitSha || '';
    const projectId = deployment.projectId;

    if (!vercelDeploymentId || !previewUrl) {
      return NextResponse.json({ status: 'ignored: missing deployment details' }, { status: 200 });
    }

    let buildStatus: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' = 'BUILDING';
    if (type === 'deployment.succeeded') buildStatus = 'READY';
    else if (type === 'deployment.error' || type === 'deployment.canceled') buildStatus = 'ERROR';
    else if (type === 'deployment.created') buildStatus = 'QUEUED';

    // Lookup repository associated with this Vercel project or fallback to active project
    const { data: repoRecord } = await supabaseAdmin
      .from('dev_repositories')
      .select('id, project_id')
      .eq('vercel_project_id', projectId)
      .maybeSingle();

    if (repoRecord) {
      await supabaseAdmin.from('dev_deployments').upsert(
        [
          {
            repo_id: repoRecord.id,
            project_id: repoRecord.project_id,
            git_commit_sha: gitCommitSha,
            git_branch: gitBranch,
            vercel_deployment_id: vercelDeploymentId,
            preview_url: previewUrl,
            environment: gitBranch === 'main' ? 'PRODUCTION' : 'PREVIEW',
            build_status: buildStatus,
            // If deployment succeeded, flag initial CWV evaluation
            cwv_passed: buildStatus === 'READY',
          },
        ],
        { onConflict: 'vercel_deployment_id' }
      );
    }

    return NextResponse.json({ success: true, deploymentId: vercelDeploymentId, buildStatus }, { status: 200 });
  } catch (err) {
    console.error('Vercel Webhook error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
