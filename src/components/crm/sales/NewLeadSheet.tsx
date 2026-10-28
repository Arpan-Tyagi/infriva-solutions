"use client";

import { useState, useTransition } from "react";
import { createManualLeadAction } from "@/app/dashboard/sales/actions";
import { TIER_LABEL, useToast } from "./ui";

export function NewLeadSheet({ onClose, onCreated }: { onClose: () => void; onCreated: (leadId: string) => void }) {
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (form: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await createManualLeadAction({
        fullName: String(form.get("fullName") || ""),
        phone: String(form.get("phone") || ""),
        email: String(form.get("email") || ""),
        company: String(form.get("company") || ""),
        service: String(form.get("service") || ""),
        details: String(form.get("details") || ""),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast(res.message || "Lead added.");
      if (res.data?.leadId) onCreated(res.data.leadId);
    });
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-black/60 md:items-center" onClick={onClose}>
      <form
        action={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-2xl border border-white/15 bg-[#121214] p-4 shadow-2xl md:rounded-xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#FBF8F3]">Add a lead</h2>
          <button type="button" onClick={onClose} className="h-9 w-9 rounded text-xl text-zinc-400" aria-label="Close">
            ×
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Field name="fullName" label="Name *" required autoFocus className="sm:col-span-2" />
          <Field name="phone" label="Mobile" type="tel" inputMode="tel" placeholder="98XXXXXXXX" />
          <Field name="email" label="Email" type="email" />
          <Field name="company" label="Company" />
          <label className="flex flex-col gap-1 text-xs text-zinc-400">
            Service
            <select name="service" className="rounded border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-[#FBF8F3]">
              {Object.entries(TIER_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-zinc-400 sm:col-span-2">
            What do they need?
            <textarea name="details" rows={3} className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-[#FBF8F3]" />
          </label>
        </div>
        <p className="mt-2 text-[11px] text-zinc-500">A mobile number or an email is required. Existing contacts are matched automatically.</p>
        {error && <div className="mt-2 rounded bg-red-500/10 p-2 text-sm text-red-300">{error}</div>}
        <button
          type="submit"
          disabled={isPending}
          className="mt-3 w-full rounded-lg bg-[#FBF8F3] py-3 text-sm font-semibold text-black disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Add lead"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  className = "",
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`flex flex-col gap-1 text-xs text-zinc-400 ${className}`}>
      {label}
      <input {...input} className="rounded border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-[#FBF8F3] focus:border-white/30 focus:outline-none" />
    </label>
  );
}
