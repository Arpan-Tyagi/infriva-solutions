/**
 * @file src/app/api/webhooks/github/route.ts
 * @description GitHub Webhook Receiver for PRs, Commits, and Issue Sync
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { safeTimingEqual } from '@/lib/crypto-safe';

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';

function verifyGitHubSignature(payload: string, signature: string | null): boolean {
  if (!GITHUB_WEBHOOK_SECRET) {
    if (process.env.NODE_ENV === 'production') return false;
    return true; // dev bypass
  }
  if (!signature || !signature.startsWith('sha256=')) return false;

  const expected = signature.replace('sha256=', '');
  const digest = crypto
    .createHmac('sha256', GITHUB_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return safeTimingEqual(expected, digest);
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');

    if (!verifyGitHubSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const repoName = payload.repository?.name;
    if (!repoName) return NextResponse.json({ status: 'ignored: no repo' }, { status: 200 });

    // Lookup repository in CRM
    const { data: repoRecord } = await supabaseAdmin
      .from('dev_repositories')
      .select('id, project_id')
      .eq('github_repo_name', repoName)
      .maybeSingle();

    if (!repoRecord) {
      return NextResponse.json({ status: 'ignored: untracked repository' }, { status: 200 });
    }

    // Handle pull_request events
    if (event === 'pull_request') {
      const pr = payload.pull_request;
      const action = payload.action; // opened, closed, merged
      const branchName = pr.head?.ref;
      const prUrl = pr.html_url;

      let taskStatus: 'PR_OPEN' | 'COMPLETED' | 'STAGING_QA' = 'PR_OPEN';
      if (action === 'closed' && pr.merged) {
        taskStatus = 'COMPLETED';
      } else if (action === 'closed') {
        taskStatus = 'STAGING_QA';
      }

      // Update matching engineering_tasks by branch or PR URL
      await supabaseAdmin
        .from('engineering_tasks')
        .update({
          github_pr_url: prUrl,
          status: taskStatus,
          updated_at: new Date().toISOString(),
        })
        .match({ project_id: repoRecord.project_id, branch_name: branchName });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('GitHub Webhook error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
