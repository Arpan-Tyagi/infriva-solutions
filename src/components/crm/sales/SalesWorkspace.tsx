"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Viewer } from "@/lib/crm-auth";
import type { InfrivaServiceTier, LeadSourceChannel, LeadStage } from "@/types/crm";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import type { PendingApproval, QueueLead, RepOption } from "@/app/dashboard/sales/types";
import { distributeUnassignedAction, loadSampleLeadsAction } from "@/app/dashboard/sales/actions";
import {
  SOURCE_LABEL,
  STAGES,
  STAGE_LABEL,
  SlaBadge,
  StageBadge,
  TIER_LABEL,
  ToastProvider,
  formatInr,
  timeAgo,
  urgencyOf,
  useNow,
  useToast,
} from "./ui";
import { LeadDrawer } from "./LeadDrawer";
import { NewLeadSheet } from "./NewLeadSheet";

type View = "mine" | "all" | "unassigned";
type StageFilter = "OPEN" | "ALL" | LeadStage;
type Focus = "none" | "sla" | "followups";

interface Props {
  viewer: Viewer;
  leads: QueueLead[];
  reps: RepOption[];
  pendingApprovals: PendingApproval[];
  exotelReady: boolean;
  sampleDataEnabled: boolean;
  loadError: string | null;
}

export function SalesWorkspace(props: Props) {
  return (
    <ToastProvider>
      <Workspace {...props} />
    </ToastProvider>
  );
}

