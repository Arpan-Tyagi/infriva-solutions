"use client";

import { useState } from "react";
import { MOCK_TASKS, MOCK_DEPLOYMENTS, MOCK_PROJECTS } from "@/lib/crm-mock-data";

export default function EngineeringDashboard() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [deployment, setDeployment] = useState(MOCK_DEPLOYMENTS[0]);
  const [provisioning, setProvisioning] = useState(false);
  const [provisionResult, setProvisionResult] = useState<string | null>(null);

  // Pre-Launch Gate States
  const cwvPassed = deployment.cwv_passed && (deployment.lcp_ms ? deployment.lcp_ms < 1500 : true);
  const seoQaApproved = deployment.seo_qa_approved;
  const canPromote = cwvPassed && seoQaApproved;

  const handleToggleSeoSignOff = () => {
    setDeployment((prev) => ({
      ...prev,
      seo_qa_approved: !prev.seo_qa_approved,
    }));
  };

  const handlePromoteToProduction = () => {
    if (!canPromote) return;
    alert("Zero-Downtime Production Deployment Triggered! Project status transitioned to WARRANTY_90D (90-day post-launch warranty timer activated).");
  };

  const handleScaffoldRepo = () => {
    setProvisioning(true);
    setTimeout(() => {
      setProvisioning(false);
      setProvisionResult("github.com/infriva-solutions/singhania-luxury-portal");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-[#FBF8F3]">
            Web Dev & Coding Cockpit (/dashboard/engineering)
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            GitHub Octokit repository provisioning, Vercel edge preview telemetry, and pre-launch dual-gate QA controller.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleScaffoldRepo}
            disabled={provisioning}
            className="px-3 py-1.5 rounded bg-[#FBF8F3] hover:bg-white text-black font-semibold text-xs font-mono transition-colors disabled:opacity-50"
          >
            {provisioning ? "Cloning Next.js 16 Template..." : "+ Provision Client Repo (Octokit)"}
          </button>
        </div>
      </div>

      {provisionResult && (
        <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center justify-between">
          <span>✓ Client template cloned with Supabase RLS and seeded with 6 initial engineering issues!</span>
          <span className="underline">{provisionResult}</span>
        </div>
      )}

      {/* Pre-Launch Dual-Gate QA Controller Banner */}
      <div className="p-5 rounded border border-white/10 bg-[#121214] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold font-mono text-[#FBF8F3] flex items-center gap-2">
              <span>Dual-Gate Production Launch Controller</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                FlyingLyte Staging Candidate
              </span>
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Production promotion mathematically blocked until sub-1.5s LCP telemetry and SEO/GEO Schema.org audit pass.
            </p>
          </div>

          <button
            onClick={handlePromoteToProduction}
            disabled={!canPromote}
            className={`px-4 py-2 rounded text-xs font-mono font-bold transition-all ${
              canPromote
                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20"
                : "bg-white/10 text-zinc-500 cursor-not-allowed"
            }`}
          >
            {canPromote ? "✓ Promote Staging to Production (Start 90D Warranty)" : "🔒 Promotion Gated (Dual Sign-Off Required)"}
          </button>
        </div>

        {/* 3 Quality Gates Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Gate 1: CWV Sub-1.5s LCP */}
          <div className={`p-3.5 rounded border ${cwvPassed ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white">Gate 1: Core Web Vitals</span>
              <span className={cwvPassed ? "text-emerald-400" : "text-rose-400"}>
                {cwvPassed ? "PASSED" : "FAILED"}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              LCP Telemetry: <strong className="text-white">{deployment.lcp_ms}ms</strong> (Limit: &lt; 1500ms)
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Verified on edge preview runner</div>
          </div>

          {/* Gate 2: SEO Team Sign-off */}
          <div className={`p-3.5 rounded border ${seoQaApproved ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-amber-950/20 border-amber-500/30'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white">Gate 2: Technical SEO QA</span>
              <button
                onClick={handleToggleSeoSignOff}
                className="text-[10px] underline text-zinc-300 hover:text-white"
              >
                {seoQaApproved ? "Revoke Sign-off" : "Approve (SEO Team)"}
              </button>
            </div>
            <div className="text-[11px] text-zinc-400">
              Schema.org & Entity Graph: <strong className={seoQaApproved ? "text-emerald-400" : "text-amber-400"}>
                {seoQaApproved ? "Verified & Signed" : "Pending Sign-off"}
              </strong>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Inspected in SEO/GEO portal</div>
          </div>

          {/* Gate 3: Webhook Non-Localhost Verification */}
          <div className="p-3.5 rounded border bg-emerald-950/20 border-emerald-500/30">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white">Gate 3: Edge Webhooks</span>
              <span className="text-emerald-400">VERIFIED</span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Live Preview URL: <a href={deployment.preview_url} target="_blank" className="text-cyan-400 underline truncate block">{deployment.preview_url}</a>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Production CSP & SSL compliant</div>
          </div>
        </div>
      </div>

      {/* 6-Stage Engineering Sprint Kanban */}
      <div className="space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            6-Stage Engineering Sprint Board (FlyingLyte & StarX)
          </h2>
          <span className="text-xs text-zinc-400">Synced to GitHub Issues & PRs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Backlog */}
          <div className="rounded border border-white/10 bg-[#121214] p-3 space-y-2.5">
            <div className="text-xs font-bold text-zinc-400 pb-2 border-b border-white/5 flex justify-between">
              <span>BACKLOG</span>
              <span>1</span>
            </div>
            <div className="p-3 rounded bg-white/[0.02] border border-white/5 space-y-1 text-xs">
              <span className="text-[10px] text-amber-400 font-semibold">ARCHITECTURE_PLAN</span>
              <div className="text-white font-medium">06 Zero-Downtime Deployment & 90-Day Warranty Setup</div>
              <div className="text-[10px] text-zinc-500">FlyingLyte Staging</div>
            </div>
          </div>

          {/* In Progress */}
          <div className="rounded border border-white/10 bg-[#121214] p-3 space-y-2.5">
            <div className="text-xs font-bold text-zinc-400 pb-2 border-b border-white/5 flex justify-between">
              <span>IN PROGRESS</span>
              <span>1</span>
            </div>
            <div className="p-3 rounded bg-white/[0.02] border border-white/5 space-y-1 text-xs">
              <span className="text-[10px] text-rose-400 font-semibold">SEO_CWV_QA</span>
              <div className="text-white font-medium">Pre-Launch Stress Testing & Sub-1.5s LCP Verification</div>
              <div className="text-[10px] text-zinc-500">Branch: perf/cwv-lcp-tune</div>
            </div>
          </div>

          {/* Staging QA */}
          <div className="rounded border border-white/10 bg-[#121214] p-3 space-y-2.5">
            <div className="text-xs font-bold text-zinc-400 pb-2 border-b border-white/5 flex justify-between">
              <span>STAGING QA</span>
              <span>1</span>
            </div>
            <div className="p-3 rounded bg-white/[0.02] border border-white/5 space-y-1 text-xs">
              <span className="text-[10px] text-cyan-400 font-semibold">FRONTEND_NEXTJS</span>
              <div className="text-white font-medium">Integrate TBO Air API Flight Search & Matrix Filter</div>
              <div className="text-[10px] text-zinc-500">PR #42 Open</div>
            </div>
          </div>

          {/* Completed & Warranty */}
          <div className="rounded border border-white/10 bg-[#121214] p-3 space-y-2.5">
            <div className="text-xs font-bold text-zinc-400 pb-2 border-b border-white/5 flex justify-between">
              <span>COMPLETED / WARRANTY</span>
              <span>1</span>
            </div>
            <div className="p-3 rounded bg-white/[0.02] border border-white/5 space-y-1 text-xs">
              <span className="text-[10px] text-emerald-400 font-semibold">WARRANTY_BUG</span>
              <div className="text-white font-medium">OTA Commission Dashboard Filter Discrepancy</div>
              <div className="text-[10px] text-zinc-500">StarX Hotel (90D Warranty)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
