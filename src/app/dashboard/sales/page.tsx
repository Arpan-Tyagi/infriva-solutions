"use client";

import { useState } from "react";
import { MOCK_LEADS } from "@/lib/crm-mock-data";
import { Lead } from "@/types/crm";

export default function SalesRevOpsWorkspace() {
  const [selectedLead, setSelectedLead] = useState<Lead>(MOCK_LEADS[0]);
  const [callInProgress, setCallInProgress] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState<string | null>(null);
  const [reminderSaved, setReminderSaved] = useState(false);

  // Quotation state
  const [quoteItems, setQuoteItems] = useState([
    { description: "Next.js 16 + React 19 Full-Stack Architecture", amount: 80000 },
    { description: "Custom Supabase RLS CRM & Lead Routing Pipeline", amount: 90000 },
  ]);

  const subtotal = quoteItems.reduce((acc, item) => acc + item.amount, 0);
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  const handleDialLead = () => {
    setCallInProgress(true);
    setTimeout(() => {
      setCallInProgress(false);
      alert(`Twilio Call Simulated for ${selectedLead.full_name} (${selectedLead.phone_e164}). Audio recording synced to timeline.`);
    }, 2500);
  };

  const handleCreateQuotation = () => {
    setQuoteStatus("ACCEPTED");
    alert(`Quotation Q-${Date.now().toString().slice(-4)} marked ACCEPTED! Trigger fired: Project automatically provisioned in dev_repositories and conversion event sent to Meta CAPI.`);
  };

  const handleScheduleReminder = (e: React.FormEvent) => {
    e.preventDefault();
    setReminderSaved(true);
    setTimeout(() => setReminderSaved(false), 3000);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-[#FBF8F3]">
            Sales & RevOps Command Workspace
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Omnichannel waterfall queue, Twilio voice recording, itemized quotation builder, and CAPI trigger.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            SLA Standard: &lt;15m Response
          </span>
          <span className="px-2.5 py-1 rounded bg-white/10 text-zinc-200">
            3 High-Intent Leads
          </span>
        </div>
      </div>

      {/* 3-Pane High-Density Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* PANE 1: Lead Queue (Col 3) */}
        <div className="col-span-3 rounded border border-white/10 bg-[#121214] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <span className="text-xs font-mono font-bold uppercase text-zinc-300">Inbound Queue</span>
            <span className="text-[10px] font-mono text-zinc-500">Sorted by SLA</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {MOCK_LEADS.map((lead) => {
              const isSelected = selectedLead.id === lead.id;
              return (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1.5 ${
                    isSelected ? "bg-white/10 border-l-2 border-[#FBF8F3]" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[140px]">
                      {lead.full_name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                      {lead.stage}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400 truncate">
                    {lead.company_name || "Direct Prospect"}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-1">
                    <span className="text-zinc-400">{lead.source_channel}</span>
                    <span className="text-emerald-400 font-semibold">{lead.phone_e164}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PANE 2: Conversation & Interaction Timeline (Col 5) */}
        <div className="col-span-5 rounded border border-white/10 bg-[#121214] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white">{selectedLead.full_name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                {selectedLead.interested_service}
              </span>
            </div>

            <button
              onClick={handleDialLead}
              disabled={callInProgress}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <span>📞</span>
              <span>{callInProgress ? "Connecting Twilio..." : "Dial Lead"}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
            {/* Waterfall Enrichment Card */}
            <div className="p-3 rounded border border-white/10 bg-white/[0.02] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-semibold text-zinc-300 uppercase">FullEnrich & Apollo Waterfall Intelligence</span>
                <span className="text-emerald-400">✓ Verified Firmographics</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
                <div>Company: <span className="text-white">{selectedLead.company_name}</span></div>
                <div>Phone E.164: <span className="text-white">{selectedLead.phone_e164}</span></div>
                <div>Budget: <span className="text-white">{selectedLead.budget_bracket || "₹80k - ₹1.5L"}</span></div>
                <div>Status: <span className="text-emerald-400 font-semibold">{selectedLead.stage}</span></div>
              </div>
              {selectedLead.attribution_touch && (
                <div className="text-[10px] text-zinc-500 border-t border-white/5 pt-1.5">
                  Touchpoint: UTM Campaign: {selectedLead.attribution_touch.utm_campaign || "direct"} | Source: {selectedLead.attribution_touch.utm_source || "web"}
                </div>
              )}
            </div>

            {/* Inbound Requirement Brief */}
            <div className="p-3 rounded border border-white/10 bg-white/[0.01]">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Prospect Project Brief</div>
              <p className="text-zinc-300 leading-relaxed text-xs">
                {selectedLead.project_details}
              </p>
            </div>

            {/* Interaction Timeline & Simulated Recording */}
            <div className="space-y-3">
              <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                Interaction Timeline & Audio Logs
              </div>

              <div className="p-3 rounded bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white font-semibold">Twilio Voice Call #1 (Completed)</span>
                  <span className="text-zinc-500">142 seconds</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  {selectedLead.last_response_summary || "Discussed technical requirements, pricing tiers, and WhatsApp Cloud API integration."}
                </p>
                {/* Audio Mock Player */}
                <div className="flex items-center gap-2 p-2 rounded bg-black/40 border border-white/5 text-[10px] text-zinc-400">
                  <span>▶ Playback</span>
                  <div className="flex-1 h-1 bg-white/20 rounded overflow-hidden">
                    <div className="w-1/3 h-full bg-emerald-400" />
                  </div>
                  <span>02:22</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANE 3: Dynamic Quotation Builder & Follow-Up Scheduler (Col 4) */}
        <div className="col-span-4 rounded border border-white/10 bg-[#121214] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <span className="text-xs font-mono font-bold uppercase text-zinc-300">Commercial Quotation</span>
            <span className="text-[10px] font-mono text-zinc-400">Tier Catalog</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
            {/* Quotation Table */}
            <div className="p-3 rounded border border-white/10 bg-white/[0.01] space-y-2">
              <div className="text-[11px] text-zinc-400 font-semibold mb-2">Itemized Proposal Breakdown</div>
              {quoteItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px] text-zinc-300 py-1 border-b border-white/5">
                  <span className="truncate pr-2">{item.description}</span>
                  <span className="text-white font-semibold">₹{item.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}

              <div className="pt-2 text-right space-y-1 text-[11px]">
                <div className="text-zinc-400">Subtotal: ₹{subtotal.toLocaleString('en-IN')}</div>
                <div className="text-zinc-400">GST (18%): ₹{tax.toLocaleString('en-IN')}</div>
                <div className="text-sm font-bold text-emerald-400">Total: ₹{total.toLocaleString('en-IN')}</div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCreateQuotation}
                  className="w-full py-2 rounded bg-[#FBF8F3] hover:bg-white text-black font-semibold text-xs transition-colors"
                >
                  {quoteStatus === "ACCEPTED" ? "✓ Quotation Won (Project Seeded)" : "Mark Quotation Won & Provision Project"}
                </button>
              </div>
            </div>

            {/* Multi-Channel Follow-Up Scheduler */}
            <form onSubmit={handleScheduleReminder} className="p-3 rounded border border-white/10 bg-white/[0.01] space-y-3">
              <div className="text-[11px] text-zinc-400 font-semibold">Schedule Next Follow-Up Cadence</div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase block mb-1">Calendar & Reminder Time</label>
                <input
                  type="datetime-local"
                  defaultValue="2026-10-28T11:00"
                  className="w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 text-[10px] text-zinc-300">
                  <input type="checkbox" defaultChecked className="rounded bg-white/10" />
                  <span>Google Calendar (30m/10m alert)</span>
                </label>
                <label className="flex items-center gap-1.5 text-[10px] text-zinc-300">
                  <input type="checkbox" defaultChecked className="rounded bg-white/10" />
                  <span>WhatsApp Utility Reminder</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 rounded bg-white/10 hover:bg-white/15 text-zinc-200 text-xs transition-colors"
              >
                {reminderSaved ? "✓ Delegated Reminders Synced" : "Schedule Follow-Up"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
