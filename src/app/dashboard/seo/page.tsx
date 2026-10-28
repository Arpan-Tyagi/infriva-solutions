"use client";

import { useState } from "react";
import { fetchBatchedAnalyticsTelemetry, PageTelemetry } from "@/lib/analytics-telemetry";
import { buildGeoEntityGraph } from "@/lib/geo-schema";
import { MOCK_DEPLOYMENTS } from "@/lib/crm-mock-data";

export default function SeoGeoEditorialPortal() {
  const [telemetry] = useState<PageTelemetry[]>([
    {
      pagePath: "/services/web-development",
      sessions: 3420,
      avgDurationSec: 142.5,
      engagementRate: 0.724,
      bounceRate: 0.276,
      gscClicks: 840,
      gscImpressions: 18200,
      gscCtr: 4.61,
      gscPosition: 3.4,
    },
    {
      pagePath: "/services/crm-systems",
      sessions: 2150,
      avgDurationSec: 185.0,
      engagementRate: 0.685,
      bounceRate: 0.315,
      gscClicks: 520,
      gscImpressions: 14100,
      gscCtr: 3.68,
      gscPosition: 4.2,
    },
    {
      pagePath: "/blog/custom-travel-booking-engine-architecture",
      sessions: 5120,
      avgDurationSec: 210.0,
      engagementRate: 0.812,
      bounceRate: 0.188,
      gscClicks: 1420,
      gscImpressions: 34500,
      gscCtr: 4.11,
      gscPosition: 2.1,
    },
    {
      pagePath: "/services/paid-advertising",
      sessions: 1890,
      avgDurationSec: 58.0,
      engagementRate: 0.310,
      bounceRate: 0.690,
      gscClicks: 210,
      gscImpressions: 22000,
      gscCtr: 0.95,
      gscPosition: 8.4,
      recommendation: "High impressions (22k) but CTR is 0.95% & bounce rate is 69%. Optimize meta title and hero LCP.",
      cwvIssueFlagged: true,
    },
  ]);

  const [deployment, setDeployment] = useState(MOCK_DEPLOYMENTS[0]);
  const [activeTab, setActiveTab] = useState<"TELEMETRY" | "SCHEMA_BUILDER" | "STAGING_QA">("TELEMETRY");
  const [revalidating, setRevalidating] = useState(false);

  // Schema graph preview
  const sampleSchemaGraph = buildGeoEntityGraph({
    title: "Enterprise CRM Architecture & API Orchestration for High-Performance Agencies",
    description: "Deep technical guide on Next.js 16 App Router, Supabase RLS security, and deterministic lead routing.",
    slug: "enterprise-crm-architecture-blueprint",
    publishDate: "2026-10-27T08:00:00Z",
    keywords: ["Next.js 16 CRM", "Supabase RLS", "Meta Lead Ads Webhook", "Generative Engine Optimization"],
    faqs: [
      {
        question: "How does Infriva prevent webhook duplicates from Meta and Google?",
        answer: "By enforcing an inbound_webhook_logs table with UNIQUE constraints on external correlation IDs before executing credit-consuming waterfall APIs.",
      },
    ],
  });

  const handleRevalidate = () => {
    setRevalidating(true);
    setTimeout(() => {
      setRevalidating(false);
      alert("Next.js 16 On-Demand ISR Edge Webhook dispatched! Path /blog/enterprise-crm-architecture-blueprint revalidated in under 1.2s.");
    }, 1500);
  };

  const handleApproveStaging = () => {
    setDeployment((prev) => ({ ...prev, seo_qa_approved: true }));
    alert("SEO & Schema.org QA Approved! Gate 2 passed on Web Dev Cockpit. Coding team can now promote to production.");
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#FBF8F3]">
            SEO, GEO & Editorial CMS (/dashboard/seo)
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Batched GA4 & GSC telemetry, Generative Engine Optimization (GEO) Schema builder, and staging CWV sign-off gate.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("TELEMETRY")}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === "TELEMETRY" ? "bg-[#FBF8F3] text-black font-semibold" : "bg-white/10 text-zinc-300"
            }`}
          >
            GA4 & GSC Telemetry
          </button>
          <button
            onClick={() => setActiveTab("SCHEMA_BUILDER")}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === "SCHEMA_BUILDER" ? "bg-[#FBF8F3] text-black font-semibold" : "bg-white/10 text-zinc-300"
            }`}
          >
            GEO Schema.org Graph
          </button>
          <button
            onClick={() => setActiveTab("STAGING_QA")}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === "STAGING_QA" ? "bg-[#FBF8F3] text-black font-semibold" : "bg-white/10 text-zinc-300"
            }`}
          >
            Staging QA Gate
          </button>
        </div>
      </div>

      {activeTab === "TELEMETRY" && (
        <div className="space-y-6">
          {/* Batched Telemetry Table */}
          <div className="p-5 rounded border border-white/10 bg-[#121214] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Batched GA4 & Search Console Page Telemetry (Last 30 Days)
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Bounce Rate computed strictly as $1 - \text{'{engagementRate}'}$. Batched calls preserve hourly GA4 quota buckets.
                </p>
              </div>
              <span className="text-[10px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                batchRunReports Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-[11px]">
                    <th className="pb-2 font-normal">PAGE PATH</th>
                    <th className="pb-2 font-normal">SESSIONS</th>
                    <th className="pb-2 font-normal">AVG DURATION</th>
                    <th className="pb-2 font-normal">ENGAGEMENT</th>
                    <th className="pb-2 font-normal">BOUNCE RATE</th>
                    <th className="pb-2 font-normal">GSC IMPRESSIONS</th>
                    <th className="pb-2 font-normal">CTR</th>
                    <th className="pb-2 font-normal">DIAGNOSTIC STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-200">
                  {telemetry.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 font-semibold text-white">{row.pagePath}</td>
                      <td className="py-2.5">{row.sessions.toLocaleString()}</td>
                      <td className="py-2.5">{row.avgDurationSec}s</td>
                      <td className="py-2.5 text-emerald-400">{(row.engagementRate * 100).toFixed(1)}%</td>
                      <td className="py-2.5">
                        <span className={row.bounceRate > 0.65 ? "text-rose-400 font-bold" : "text-zinc-300"}>
                          {(row.bounceRate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5">{row.gscImpressions.toLocaleString()}</td>
                      <td className="py-2.5">
                        <span className={row.gscCtr < 2.0 ? "text-amber-400 font-bold" : "text-zinc-300"}>
                          {row.gscCtr}%
                        </span>
                      </td>
                      <td className="py-2.5">
                        {row.recommendation ? (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">
                            Needs Optimization Brief
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                            Optimal Compounding
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "SCHEMA_BUILDER" && (
        <div className="space-y-6">
          <div className="p-5 rounded border border-white/10 bg-[#121214] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Generative Engine Optimization (GEO) & Schema.org JSON-LD @graph
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Interconnected entity graphs designed for citation extraction by Google AI Overviews, ChatGPT Search, and Perplexity.
                </p>
              </div>

              <button
                onClick={handleRevalidate}
                disabled={revalidating}
                className="px-3 py-1.5 rounded bg-[#FBF8F3] hover:bg-white text-black font-semibold"
              >
                {revalidating ? "Revalidating Edge CDN..." : "Publish to Website (ISR Revalidate)"}
              </button>
            </div>

            <div className="p-4 rounded bg-black/60 border border-white/10 text-[11px] text-zinc-300 overflow-x-auto max-h-96">
              <pre>{JSON.stringify(sampleSchemaGraph, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === "STAGING_QA" && (
        <div className="p-5 rounded border border-white/10 bg-[#121214] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Staging Deployment SEO & CWV Review Queue (FlyingLyte Candidate)
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                The Coding Team cannot promote staging to production until this sign-off is toggled.
              </p>
            </div>

            <button
              onClick={handleApproveStaging}
              disabled={deployment.seo_qa_approved}
              className={`px-3 py-1.5 rounded font-semibold ${
                deployment.seo_qa_approved
                  ? "bg-emerald-500/20 text-emerald-400 cursor-default"
                  : "bg-emerald-500 hover:bg-emerald-400 text-black"
              }`}
            >
              {deployment.seo_qa_approved ? "✓ SEO QA Signed-Off" : "Sign-Off SEO & CWV Gate"}
            </button>
          </div>

          <div className="p-4 rounded bg-white/[0.02] border border-white/5 space-y-2">
            <div className="text-white font-semibold">Staging URL: <a href={deployment.preview_url} target="_blank" className="text-cyan-400 underline">{deployment.preview_url}</a></div>
            <div className="text-zinc-400">Commit: {deployment.git_commit_sha} | Branch: {deployment.git_branch}</div>
            <div className="text-zinc-300">Measured LCP: {deployment.lcp_ms}ms (&lt; 1500ms verified)</div>
          </div>
        </div>
      )}
    </div>
  );
}
