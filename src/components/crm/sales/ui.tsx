"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { InfrivaServiceTier, LeadSourceChannel, LeadStage } from "@/types/crm";
import type { QueueLead } from "@/app/dashboard/sales/types";

export const STAGES: LeadStage[] = ["NEW", "CONTACTED", "QUALIFIED", "QUOTED", "WON", "LOST"];

export const STAGE_LABEL: Record<LeadStage, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  QUOTED: "Quoted",
  WON: "Won",
  LOST: "Lost",
};

export const STAGE_STYLE: Record<LeadStage, string> = {
  NEW: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  CONTACTED: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  QUALIFIED: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  QUOTED: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  WON: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  LOST: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export const SOURCE_LABEL: Record<LeadSourceChannel, string> = {
  WEBSITE_FORM: "Website",
  META_LEAD_ADS: "Meta ads",
  GOOGLE_ADS_FORM: "Google ads",
  FULLENRICH: "FullEnrich",
  APOLLO: "Apollo",
  DIRECT_REFERRAL: "Referral",
  MANUAL_ENTRY: "Manual",
};

export const TIER_LABEL: Record<InfrivaServiceTier, string> = {
  WEB_DEV_UIUX: "Website",
  CUSTOM_CRM: "Custom CRM",
  FULL_STACK_SEO_GEO: "SEO / GEO",
  PAID_ADS_MGMT: "Paid ads",
  WHATSAPP_RETENTION: "WhatsApp",
  PREMIUM_CONTENT: "Content",
  SOCIAL_MEDIA_MGMT: "Social media",
};

/** One shared clock so every SLA badge updates together. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function formatInr(n: number) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function timeAgo(iso: string | null, now: number) {
  if (!iso) return "—";
  const diff = Math.max(0, now - new Date(iso).getTime());
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 30 ? `${d}d ago` : new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function shortDuration(ms: number) {
  const m = Math.round(Math.abs(ms) / 60_000);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h}h` : `${Math.round(h / 24)}d`;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export type Urgency = "breached" | "sla" | "followup-due" | "open" | "closed";

/** Where a lead sits in the work queue; lower sorts first. */
export function urgencyOf(lead: QueueLead, now: number): { urgency: Urgency; rank: number; at: number } {
  if (lead.stage === "WON" || lead.stage === "LOST") return { urgency: "closed", rank: 4, at: -new Date(lead.created_at).getTime() };
  if (lead.stage === "NEW" && !lead.first_responded_at && lead.sla_first_response_due_at) {
    const due = new Date(lead.sla_first_response_due_at).getTime();
    return { urgency: due <= now ? "breached" : "sla", rank: 0, at: due };
  }
  if (lead.next_follow_up_at && new Date(lead.next_follow_up_at).getTime() <= now) {
    return { urgency: "followup-due", rank: 1, at: new Date(lead.next_follow_up_at).getTime() };
  }
  const next = lead.next_follow_up_at ? new Date(lead.next_follow_up_at).getTime() : Number.MAX_SAFE_INTEGER;
  return { urgency: "open", rank: 2, at: next };
}

export function SlaBadge({ lead, now }: { lead: QueueLead; now: number }) {
  if (lead.stage === "NEW" && !lead.first_responded_at && lead.sla_first_response_due_at) {
    const remaining = new Date(lead.sla_first_response_due_at).getTime() - now;
    if (remaining <= 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded border border-red-500/40 bg-red-500/15 px-1.5 py-0.5 font-mono text-[11px] text-red-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
          Overdue {shortDuration(remaining)}
        </span>
      );
    }
    const s = Math.floor(remaining / 1000);
    return (
      <span
        className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[11px] tabular-nums ${
          s < 60 ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-amber-500/40 bg-amber-500/10 text-amber-300"
        }`}
        title="Time left to make first contact"
      >
        ⏱ {Math.floor(s / 60)}:{String(s % 60).padStart(2, "0")}
      </span>
    );
  }

  if (lead.next_follow_up_at && lead.stage !== "WON" && lead.stage !== "LOST") {
    const diff = new Date(lead.next_follow_up_at).getTime() - now;
    return (
      <span
        className={`inline-flex rounded border px-1.5 py-0.5 font-mono text-[11px] ${
          diff <= 0 ? "border-orange-500/40 bg-orange-500/15 text-orange-300" : "border-white/10 bg-white/5 text-zinc-300"
        }`}
        title={formatDateTime(lead.next_follow_up_at)}
      >
        {diff <= 0 ? `Follow-up due ${shortDuration(diff)} ago` : `Follow-up in ${shortDuration(diff)}`}
      </span>
    );
  }

  if (lead.sla_breached) {
    return <span className="font-mono text-[11px] text-red-400/70">Responded late</span>;
  }
  return <span className="font-mono text-[11px] text-zinc-500">{lead.first_responded_at ? "Responded" : "—"}</span>;
}

export function StageBadge({ stage }: { stage: LeadStage }) {
  return (
    <span className={`inline-flex rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${STAGE_STYLE[stage]}`}>
      {STAGE_LABEL[stage]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------

type Toast = { id: number; text: string; tone: "ok" | "error" | "info" };
const ToastContext = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 7000 : 4000);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-3 bottom-3 z-[70] flex flex-col items-center gap-2 md:inset-x-auto md:right-4 md:items-end" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto w-full max-w-sm rounded-lg border px-3.5 py-2.5 text-sm shadow-2xl backdrop-blur ${
              t.tone === "error"
                ? "border-red-500/40 bg-red-950/90 text-red-100"
                : t.tone === "info"
                  ? "border-sky-500/40 bg-sky-950/90 text-sky-100"
                  : "border-emerald-500/40 bg-emerald-950/90 text-emerald-100"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
