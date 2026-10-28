"use client";

import { useEffect, useState } from "react";
import type { Viewer } from "@/lib/crm-auth";
import { ROLE_LABEL } from "@/lib/crm-roles";
import { signOutAction } from "@/app/dashboard/auth-actions";

export function DashboardHeader({ viewer, onOpenMenu }: { viewer: Viewer; onOpenMenu: () => void }) {
  const [istTime, setIstTime] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const tick = () =>
      setIstTime(
        new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    tick();
    const interval = setInterval(tick, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 border-b border-white/10 px-3 md:px-6 flex items-center justify-between shrink-0 bg-[#0A0A0B]/90 backdrop-blur z-30 select-none">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMenu}
          className="md:hidden w-10 h-10 -ml-1 rounded border border-white/10 flex flex-col items-center justify-center gap-1"
          aria-label="Open menu"
        >
          <span className="block w-4 h-px bg-zinc-200" />
          <span className="block w-4 h-px bg-zinc-200" />
          <span className="block w-4 h-px bg-zinc-200" />
        </button>
        <span className="text-xs font-mono text-zinc-200 font-semibold">INFRIVA CRM</span>
      </div>

      <div className="flex items-center gap-3 text-xs font-mono">
        <span className="hidden sm:inline text-zinc-400">
          IST <span className="text-zinc-200">{istTime}</span>
        </span>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="w-6 h-6 rounded bg-[#FBF8F3] text-[#0A0A0B] flex items-center justify-center font-bold text-[10px]">
              {viewer.initials}
            </span>
            <span className="hidden sm:flex flex-col text-left">
              <span className="text-[#FBF8F3] leading-none truncate max-w-[140px]">{viewer.fullName}</span>
              <span className="text-[9px] text-zinc-400 leading-none mt-0.5">{ROLE_LABEL[viewer.role]}</span>
            </span>
          </button>

          {menuOpen && (
            <div role="menu" className="absolute right-0 top-full mt-1.5 w-56 bg-[#121214] border border-white/15 rounded shadow-2xl z-50 p-1.5">
              <div className="px-2 py-1.5 text-[11px] text-zinc-400 truncate">{viewer.email}</div>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full text-left px-2 py-2 rounded hover:bg-red-500/10 text-[12px] text-red-400"
                >
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
