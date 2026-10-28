"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { Viewer } from "@/lib/crm-auth";
import type { LeadStage } from "@/types/crm";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import {
  CALL_OUTCOMES,
  type CallOutcome,
  type LeadActivity,
  type LeadQuote,
  type LeadReminder,
  type OpenCall,
  type QueueLead,
  type RepOption,
} from "@/app/dashboard/sales/types";
import {
  addNoteAction,
  closeFollowUpAction,
  logDirectCallAction,
  logTouchAction,
  reassignLeadAction,
  reviewQuoteAction,
  scheduleFollowUpAction,
  setCallOutcomeAction,
  setQuoteOutcomeAction,
  startCallAction,
  updateStageAction,
} from "@/app/dashboard/sales/actions";
import { QuoteEditor } from "./QuoteEditor";
import {
  SOURCE_LABEL,
  STAGES,
  STAGE_LABEL,
  SlaBadge,
  TIER_LABEL,
  formatDateTime,
  formatInr,
  timeAgo,
  useNow,
  useToast,
} from "./ui";

type Tab = "activity" | "followups" | "quotes" | "details";

interface LeadDetail extends QueueLead {
  project_details: string | null;
  attribution_touch: Record<string, unknown> | null;
  enrichment_status: string;
  linkedin_url: string | null;
  lost_reason: string | null;
}

interface DetailState {
  lead: LeadDetail | null;
  activities: LeadActivity[];
  quotes: LeadQuote[];
  reminders: LeadReminder[];
  openCall: OpenCall | null;
  loading: boolean;
  error: string | null;
}

const QUOTE_STATUS_STYLE: Record<string, string> = {
  DRAFT: "text-zinc-300 border-white/15",
  PENDING_APPROVAL: "text-orange-300 border-orange-500/40",
  CHANGES_REQUESTED: "text-red-300 border-red-500/40",
  APPROVED: "text-emerald-300 border-emerald-500/40",
  SENT: "text-sky-300 border-sky-500/40",
  ACCEPTED: "text-emerald-200 border-emerald-400/60 bg-emerald-500/10",
  REJECTED: "text-zinc-400 border-white/10",
  EXPIRED: "text-zinc-500 border-white/10",
};

const ACTIVITY_ICON: Record<string, string> = {
  NOTE: "📝",
  CALL: "📞",
  STAGE_CHANGE: "➜",
  ASSIGNMENT: "👤",
  QUOTE: "₹",
  FOLLOW_UP: "⏰",
  WHATSAPP: "💬",
  EMAIL: "✉️",
  INQUIRY: "📥",
  SYSTEM: "⚙️",
};

