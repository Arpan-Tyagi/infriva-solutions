/**
 * @file src/lib/github-octokit.ts
 * @description GitHub REST API & Octokit Repository Template Provisioner
 *
 * Automates client repository creation from Infriva Solutions' standard template:
 * POST /repos/{template_owner}/{template_repo}/generate
 * Seeds 6 initial architectural issues matching the engineering lifecycle.
 */

import { supabaseAdmin } from '@/lib/supabase-admin';

const GITHUB_TOKEN = process.env.GITHUB_ADMIN_TOKEN || process.env.GITHUB_APP_INSTALLATION_TOKEN || '';
const TEMPLATE_OWNER = process.env.GITHUB_TEMPLATE_OWNER || 'infriva-solutions';
const TEMPLATE_REPO = process.env.GITHUB_TEMPLATE_REPO || 'nextjs16-crm-template';

export interface ProvisionRepoParams {
  projectId: string;
  clientRepoName: string;
  leadDevId?: string;
  isPrivate?: boolean;
}

/**
 * Clones the template repository into a new client repository within the organization
 */
export async function provisionClientRepository({
  projectId,
  clientRepoName,
  leadDevId,
  isPrivate = true,
}: ProvisionRepoParams) {
  if (!GITHUB_TOKEN) {
    // Simulated generation for environments without live GitHub credentials
    const mockRepoUrl = `https://github.com/${TEMPLATE_OWNER}/${clientRepoName}`;
    const { data: repoRecord, error } = await supabaseAdmin
      .from('dev_repositories')
      .insert([
        {
          project_id: projectId,
          lead_dev_id: leadDevId || null,
          github_repo_owner: TEMPLATE_OWNER,
          github_repo_name: clientRepoName,
          github_repo_url: mockRepoUrl,
          tech_stack: ['Next.js 16', 'React 19', 'Supabase RLS', 'TypeScript', 'Tailwind v4'],
        },
      ])
      .select('id')
      .single();

    return {
      success: true,
      repoId: repoRecord?.id,
      repoUrl: mockRepoUrl,
      mock: true,
      message: 'GitHub token not configured; repository record provisioned in CRM database.',
    };
  }

  try {
    // 1. Call GitHub Template Generation Endpoint
    const generateUrl = `https://api.github.com/repos/${TEMPLATE_OWNER}/${TEMPLATE_REPO}/generate`;
    const genRes = await fetch(generateUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Infriva-CRM-Octokit-Provisioner',
      },
      body: JSON.stringify({
        owner: TEMPLATE_OWNER,
        name: clientRepoName,
        description: `Bespoke digital property engineered by Infriva Solutions for project ${projectId}`,
        private: isPrivate,
      }),
    });

    if (!genRes.ok) {
      const errText = await genRes.text();
      return { success: false, error: `GitHub template generation failed: ${errText}` };
    }

    const repoData = await genRes.json();
    const repoUrl = repoData.html_url;

    // 2. Persist repository record in dev_repositories
    const { data: repoRecord } = await supabaseAdmin
      .from('dev_repositories')
      .insert([
        {
          project_id: projectId,
          lead_dev_id: leadDevId || null,
          github_repo_owner: TEMPLATE_OWNER,
          github_repo_name: clientRepoName,
          github_repo_url: repoUrl,
          tech_stack: ['Next.js 16', 'React 19', 'Supabase RLS', 'TypeScript', 'Tailwind v4'],
        },
      ])
      .select('id')
      .single();

    const repoId = repoRecord?.id;

    // 3. Seed 6 Initial Engineering Lifecycle Issues
    const issues = [
      {
        title: '01 Consultation & System Architecture Specification',
        body: 'Audit requirements, target user journeys, and bottleneck prevention points.',
      },
      {
        title: '02 Data Flow & Relational Schema Blueprint',
        body: 'Configure Supabase tables, RLS security policies, and webhook idempotency filters.',
      },
      {
        title: '03 Figma Design System & UI/UX Tokens Integration',
        body: 'Implement Swiss Brutalist design tokens, typography, and responsive grid layouts.',
      },
      {
        title: '04 Full-Stack Next.js 16 & External API Engineering',
        body: 'Engineer App Router pages, Server Actions, WhatsApp Cloud API, and Meta CAPI.',
      },
      {
        title: '05 Pre-Launch Stress Testing & Core Web Vitals (<1.5s LCP) QA',
        body: 'Conduct Lighthouse audit, Schema.org validation, and cross-browser rendering checks.',
      },
      {
        title: '06 Zero-Downtime Production Deployment & 90-Day Warranty Setup',
        body: 'Configure custom domain DNS, edge revalidation webhooks, and start 90-day SLA timer.',
      },
    ];

    for (const issue of issues) {
      await fetch(`https://api.github.com/repos/${TEMPLATE_OWNER}/${clientRepoName}/issues`, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'Infriva-CRM-Octokit-Provisioner',
        },
        body: JSON.stringify(issue),
      });
    }

    return {
      success: true,
      repoId,
      repoUrl,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
