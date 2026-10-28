"use client";

import { useState, useTransition } from "react";
import type { LeadQuote, QuoteLineItem } from "@/app/dashboard/sales/types";
import { saveQuoteAction } from "@/app/dashboard/sales/actions";
import { formatInr, useToast } from "./ui";

// Quick-add starting points (Infriva's published tiers); every field stays editable.
const QUICK_ADD: QuoteLineItem[] = [
  { description: "Website design & development (Next.js)", qty: 1, unit_price_inr: 80000 },
  { description: "Custom CRM build", qty: 1, unit_price_inr: 90000 },
  { description: "SEO & GEO retainer (monthly)", qty: 1, unit_price_inr: 65000 },
  { description: "Paid ads management (monthly, + 10% of ad spend)", qty: 1, unit_price_inr: 50000 },
  { description: "WhatsApp retention (monthly)", qty: 1, unit_price_inr: 25000 },
  { description: "Premium content production (monthly)", qty: 1, unit_price_inr: 60000 },
  { description: "Social media management (monthly)", qty: 1, unit_price_inr: 20000 },
];

const EMPTY_ITEM: QuoteLineItem = { description: "", qty: 1, unit_price_inr: 0 };

/** Mirrors trg_quotations_workflow so the preview matches what is saved. */
function computeTotals(items: QuoteLineItem[], discount: number, gstRate: number) {
  const subtotal = items.reduce((sum, i) => sum + Math.round((Number(i.qty) || 0) * (Number(i.unit_price_inr) || 0) * 100) / 100, 0);
  const taxable = Math.max(0, subtotal - (discount || 0));
  const tax = Math.round(taxable * (gstRate || 0)) / 100;
  return { subtotal, tax, total: taxable + tax };
}

export function QuoteEditor({
  leadId,
  quote,
  onDone,
  onCancel,
}: {
  leadId: string;
  quote?: LeadQuote;
  onDone: () => void;
  onCancel: () => void;
}) {
  const toast = useToast();
  const [title, setTitle] = useState(quote?.title || "");
  const [items, setItems] = useState<QuoteLineItem[]>(quote?.service_items?.length ? quote.service_items : [{ ...EMPTY_ITEM }]);
  const [discount, setDiscount] = useState<number>(Number(quote?.discount_inr || 0));
  const [gstRate, setGstRate] = useState<number>(Number(quote?.gst_rate ?? 18));
  const [notes, setNotes] = useState(quote?.notes || "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totals = computeTotals(items, discount, gstRate);

  const updateItem = (index: number, patch: Partial<QuoteLineItem>) =>
    setItems((list) => list.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const addQuick = (item: QuoteLineItem) =>
    setItems((list) => {
      const blankIndex = list.findIndex((i) => !i.description && !i.unit_price_inr);
      if (blankIndex >= 0) return list.map((x, i) => (i === blankIndex ? { ...item } : x));
      return [...list, { ...item }];
    });

  const save = (submit: boolean) => {
    setError(null);
    startTransition(async () => {
      const res = await saveQuoteAction({
        quoteId: quote?.id,
        leadId,
        title,
        items,
        discountInr: discount,
        gstRate,
        notes,
        submit,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast(res.message || "Saved.");
      onDone();
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-white/15 bg-black/30 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-[#FBF8F3]">{quote ? `Edit ${quote.quote_number}` : "New quotation"}</div>
        <button onClick={onCancel} className="text-xs text-zinc-400 hover:text-white">
          Cancel
        </button>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional) — e.g. Website + 3-month SEO"
        className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-[#FBF8F3]"
      />

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {QUICK_ADD.map((q) => (
          <button
            key={q.description}
            type="button"
            onClick={() => addQuick(q)}
            className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-white/5"
            title={`${q.description} — ${formatInr(q.unit_price_inr)}`}
          >
            + {q.description.split(" (")[0]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-[1fr_auto] gap-2 rounded border border-white/10 p-2 sm:grid-cols-[1fr_64px_120px_auto] sm:items-center">
            <textarea
              value={item.description}
              onChange={(e) => updateItem(index, { description: e.target.value })}
              placeholder="Description"
              rows={1}
              className="col-span-2 resize-y rounded border border-white/10 bg-black/40 px-2.5 py-2 text-sm text-[#FBF8F3] sm:col-span-1"
            />
            <label className="flex items-center gap-1 text-[11px] text-zinc-500 sm:block">
              <span className="sm:hidden">Qty</span>
              <input
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={item.qty}
                onChange={(e) => updateItem(index, { qty: Number(e.target.value) })}
                className="w-16 rounded border border-white/10 bg-black/40 px-2 py-2 text-right text-sm text-[#FBF8F3]"
                aria-label="Quantity"
              />
            </label>
            <label className="flex items-center gap-1 text-[11px] text-zinc-500 sm:block">
              <span className="sm:hidden">₹</span>
              <input
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={item.unit_price_inr}
                onChange={(e) => updateItem(index, { unit_price_inr: Number(e.target.value) })}
                className="w-28 rounded border border-white/10 bg-black/40 px-2 py-2 text-right text-sm text-[#FBF8F3]"
                aria-label="Unit price in rupees"
              />
            </label>
            <button
              type="button"
              onClick={() => setItems((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : [{ ...EMPTY_ITEM }]))}
              className="justify-self-end px-2 text-lg text-zinc-500 hover:text-red-300"
              aria-label="Remove line"
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setItems((l) => [...l, { ...EMPTY_ITEM }])} className="self-start text-xs text-zinc-300 underline-offset-2 hover:underline">
          + Add line
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
        <label className="flex flex-col gap-1">
          Discount (₹)
          <input
            type="number"
            min={0}
            inputMode="decimal"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="rounded border border-white/10 bg-black/40 px-2.5 py-2 text-sm text-[#FBF8F3]"
          />
        </label>
        <label className="flex flex-col gap-1">
          GST %
          <select
            value={gstRate}
            onChange={(e) => setGstRate(Number(e.target.value))}
            className="rounded border border-white/10 bg-black/40 px-2.5 py-2 text-sm text-[#FBF8F3]"
          >
            {[18, 12, 5, 0].map((r) => (
              <option key={r} value={r}>
                {r}%
              </option>
            ))}
          </select>
        </label>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Notes for the MD / terms (payment schedule, timelines…)"
        className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-[#FBF8F3]"
      />

      <div className="rounded border border-white/10 bg-black/40 p-2.5 font-mono text-xs">
        <Row label="Subtotal" value={formatInr(totals.subtotal)} />
        {discount > 0 && <Row label="Discount" value={`− ${formatInr(discount)}`} />}
        <Row label={`GST ${gstRate}%`} value={formatInr(totals.tax)} />
        <div className="mt-1 border-t border-white/10 pt-1">
          <Row label="Total" value={formatInr(totals.total)} strong />
        </div>
      </div>

      {error && <div className="rounded bg-red-500/10 p-2 text-sm text-red-300">{error}</div>}

      <div className="flex gap-2">
        <button
          onClick={() => save(false)}
          disabled={isPending}
          className="flex-1 rounded-lg border border-white/15 py-2.5 text-sm text-zinc-200 disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          onClick={() => save(true)}
          disabled={isPending}
          className="flex-[2] rounded-lg bg-[#FBF8F3] py-2.5 text-sm font-semibold text-black disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Submit for MD approval"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between py-0.5 ${strong ? "text-sm font-semibold text-[#FBF8F3]" : "text-zinc-400"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