async function fetchLeadDetail(leadId: string, viewerId: string): Promise<DetailState> {
  const supabase = createBrowserSupabaseClient();
  const since = new Date(Date.now() - 6 * 3600_000).toISOString();
  const [lead, activities, quotes, reminders, calls] = await Promise.all([
    supabase.from("leads").select("*").eq("id", leadId).maybeSingle(),
    supabase
      .from("lead_activities")
      .select("id, activity_type, body, metadata, created_at, actor_id, actor:user_profiles!lead_activities_actor_id_fkey(full_name)")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(150),
    supabase.from("quotations").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
    supabase
      .from("follow_up_reminders")
      .select("id, scheduled_at, message_note, status")
      .eq("lead_id", leadId)
      .in("status", ["PENDING", "DISPATCHED"])
      .order("scheduled_at"),
    // The rep's latest call without an outcome yet (prompts "How did it go?").
    supabase
      .from("sales_call_logs")
      .select("id, call_status, duration_seconds, created_at, provider")
      .eq("lead_id", leadId)
      .eq("rep_id", viewerId)
      .is("outcome", null)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const error = lead.error || activities.error || quotes.error || reminders.error || calls.error;
  return {
    lead: (lead.data as LeadDetail) || null,
    activities: (activities.data as unknown as LeadActivity[]) || [],
    quotes: ((quotes.data as LeadQuote[]) || []).map((q) => ({ ...q, service_items: q.service_items || [] })),
    reminders: (reminders.data as LeadReminder[]) || [],
    openCall: ((calls.data as OpenCall[]) || [])[0] || null,
    loading: false,
    error: error ? error.message : lead.data ? null : "This lead does not exist or you cannot see it.",
  };
}

export function LeadDrawer({
  leadId,
  viewer,
  reps,
  exotelReady,
  initialTab,
  onClose,
  onNext,
}: {
  leadId: string;
  viewer: Viewer;
  reps: RepOption[];
  exotelReady: boolean;
  initialTab: Tab;
  onClose: () => void;
  onNext: () => void;
}) {
  const toast = useToast();
  const now = useNow();
  const isMd = viewer.role === "MD_CEO";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [state, setState] = useState<DetailState>({
    lead: null,
    activities: [],
    quotes: [],
    reminders: [],
    openCall: null,
    loading: true,
    error: null,
  });
  const [manualCall, setManualCall] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ----- Data: read directly with the viewer's RLS session -----
  const load = useCallback(() => fetchLeadDetail(leadId, viewer.id).then(setState), [leadId, viewer.id]);

  useEffect(() => {
    let cancelled = false;
    const refresh = () =>
      fetchLeadDetail(leadId, viewer.id).then((detail) => {
        if (!cancelled) setState(detail);
      });
    void refresh();
    const supabase = createBrowserSupabaseClient();
    const channel = supabase
      .channel(`lead-${leadId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "lead_activities", filter: `lead_id=eq.${leadId}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "quotations", filter: `lead_id=eq.${leadId}` }, refresh)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "leads", filter: `id=eq.${leadId}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "sales_call_logs", filter: `lead_id=eq.${leadId}` }, refresh)
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [leadId, viewer.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /** Runs a server action, shows the result, reloads the drawer. */
  const act = (fn: () => Promise<{ ok: boolean; error?: string; message?: string }>, after?: () => void) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        if (res.message) toast(res.message);
        after?.();
        await load();
      } else {
        toast(res.error || "Something went wrong.", "error");
      }
    });

  const { lead } = state;
  const firstName = lead?.full_name.split(" ")[0] || "";
  const waText = lead
    ? encodeURIComponent(
        `Hi ${firstName}, this is ${viewer.fullName.split(" ")[0]} from Infriva Solutions about your ${TIER_LABEL[lead.interested_service].toLowerCase()} enquiry.`
      )
    : "";

  const pendingQuote = state.quotes.find((q) => q.status === "PENDING_APPROVAL");

  return (
    <div className="fixed inset-0 z-[55] flex justify-end bg-black/50" onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full flex-col border-l border-white/10 bg-[#0E0E10] shadow-2xl md:max-w-[640px]"
        aria-label="Lead details"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-white/10 p-3 md:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {state.loading && !lead ? (
                <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
              ) : (
                <>
                  <h2 className="truncate text-lg font-semibold text-[#FBF8F3]">{lead?.full_name || "Lead"}</h2>
                  <div className="truncate text-xs text-zinc-400">
                    {[lead?.company_name, lead?.phone_e164 ? `+${lead.phone_e164}` : lead?.phone_raw, lead?.email].filter(Boolean).join(" · ")}
                  </div>
                </>
              )}
            </div>
            <button onClick={onClose} className="h-10 w-10 shrink-0 rounded border border-white/10 text-xl text-zinc-300" aria-label="Close">
              ×
            </button>
          </div>

          {lead && (
            <>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                <SlaBadge lead={lead} now={now} />
                <Tag>{SOURCE_LABEL[lead.source_channel]}</Tag>
                <Tag>{TIER_LABEL[lead.interested_service]}</Tag>
                {lead.budget_bracket && <Tag>{lead.budget_bracket}</Tag>}
                {lead.is_existing_client && <Tag tone="green">Existing client</Tag>}
                {lead.inquiry_count > 1 && <Tag>Enquired {lead.inquiry_count}×</Tag>}
                <Tag>📞 {lead.total_calls_made}</Tag>
              </div>

              {/* Quick actions */}
              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {exotelReady && lead.phone_e164 ? (
                  <QuickAction
                    primary
                    disabled={isPending}
                    onClick={() => act(() => startCallAction(lead.id))}
                    label="Call"
                    sub="via Exotel"
                  />
                ) : (
                  <QuickAction
                    primary
                    href={lead.phone_e164 ? `tel:+${lead.phone_e164}` : undefined}
                    onClick={() => setManualCall(true)}
                    label="Call"
                    sub={lead.phone_e164 ? "dial direct" : "no number"}
                    disabled={!lead.phone_e164}
                  />
                )}
                <QuickAction
                  href={lead.phone_e164 ? `https://wa.me/${lead.phone_e164}?text=${waText}` : undefined}
                  external
                  disabled={!lead.phone_e164}
                  onClick={() => act(() => logTouchAction({ leadId: lead.id, channel: "WHATSAPP" }))}
                  label="WhatsApp"
                />
                <QuickAction
                  href={lead.email ? `mailto:${lead.email}` : undefined}
                  disabled={!lead.email}
                  onClick={() => act(() => logTouchAction({ leadId: lead.id, channel: "EMAIL" }))}
                  label="Email"
                />
                <QuickAction onClick={() => setTab("followups")} label="Follow-up" />
              </div>
              {exotelReady && lead.phone_e164 && (
                <a href={`tel:+${lead.phone_e164}`} onClick={() => setManualCall(true)} className="mt-1.5 inline-block text-[11px] text-zinc-500 underline-offset-2 hover:underline">
                  Or dial directly from this phone (not recorded)
                </a>
              )}

              <StageAndOwner
                lead={lead}
                isMd={isMd}
                reps={reps}
                disabled={isPending}
                onStage={(stage, lostReason) => act(() => updateStageAction({ leadId: lead.id, stage, lostReason }))}
                onReassign={(repId) => act(() => reassignLeadAction({ leadId: lead.id, repId }))}
              />
            </>
          )}
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3 md:p-4">
          {state.error && <div className="mb-3 rounded bg-red-500/10 p-3 text-sm text-red-300">{state.error}</div>}

          {lead && (state.openCall || manualCall) && (
            <CallOutcomeCard
              call={state.openCall}
              manual={!state.openCall}
              disabled={isPending}
              onDismiss={() => setManualCall(false)}
              onSave={(outcome, notes) =>
                act(
                  () =>
                    state.openCall
                      ? setCallOutcomeAction({ callLogId: state.openCall.id, leadId: lead.id, outcome, notes })
                      : logDirectCallAction({ leadId: lead.id, outcome, notes }),
                  () => setManualCall(false)
                )
              }
            />
          )}

          {isMd && pendingQuote && tab !== "quotes" && (
            <button
              onClick={() => setTab("quotes")}
              className="mb-3 w-full rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 text-left text-sm text-orange-100"
            >
              {pendingQuote.quote_number} ({formatInr(pendingQuote.total_inr)}) needs your approval → Review
            </button>
          )}

          <div className="sticky top-0 z-10 -mx-3 mb-3 flex gap-1 border-b border-white/10 bg-[#0E0E10] px-3 pb-2 md:-mx-4 md:px-4">
            {(
              [
                ["activity", "Activity"],
                ["followups", `Follow-ups${state.reminders.length ? ` (${state.reminders.length})` : ""}`],
                ["quotes", `Quotes${state.quotes.length ? ` (${state.quotes.length})` : ""}`],
                ["details", "Details"],
              ] as Array<[Tab, string]>
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`rounded px-2.5 py-1.5 text-xs ${tab === key ? "bg-white/10 font-semibold text-[#FBF8F3]" : "text-zinc-400"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {state.loading && !lead ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded bg-white/5" />
              ))}
            </div>
          ) : lead ? (
            <>
              {tab === "activity" && (
                <ActivityTab
                  activities={state.activities}
                  now={now}
                  viewer={viewer}
                  onAddNote={(body, done) =>
                    act(() => addNoteAction({ leadId: lead.id, body }), done)
                  }
                  disabled={isPending}
                />
              )}
              {tab === "followups" && (
                <FollowUpsTab
                  reminders={state.reminders}
                  disabled={isPending}
                  onSchedule={(scheduledAt, note, done) => act(() => scheduleFollowUpAction({ leadId: lead.id, scheduledAt, note }), done)}
                  onClose={(reminderId, status) => act(() => closeFollowUpAction({ reminderId, status }))}
                />
              )}
              {tab === "quotes" && (
                <QuotesTab
                  leadId={lead.id}
                  quotes={state.quotes}
                  isMd={isMd}
                  disabled={isPending}
                  onSaved={() => void load()}
                  onReview={(quoteId, decision, note) => act(() => reviewQuoteAction({ quoteId, decision, note }))}
                  onOutcome={(quoteId, status) => act(() => setQuoteOutcomeAction({ quoteId, status }))}
                />
              )}
              {tab === "details" && <DetailsTab lead={lead} />}
            </>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-white/10 p-3">
          <button onClick={onNext} className="w-full rounded-lg bg-[#FBF8F3] py-3 text-sm font-semibold text-[#0A0A0B]">
            Next lead →
          </button>
        </div>
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Tag({ children, tone }: { children: React.ReactNode; tone?: "green" }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-mono ${
        tone === "green" ? "border-emerald-500/40 text-emerald-300" : "border-white/10 text-zinc-300"
      }`}
    >
      {children}
    </span>
  );
}

function QuickAction({
  label,
  sub,
  href,
  external,
  onClick,
  disabled,
  primary,
}: {
  label: string;
  sub?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  const className = `flex min-h-[52px] flex-col items-center justify-center rounded-lg border px-1 text-xs ${
    disabled ? "pointer-events-none opacity-40" : ""
  } ${primary ? "border-emerald-500/50 bg-emerald-500/15 font-semibold text-emerald-200" : "border-white/10 bg-white/[0.03] text-zinc-200"}`;
  const content = (
    <>
      <span>{label}</span>
      {sub && <span className="text-[10px] font-normal text-zinc-400">{sub}</span>}
    </>
  );
  if (href) {
    return (
      <a href={href} onClick={onClick} className={className} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {content}
    </button>
  );
}

function StageAndOwner({
  lead,
  isMd,
  reps,
  disabled,
  onStage,
  onReassign,
}: {
  lead: LeadDetail;
  isMd: boolean;
  reps: RepOption[];
  disabled: boolean;
  onStage: (stage: LeadStage, lostReason?: string) => void;
  onReassign: (repId: string) => void;
}) {
  const [losing, setLosing] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1" role="radiogroup" aria-label="Stage">
        {STAGES.map((s) => (
          <button
            key={s}
            role="radio"
            aria-checked={lead.stage === s}
            disabled={disabled}
            onClick={() => (s === "LOST" ? setLosing(true) : onStage(s))}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${
              lead.stage === s ? "border-[#FBF8F3] bg-[#FBF8F3] font-semibold text-black" : "border-white/10 text-zinc-300"
            }`}
          >
            {STAGE_LABEL[s]}
          </button>
        ))}
      </div>
      {losing && (
        <div className="flex gap-2">
          <input
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why was it lost? (budget, timing, went elsewhere…)"
            className="min-w-0 flex-1 rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-[#FBF8F3]"
          />
          <button
            disabled={disabled || !reason.trim()}
            onClick={() => {
              onStage("LOST", reason);
              setLosing(false);
            }}
            className="rounded bg-red-400/90 px-3 text-xs font-semibold text-black disabled:opacity-40"
          >
            Mark lost
          </button>
          <button onClick={() => setLosing(false)} className="px-2 text-xs text-zinc-400">
            Cancel
          </button>
        </div>
      )}
      {lead.stage === "LOST" && lead.lost_reason && <div className="text-xs text-zinc-500">Lost: {lead.lost_reason}</div>}
      {isMd && (
        <label className="flex items-center gap-2 text-xs text-zinc-400">
          Owner
          <select
            value={lead.assigned_rep_id || ""}
            disabled={disabled}
            onChange={(e) => e.target.value && onReassign(e.target.value)}
            className="rounded border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-zinc-200"
          >
            <option value="">No owner</option>
            {reps
              .filter((r) => r.is_active || r.id === lead.assigned_rep_id)
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.full_name}
                </option>
              ))}
          </select>
        </label>
      )}
    </div>
  );
}

function CallOutcomeCard({
  call,
  manual,
  disabled,
  onSave,
  onDismiss,
}: {
  call: OpenCall | null;
  manual: boolean;
  disabled: boolean;
  onSave: (outcome: CallOutcome, notes: string) => void;
  onDismiss: () => void;
}) {
  const [outcome, setOutcome] = useState<CallOutcome | null>(null);
  const [notes, setNotes] = useState("");
  const live = call && !["completed", "failed", "busy", "no-answer", "canceled"].includes(call.call_status);

  return (
    <div className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-emerald-200">
          {manual ? "How did the call go?" : live ? "Call in progress…" : `Call ended · ${Math.round((call?.duration_seconds || 0) / 60)} min`}
        </span>
        {manual && (
          <button onClick={onDismiss} className="text-zinc-400">
            Skip
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {CALL_OUTCOMES.map((o) => (
          <button
            key={o.value}
            onClick={() => setOutcome(o.value)}
            className={`rounded border px-1 py-2 text-xs ${
              outcome === o.value ? "border-[#FBF8F3] bg-[#FBF8F3] font-semibold text-black" : "border-white/10 text-zinc-200"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="What did they say? (budget, decision maker, next step)"
        className="mt-2 w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-[#FBF8F3]"
      />
      <button
        disabled={!outcome || disabled}
        onClick={() => outcome && onSave(outcome, notes)}
        className="mt-2 w-full rounded-lg bg-emerald-400 py-2.5 text-sm font-semibold text-black disabled:opacity-40"
      >
        Save call
      </button>
    </div>
  );
}

function ActivityTab({
  activities,
  now,
  viewer,
  onAddNote,
  disabled,
}: {
  activities: LeadActivity[];
  now: number;
  viewer: Viewer;
  onAddNote: (body: string, done: () => void) => void;
  disabled: boolean;
}) {
  const [draft, setDraft] = useState("");
  // Optimistic notes are tied to the activity list they were added on top of;
  // once fresh rows arrive (a new array) they are dropped automatically.
  const [pending, setPending] = useState<{ base: LeadActivity[]; items: LeadActivity[] }>({ base: activities, items: [] });
  const optimistic = pending.base === activities ? pending.items : [];
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    setPending({
      base: activities,
      items: [
      {
        id: `tmp-${Date.now()}`,
        activity_type: "NOTE",
        body,
        metadata: {},
        created_at: new Date().toISOString(),
        actor_id: viewer.id,
        actor: { full_name: viewer.fullName },
      },
      ...optimistic,
    ],
    });
    setDraft("");
    onAddNote(body, () => ref.current?.focus());
  };

  const list = [...optimistic, ...activities];

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-white/10 bg-black/30 p-2">
        <textarea
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          rows={2}
          placeholder="Add a note about this customer…"
          className="w-full resize-y bg-transparent px-1.5 py-1 text-sm text-[#FBF8F3] placeholder:text-zinc-500 focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <span className="hidden text-[10px] text-zinc-500 md:inline">Ctrl + Enter to save</span>
          <button
            onClick={submit}
            disabled={!draft.trim() || disabled}
            className="ml-auto rounded bg-[#FBF8F3] px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
          >
            Save note
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="py-6 text-center text-sm text-zinc-500">No activity yet — the first call or note will show here.</div>
      ) : (
        <ol className="flex flex-col">
          {list.map((a) => (
            <li key={a.id} className={`flex gap-2.5 border-b border-white/5 py-2.5 ${a.id.startsWith("tmp-") ? "opacity-60" : ""}`}>
              <span className="w-5 shrink-0 text-center text-sm" aria-hidden>
                {ACTIVITY_ICON[a.activity_type] || "•"}
              </span>
              <div className="min-w-0 flex-1">
                <div className={`whitespace-pre-wrap break-words text-sm ${a.activity_type === "NOTE" ? "text-[#FBF8F3]" : "text-zinc-300"}`}>
                  {a.body}
                </div>
                <div className="mt-0.5 text-[11px] text-zinc-500">
                  {a.actor?.full_name || "System"} · <span title={formatDateTime(a.created_at)}>{timeAgo(a.created_at, now)}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function presetTimes() {
  const now = new Date();
  const at = (days: number, hour: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d;
  };
  const nextMonday = (() => {
    const d = at(1, 10);
    while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
    return d;
  })();
  return [
    { label: "In 1 hour", date: new Date(now.getTime() + 3600_000) },
    { label: "Today 5 pm", date: at(0, 17) },
    { label: "Tomorrow 10 am", date: at(1, 10) },
    { label: "In 3 days", date: at(3, 10) },
    { label: "Next Monday", date: nextMonday },
  ].filter((p) => p.date.getTime() > now.getTime() + 5 * 60_000);
}

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function FollowUpsTab({
  reminders,
  disabled,
  onSchedule,
  onClose,
}: {
  reminders: LeadReminder[];
  disabled: boolean;
  onSchedule: (scheduledAt: string, note: string, done: () => void) => void;
  onClose: (reminderId: string, status: "COMPLETED" | "CANCELLED") => void;
}) {
  const [when, setWhen] = useState<string>(() => toLocalInput(new Date(Date.now() + 24 * 3600_000)));
  const [note, setNote] = useState("");
  const presets = presetTimes();

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-white/10 bg-black/30 p-3">
        <div className="mb-2 text-xs font-semibold text-zinc-300">Schedule a follow-up</div>
        <div className="-mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setWhen(toLocalInput(p.date))}
              className={`shrink-0 rounded-full border px-2.5 py-1.5 text-xs ${
                when === toLocalInput(p.date) ? "border-[#FBF8F3] bg-[#FBF8F3] text-black" : "border-white/10 text-zinc-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-[#FBF8F3] [color-scheme:dark]"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reminder note (e.g. send case study, confirm budget)"
          className="mt-2 w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-[#FBF8F3]"
        />
        <button
          disabled={disabled || !when}
          onClick={() =>
            onSchedule(new Date(when).toISOString(), note, () => {
              setNote("");
            })
          }
          className="mt-2 w-full rounded-lg bg-[#FBF8F3] py-2.5 text-sm font-semibold text-black disabled:opacity-40"
        >
          Remind me on WhatsApp + email
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className="py-4 text-center text-sm text-zinc-500">No follow-ups scheduled.</div>
      ) : (
        <ul className="flex flex-col gap-2">
          {reminders.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 rounded border border-white/10 p-2.5">
              <div className="min-w-0">
                <div className="text-sm text-[#FBF8F3]">{formatDateTime(r.scheduled_at)}</div>
                {r.message_note && <div className="truncate text-xs text-zinc-400">{r.message_note}</div>}
                {r.status === "DISPATCHED" && <div className="text-[11px] text-orange-300">Reminder sent</div>}
              </div>
              <div className="flex shrink-0 gap-1">
                <button disabled={disabled} onClick={() => onClose(r.id, "COMPLETED")} className="rounded border border-emerald-500/40 px-2 py-1.5 text-xs text-emerald-300">
                  Done
                </button>
                <button disabled={disabled} onClick={() => onClose(r.id, "CANCELLED")} className="rounded border border-white/10 px-2 py-1.5 text-xs text-zinc-400">
                  Cancel
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function QuotesTab({
  leadId,
  quotes,
  isMd,
  disabled,
  onSaved,
  onReview,
  onOutcome,
}: {
  leadId: string;
  quotes: LeadQuote[];
  isMd: boolean;
  disabled: boolean;
  onSaved: () => void;
  onReview: (quoteId: string, decision: "APPROVED" | "CHANGES_REQUESTED", note?: string) => void;
  onOutcome: (quoteId: string, status: "SENT" | "ACCEPTED" | "REJECTED" | "DRAFT") => void;
}) {
  const [editing, setEditing] = useState<LeadQuote | "new" | null>(quotes.length ? null : "new");
  const [reviewNote, setReviewNote] = useState("");

  if (editing) {
    return (
      <QuoteEditor
        leadId={leadId}
        quote={editing === "new" ? undefined : editing}
        onCancel={() => setEditing(null)}
        onDone={() => {
          setEditing(null);
          onSaved();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button onClick={() => setEditing("new")} className="rounded-lg border border-dashed border-white/20 py-3 text-sm text-zinc-200 hover:bg-white/[0.03]">
        + New quotation
      </button>

      {quotes.map((q) => (
        <div key={q.id} className="rounded-lg border border-white/10 bg-black/30 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-mono text-xs text-zinc-400">{q.quote_number}</div>
              <div className="truncate text-sm text-[#FBF8F3]">{q.title || q.service_items[0]?.description || "Quotation"}</div>
            </div>
            <span className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] ${QUOTE_STATUS_STYLE[q.status] || ""}`}>
              {q.status.replace(/_/g, " ")}
            </span>
          </div>

          <ul className="mt-2 space-y-0.5 text-xs text-zinc-400">
            {q.service_items.map((i, idx) => (
              <li key={idx} className="flex justify-between gap-2">
                <span className="truncate">
                  {i.description}
                  {Number(i.qty) !== 1 && ` × ${i.qty}`}
                </span>
                <span className="shrink-0 font-mono">{formatInr(Number(i.qty) * Number(i.unit_price_inr))}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t border-white/10 pt-1.5 font-mono text-sm text-[#FBF8F3]">
            <span>Total incl. {Number(q.gst_rate)}% GST{Number(q.discount_inr) > 0 ? ` · −${formatInr(q.discount_inr)}` : ""}</span>
            <span>{formatInr(q.total_inr)}</span>
          </div>
          {q.notes && <div className="mt-1.5 text-xs text-zinc-400">{q.notes}</div>}
          {q.review_note && (
            <div className={`mt-2 rounded p-2 text-xs ${q.status === "CHANGES_REQUESTED" ? "bg-red-500/10 text-red-200" : "bg-white/5 text-zinc-300"}`}>
              MD: {q.review_note}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {(q.status === "DRAFT" || q.status === "CHANGES_REQUESTED") && (
              <button onClick={() => setEditing(q)} className="rounded border border-white/15 px-3 py-1.5 text-xs text-zinc-200">
                Edit & submit
              </button>
            )}

            {q.status === "PENDING_APPROVAL" &&
              (isMd ? (
                <div className="flex w-full flex-col gap-1.5">
                  <input
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Note to the rep (required to request changes)"
                    className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-[#FBF8F3]"
                  />
                  <div className="flex gap-1.5">
                    <button
                      disabled={disabled}
                      onClick={() => onReview(q.id, "APPROVED", reviewNote)}
                      className="flex-1 rounded-lg bg-emerald-400 py-2 text-sm font-semibold text-black disabled:opacity-40"
                    >
                      Approve
                    </button>
                    <button
                      disabled={disabled || !reviewNote.trim()}
                      onClick={() => onReview(q.id, "CHANGES_REQUESTED", reviewNote)}
                      className="flex-1 rounded-lg border border-red-400/50 py-2 text-sm text-red-200 disabled:opacity-40"
                    >
                      Request changes
                    </button>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-orange-300">Waiting for MD approval · you’ll get a WhatsApp when it’s reviewed</span>
              ))}

            {(q.status === "APPROVED" || q.status === "SENT") && (
              <>
                {q.status === "APPROVED" && (
                  <button disabled={disabled} onClick={() => onOutcome(q.id, "SENT")} className="rounded border border-sky-400/40 px-3 py-1.5 text-xs text-sky-200">
                    Mark shared with client
                  </button>
                )}
                <button disabled={disabled} onClick={() => onOutcome(q.id, "ACCEPTED")} className="rounded bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-black">
                  Client accepted → Won
                </button>
                <button disabled={disabled} onClick={() => onOutcome(q.id, "REJECTED")} className="rounded border border-white/15 px-3 py-1.5 text-xs text-zinc-300">
                  Client declined
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailsTab({ lead }: { lead: LeadDetail }) {
  const attribution = Object.entries(lead.attribution_touch || {}).filter(([, v]) => v !== null && v !== undefined && v !== "");
  return (
    <dl className="grid grid-cols-1 gap-3 text-sm">
      <Detail label="What they need">{lead.project_details || "—"}</Detail>
      <Detail label="Budget">{lead.budget_bracket || "—"}</Detail>
      <Detail label="Captured">{formatDateTime(lead.created_at)}</Detail>
      <Detail label="Enrichment">{lead.enrichment_status}</Detail>
      {lead.linkedin_url && (
        <Detail label="LinkedIn">
          <a href={lead.linkedin_url} target="_blank" rel="noreferrer" className="text-sky-300 underline">
            {lead.linkedin_url}
          </a>
        </Detail>
      )}
      <Detail label="Attribution">
        {attribution.length ? (
          <div className="flex flex-wrap gap-1">
            {attribution.map(([k, v]) => (
              <span key={k} className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300">
                {k}: {String(v)}
              </span>
            ))}
          </div>
        ) : (
          "—"
        )}
      </Detail>
    </dl>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap break-words text-zinc-200">{children}</dd>
    </div>
  );
}