function Workspace({ viewer, leads, reps, pendingApprovals, exotelReady, sampleDataEnabled, loadError }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useToast();
  const now = useNow();
  const isMd = viewer.role === "MD_CEO";

  const [view, setView] = useState<View>(isMd ? "all" : "mine");
  const [stageFilter, setStageFilter] = useState<StageFilter>("OPEN");
  const [focus, setFocus] = useState<Focus>("none");
  const [source, setSource] = useState<LeadSourceChannel | "">("");
  const [tier, setTier] = useState<InfrivaServiceTier | "">("");
  const [owner, setOwner] = useState<string>("");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedLeadId = searchParams.get("lead");
  const initialTab = searchParams.get("tab");

  const repName = useMemo(() => new Map(reps.map((r) => [r.id, r.full_name])), [reps]);

  const openLead = useCallback(
    (id: string | null, tab?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id) params.set("lead", id);
      else params.delete("lead");
      if (tab) params.set("tab", tab);
      else params.delete("tab");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // ----- Realtime: new / changed leads refresh the queue -----
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    const refresh = () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => router.refresh(), 400);
    };
    const channel = supabase
      .channel("sales-queue")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        const row = payload.new as Partial<QueueLead> | undefined;
        if (payload.eventType === "INSERT" && row?.assigned_rep_id === viewer.id) {
          toast(`New lead assigned to you: ${row.full_name}`, "info");
        }
        refresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "quotations" }, refresh)
      .subscribe();
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      supabase.removeChannel(channel);
    };
  }, [router, toast, viewer.id]);

  // ----- Derived queue -----
  const scoped = useMemo(() => {
    if (view === "mine") return leads.filter((l) => l.assigned_rep_id === viewer.id);
    if (view === "unassigned") return leads.filter((l) => !l.assigned_rep_id);
    return leads;
  }, [leads, view, viewer.id]);

  const counts = useMemo(() => {
    let sla = 0;
    let followups = 0;
    let open = 0;
    let won = 0;
    for (const l of scoped) {
      const u = urgencyOf(l, now).urgency;
      if (u === "sla" || u === "breached") sla++;
      if (u === "followup-due") followups++;
      if (u !== "closed") open++;
      if (l.stage === "WON") won++;
    }
    return { sla, followups, open, won };
  }, [scoped, now]);

  const unassignedCount = useMemo(() => leads.filter((l) => !l.assigned_rep_id && l.stage !== "WON" && l.stage !== "LOST").length, [leads]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    return scoped
      .filter((l) => {
        if (stageFilter === "OPEN" && (l.stage === "WON" || l.stage === "LOST")) return false;
        if (stageFilter !== "OPEN" && stageFilter !== "ALL" && l.stage !== stageFilter) return false;
        if (source && l.source_channel !== source) return false;
        if (tier && l.interested_service !== tier) return false;
        if (owner && (owner === "none" ? l.assigned_rep_id : l.assigned_rep_id !== owner)) return false;
        if (focus !== "none") {
          const u = urgencyOf(l, now).urgency;
          if (focus === "sla" && u !== "sla" && u !== "breached") return false;
          if (focus === "followups" && u !== "followup-due") return false;
        }
        if (q) {
          const hay = `${l.full_name} ${l.company_name || ""} ${l.email || ""}`.toLowerCase();
          if (!hay.includes(q) && !(digits.length >= 3 && (l.phone_e164 || "").includes(digits))) return false;
        }
        return true;
      })
      .map((l) => ({ lead: l, u: urgencyOf(l, now) }))
      .sort((a, b) => a.u.rank - b.u.rank || a.u.at - b.u.at)
      .map((x) => x.lead);
  }, [scoped, stageFilter, source, tier, owner, focus, query, now]);

  const goToNextLead = useCallback(() => {
    const candidates = visible.filter((l) => l.stage !== "WON" && l.stage !== "LOST");
    if (!candidates.length) {
      toast("Queue is clear — nothing waiting on you.", "info");
      return;
    }
    const idx = candidates.findIndex((l) => l.id === selectedLeadId);
    const next = candidates[idx >= 0 ? (idx + 1) % candidates.length : 0];
    openLead(next.id);
  }, [visible, selectedLeadId, openLead, toast]);

  // ----- Keyboard shortcuts (desktop) -----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        goToNextLead();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goToNextLead]);

  const clearFilters = () => {
    setStageFilter("OPEN");
    setFocus("none");
    setSource("");
    setTier("");
    setOwner("");
    setQuery("");
  };

  const runAction = (fn: () => Promise<{ ok: boolean; error?: string; message?: string }>) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) toast(res.message || "Done.");
      else toast(res.error || "Something went wrong.", "error");
    });

  const filtersActive = stageFilter !== "OPEN" || focus !== "none" || source || tier || owner || query;

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-3 pb-24 md:pb-6">
      {/* Title + primary actions */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[#FBF8F3] md:text-xl">Sales & RevOps</h1>
          <p className="text-xs text-zinc-400">
            {isMd ? "Whole team" : "Your queue"} · sorted by what needs you first · first response within 5 min
          </p>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <button onClick={() => setNewLeadOpen(true)} className="rounded border border-white/15 px-3 py-2 text-xs text-zinc-200 hover:bg-white/5">
            + Add lead
          </button>
          <button onClick={goToNextLead} className="rounded bg-[#FBF8F3] px-3.5 py-2 text-xs font-semibold text-[#0A0A0B] hover:bg-white" title="Shortcut: N">
            Next lead →
          </button>
        </div>
      </div>

      {loadError && (
        <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          Could not load leads: {loadError}. If this is a new Supabase project, apply the migrations in <code>supabase/migrations</code>.
        </div>
      )}

      {/* MD: approvals waiting */}
      {isMd && pendingApprovals.length > 0 && (
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/[0.07] p-3">
          <div className="mb-2 text-xs font-semibold text-orange-200">
            {pendingApprovals.length} quotation{pendingApprovals.length > 1 ? "s" : ""} waiting for your approval
          </div>
          <div className="flex flex-col gap-1.5">
            {pendingApprovals.map((q) => (
              <button
                key={q.id}
                onClick={() => openLead(q.lead_id, "quotes")}
                className="flex items-center justify-between gap-3 rounded border border-white/10 bg-black/30 px-3 py-2 text-left text-sm hover:bg-white/5"
              >
                <span className="min-w-0 truncate">
                  <span className="font-mono text-xs text-zinc-400">{q.quote_number}</span> · {q.lead_name}
                  {q.rep_name && <span className="text-zinc-500"> · by {q.rep_name}</span>}
                </span>
                <span className="shrink-0 font-mono text-xs text-orange-200">{formatInr(q.total_inr)} · Review →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MD: unassigned */}
      {isMd && unassignedCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sky-500/30 bg-sky-500/[0.07] px-3 py-2 text-sm text-sky-100">
          <span>
            {unassignedCount} open lead{unassignedCount > 1 ? "s have" : " has"} no owner.
          </span>
          <div className="flex gap-2">
            <button onClick={() => setView("unassigned")} className="rounded border border-white/15 px-2.5 py-1 text-xs hover:bg-white/5">
              View
            </button>
            <button
              disabled={isPending}
              onClick={() => runAction(distributeUnassignedAction)}
              className="rounded bg-sky-400/90 px-2.5 py-1 text-xs font-semibold text-black disabled:opacity-50"
            >
              Assign round-robin
            </button>
          </div>
        </div>
      )}

      {/* KPI chips double as quick filters */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <KpiChip
          label="First response due"
          value={counts.sla}
          tone={counts.sla ? "red" : "muted"}
          active={focus === "sla"}
          onClick={() => setFocus(focus === "sla" ? "none" : "sla")}
        />
        <KpiChip
          label="Follow-ups due"
          value={counts.followups}
          tone={counts.followups ? "orange" : "muted"}
          active={focus === "followups"}
          onClick={() => setFocus(focus === "followups" ? "none" : "followups")}
        />
        <KpiChip label="Open leads" value={counts.open} tone="muted" active={false} onClick={() => setFocus("none")} />
        <KpiChip label="Won · 30 days" value={counts.won} tone={counts.won ? "green" : "muted"} active={stageFilter === "WON"} onClick={() => setStageFilter(stageFilter === "WON" ? "OPEN" : "WON")} />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-[#121214] p-2">
        <div className="flex items-center gap-2">
          <div className="flex shrink-0 rounded border border-white/10 p-0.5 text-xs">
            {(["mine", "all", ...(isMd ? (["unassigned"] as const) : [])] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded px-2.5 py-1.5 capitalize ${view === v ? "bg-[#FBF8F3] font-semibold text-black" : "text-zinc-300"}`}
              >
                {v === "mine" ? "Mine" : v === "all" ? "Team" : "No owner"}
              </button>
            ))}
          </div>
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, company, phone…"
            className="min-w-0 flex-1 rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-[#FBF8F3] placeholder:text-zinc-500 focus:border-white/30 focus:outline-none"
            aria-label="Search leads"
          />
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`shrink-0 rounded border px-2.5 py-2 text-xs md:hidden ${filtersActive ? "border-amber-400/50 text-amber-200" : "border-white/10 text-zinc-300"}`}
          >
            Filters
          </button>
        </div>

        <div className={`${filtersOpen ? "grid" : "hidden"} grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center`}>
          <Select value={stageFilter} onChange={(v) => setStageFilter(v as StageFilter)} label="Stage">
            <option value="OPEN">Open stages</option>
            <option value="ALL">All stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABEL[s]}
              </option>
            ))}
          </Select>
          <Select value={source} onChange={(v) => setSource(v as LeadSourceChannel | "")} label="Source">
            <option value="">All sources</option>
            {Object.entries(SOURCE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Select value={tier} onChange={(v) => setTier(v as InfrivaServiceTier | "")} label="Service">
            <option value="">All services</option>
            {Object.entries(TIER_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          {view !== "mine" && (
            <Select value={owner} onChange={setOwner} label="Owner">
              <option value="">Any owner</option>
              <option value="none">No owner</option>
              {reps.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.full_name}
                  {r.is_active ? "" : " (inactive)"}
                </option>
              ))}
            </Select>
          )}
          {filtersActive && (
            <button onClick={clearFilters} className="col-span-2 rounded px-2 py-1.5 text-xs text-zinc-400 underline-offset-2 hover:underline md:col-span-1">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Queue */}
      {leads.length === 0 && !loadError ? (
        <EmptyState
          onAdd={() => setNewLeadOpen(true)}
          onSample={sampleDataEnabled ? () => runAction(loadSampleLeadsAction) : undefined}
          busy={isPending}
        />
      ) : visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 p-8 text-center text-sm text-zinc-400">
          {view === "mine" && scoped.length === 0 ? "No leads are assigned to you yet." : "No leads match these filters."}
          <div className="mt-3 flex justify-center gap-2">
            {filtersActive && (
              <button onClick={clearFilters} className="rounded border border-white/15 px-3 py-1.5 text-xs text-zinc-200">
                Clear filters
              </button>
            )}
            {view === "mine" && (
              <button onClick={() => setView("all")} className="rounded border border-white/15 px-3 py-1.5 text-xs text-zinc-200">
                Show team queue
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Phone: cards */}
          <ul className="flex flex-col gap-2 md:hidden">
            {visible.map((lead) => (
              <li key={lead.id}>
                <button
                  onClick={() => openLead(lead.id)}
                  className={`w-full rounded-lg border p-3 text-left active:bg-white/5 ${
                    lead.id === selectedLeadId ? "border-[#FBF8F3]/60 bg-white/[0.06]" : "border-white/10 bg-[#121214]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-[#FBF8F3]">
                        {lead.full_name}
                        {lead.is_existing_client && <span className="ml-1.5 text-[10px] text-emerald-300">● client</span>}
                      </div>
                      <div className="truncate text-xs text-zinc-400">{lead.company_name || lead.email || lead.phone_e164}</div>
                    </div>
                    <SlaBadge lead={lead} now={now} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
                    <StageBadge stage={lead.stage} />
                    <span>{SOURCE_LABEL[lead.source_channel]}</span>
                    <span>{TIER_LABEL[lead.interested_service]}</span>
                    <span>📞 {lead.total_calls_made}</span>
                    <span>{timeAgo(lead.last_contacted_at, now)}</span>
                    {view !== "mine" && <span className="text-zinc-500">{lead.assigned_rep_id ? repName.get(lead.assigned_rep_id) || "Rep" : "No owner"}</span>}
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop: dense table */}
          <div className="hidden overflow-hidden rounded-lg border border-white/10 bg-[#121214] md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02] text-[11px] font-mono uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="px-3 py-2 font-normal">Lead</th>
                  <th className="px-3 py-2 font-normal">SLA / next step</th>
                  <th className="px-3 py-2 font-normal">Stage</th>
                  <th className="px-3 py-2 font-normal">Source</th>
                  <th className="px-3 py-2 font-normal">Service</th>
                  <th className="px-3 py-2 font-normal">Last touch</th>
                  <th className="px-3 py-2 text-right font-normal">Calls</th>
                  <th className="px-3 py-2 font-normal">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visible.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => openLead(lead.id)}
                    className={`cursor-pointer hover:bg-white/[0.03] ${lead.id === selectedLeadId ? "bg-white/[0.06]" : ""}`}
                  >
                    <td className="max-w-[260px] px-3 py-2.5">
                      <div className="truncate font-medium text-[#FBF8F3]">
                        {lead.full_name}
                        {lead.is_existing_client && <span className="ml-1.5 text-[10px] text-emerald-300">● client</span>}
                        {lead.inquiry_count > 1 && <span className="ml-1.5 text-[10px] text-zinc-500">×{lead.inquiry_count}</span>}
                      </div>
                      <div className="truncate text-xs text-zinc-500">{lead.company_name || lead.email || lead.phone_e164}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <SlaBadge lead={lead} now={now} />
                    </td>
                    <td className="px-3 py-2.5">
                      <StageBadge stage={lead.stage} />
                    </td>
                    <td className="px-3 py-2.5 text-xs text-zinc-300">{SOURCE_LABEL[lead.source_channel]}</td>
                    <td className="px-3 py-2.5 text-xs text-zinc-300">{TIER_LABEL[lead.interested_service]}</td>
                    <td className="px-3 py-2.5 text-xs text-zinc-400" title={lead.last_response_summary || undefined}>
                      {timeAgo(lead.last_contacted_at, now)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs text-zinc-300">{lead.total_calls_made}</td>
                    <td className="px-3 py-2.5 text-xs text-zinc-400">
                      {lead.assigned_rep_id ? repName.get(lead.assigned_rep_id) || "Rep" : <span className="text-sky-300">No owner</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-white/10 px-3 py-1.5 text-[11px] text-zinc-500">
              {visible.length} lead{visible.length === 1 ? "" : "s"} · shortcuts: <kbd>N</kbd> next lead, <kbd>/</kbd> search, <kbd>Esc</kbd> close
            </div>
          </div>
        </>
      )}

      {/* Phone: thumb-reach action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-white/10 bg-[#0A0A0B]/95 p-3 backdrop-blur md:hidden">
        <button onClick={() => setNewLeadOpen(true)} className="rounded-lg border border-white/15 px-4 py-3 text-sm text-zinc-200">
          + Lead
        </button>
        <button onClick={goToNextLead} className="flex-1 rounded-lg bg-[#FBF8F3] py-3 text-sm font-semibold text-[#0A0A0B]">
          Next lead →
        </button>
      </div>

      {selectedLeadId && (
        <LeadDrawer
          key={selectedLeadId}
          leadId={selectedLeadId}
          viewer={viewer}
          reps={reps}
          exotelReady={exotelReady}
          initialTab={initialTab === "quotes" ? "quotes" : "activity"}
          onClose={() => openLead(null)}
          onNext={goToNextLead}
        />
      )}

      {newLeadOpen && (
        <NewLeadSheet
          onClose={() => setNewLeadOpen(false)}
          onCreated={(id) => {
            setNewLeadOpen(false);
            openLead(id);
          }}
        />
      )}
    </div>
  );
}

function KpiChip({
  label,
  value,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  tone: "red" | "orange" | "green" | "muted";
  active: boolean;
  onClick: () => void;
}) {
  const toneClass = {
    red: "text-red-300",
    orange: "text-orange-300",
    green: "text-emerald-300",
    muted: "text-[#FBF8F3]",
  }[tone];
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`min-w-[132px] shrink-0 rounded-lg border px-3 py-2 text-left transition-colors ${
        active ? "border-[#FBF8F3]/60 bg-white/[0.08]" : "border-white/10 bg-[#121214] hover:bg-white/[0.04]"
      }`}
    >
      <div className={`font-mono text-xl font-semibold tabular-nums ${toneClass}`}>{value}</div>
      <div className="text-[11px] text-zinc-400">{label}</div>
    </button>
  );
}

function Select({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="rounded border border-white/10 bg-black/40 px-2.5 py-2 text-xs text-zinc-200 focus:border-white/30 focus:outline-none"
    >
      {children}
    </select>
  );
}

function EmptyState({ onAdd, onSample, busy }: { onAdd: () => void; onSample?: () => void; busy: boolean }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 p-10 text-center">
      <div className="text-base font-medium text-[#FBF8F3]">No leads yet</div>
      <p className="mx-auto mt-1 max-w-md text-sm text-zinc-400">
        Website, Meta and Google leads appear here instantly and are assigned round-robin. You can also add a phone or walk-in enquiry yourself.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button onClick={onAdd} className="rounded bg-[#FBF8F3] px-4 py-2 text-sm font-semibold text-black">
          + Add a lead
        </button>
        {onSample && (
          <button onClick={onSample} disabled={busy} className="rounded border border-white/15 px-4 py-2 text-sm text-zinc-200 disabled:opacity-50">
            {busy ? "Loading…" : "Load 5 sample leads"}
          </button>
        )}
      </div>
    </div>
  );
}
