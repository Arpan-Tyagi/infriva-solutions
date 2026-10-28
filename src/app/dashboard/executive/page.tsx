"use client";

import { MOCK_LEADS, MOCK_PROJECTS, MOCK_TASKS, MOCK_CAMPAIGNS } from "@/lib/crm-mock-data";

export default function ExecutiveCommandCenter() {
  const totalPipelineInr = 1840000; // ₹18.4 Lakhs
  const avgCacPaybackDays = 14;
  const quoteAcceptanceRate = "42.8%";
  const sub15sLcpRate = "100%";

  return (
    <div className="space-y-6">
      {/* Title & Directive */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-[#FBF8F3]">
            Executive Command Center (MD & CEO)
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Full relational ledger oversight, sprint velocity, and cross-departmental SLA attribution.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/15 text-xs font-mono text-zinc-200 transition-colors">
            Export Audit Ledger
          </button>
          <button className="px-3 py-1.5 rounded bg-[#FBF8F3] hover:bg-white text-xs font-mono text-black font-semibold transition-colors">
            + Provision Project
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded border border-white/10 bg-[#121214]">
          <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Active Qualified Pipeline</div>
          <div className="text-2xl font-bold text-[#FBF8F3] mt-1">₹18,40,000</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span>↑ 24%</span>
            <span className="text-zinc-500">vs last 30d</span>
          </div>
        </div>

        <div className="p-4 rounded border border-white/10 bg-[#121214]">
          <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Quote Acceptance Rate</div>
          <div className="text-2xl font-bold text-[#FBF8F3] mt-1">{quoteAcceptanceRate}</div>
          <div className="text-[11px] text-zinc-400 mt-1">₹80k - ₹90k+ base tiers</div>
        </div>

        <div className="p-4 rounded border border-white/10 bg-[#121214]">
          <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Avg CAC Payback</div>
          <div className="text-2xl font-bold text-[#FBF8F3] mt-1">{avgCacPaybackDays} Days</div>
          <div className="text-[11px] text-emerald-400 mt-1">Sub-30d benchmark met</div>
        </div>

        <div className="p-4 rounded border border-white/10 bg-[#121214]">
          <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Core Web Vitals Pass Rate</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{sub15sLcpRate}</div>
          <div className="text-[11px] text-zinc-400 mt-1">&lt;1.5s LCP staging gate</div>
        </div>
      </div>

      {/* Departmental SLA Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Web Engineering Sprint Matrix */}
        <div className="lg:col-span-2 rounded border border-white/10 bg-[#121214] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold font-mono tracking-wide text-[#FBF8F3]">
              Active Projects Matrix (6-Stage Lifecycle)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300">
              3 Active Client Systems
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {MOCK_PROJECTS.map((proj) => (
              <div key={proj.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-white">{proj.name}</div>
                  <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">
                      {proj.service_tier}
                    </span>
                    <span>Started: {proj.start_date}</span>
                    {proj.warranty_expires_at && (
                      <span className="text-amber-400">
                        Warranty: {new Date(proj.warranty_expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-mono font-medium text-emerald-400">
                      {proj.engineering_phase}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500">
                      Status: {proj.status}
                    </div>
                  </div>
                  <a
                    href={`/portal/client/${proj.id}`}
                    target="_blank"
                    className="text-xs font-mono px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors"
                  >
                    View Portal →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational SLA Countdown Monitor */}
        <div className="rounded border border-white/10 bg-[#121214] p-5 space-y-4">
          <h2 className="text-sm font-bold font-mono tracking-wide text-[#FBF8F3]">
            Operational SLA Monitor
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded bg-white/[0.02] border border-white/5">
              <div className="flex justify-between items-center text-zinc-300">
                <span>Inbound Lead First Contact</span>
                <span className="text-emerald-400 font-bold">&lt; 15 Mins</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                Sub-second round-robin assignment with automated WhatsApp Utility prompt.
              </p>
            </div>

            <div className="p-3 rounded bg-white/[0.02] border border-white/5">
              <div className="flex justify-between items-center text-zinc-300">
                <span>SMM Calendar Blueprint SLA</span>
                <span className="text-emerald-400 font-bold">20th of Month</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                SLA Met for November cycle (submitted on 19th). 48h client review active.
              </p>
            </div>

            <div className="p-3 rounded bg-white/[0.02] border border-white/5">
              <div className="flex justify-between items-center text-zinc-300">
                <span>Staging LCP Quality Gate</span>
                <span className="text-emerald-400 font-bold">Sub-1.5s LCP</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                Dual-gate sign-off required before promoting staging branches to production.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Sales & Paid Ad Performance Strip */}
      <div className="rounded border border-white/10 bg-[#121214] p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold font-mono tracking-wide text-[#FBF8F3]">
            Recent High-Intent Inbound Pipeline & Paid Telemetry
          </h2>
          <span className="text-xs font-mono text-zinc-400">Meta CAPI & Google Offline Live</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                <th className="pb-2 font-normal">PROSPECT</th>
                <th className="pb-2 font-normal">SERVICE TIER</th>
                <th className="pb-2 font-normal">CHANNEL</th>
                <th className="pb-2 font-normal">BUDGET</th>
                <th className="pb-2 font-normal">STAGE</th>
                <th className="pb-2 font-normal">TELEPHONY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-200">
              {MOCK_LEADS.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02]">
                  <td className="py-2.5">
                    <div className="font-semibold text-white">{lead.full_name}</div>
                    <div className="text-[10px] text-zinc-500">{lead.company_name}</div>
                  </td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">
                      {lead.interested_service}
                    </span>
                  </td>
                  <td className="py-2.5 text-zinc-400">{lead.source_channel}</td>
                  <td className="py-2.5 text-zinc-300">{lead.budget_bracket || "TBD"}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400">
                      {lead.stage}
                    </span>
                  </td>
                  <td className="py-2.5 text-zinc-400">{lead.total_calls_made} calls logged</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
