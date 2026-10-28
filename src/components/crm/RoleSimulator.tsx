"use client";

import { useState, useTransition } from "react";
import type { UserRole } from "@/types/crm";
import { ALL_ROLES, ROLE_LABEL } from "@/lib/crm-roles";
import { simulateRoleAction } from "@/app/dashboard/auth-actions";

/**
 * Development-only floating toolbar: one click signs in as the seeded persona
 * for a role, so screens and RLS are tested exactly as that persona sees them.
 */
export function RoleSimulator({ currentRole }: { currentRole: UserRole }) {
  const [open, setOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const switchTo = (role: UserRole) => {
    setError(null);
    setPendingRole(role);
    startTransition(async () => {
      const result = await simulateRoleAction(role);
      if (result?.error) setError(result.error);
      setPendingRole(null);
    });
  };

  return (
    <div className="fixed bottom-20 right-3 md:bottom-4 md:right-4 z-[60] text-xs font-mono">
      {open && (
        <div className="mb-2 w-64 rounded-lg border border-amber-500/30 bg-[#121214] shadow-2xl p-2">
          <div className="px-1.5 pb-1.5 text-[10px] uppercase tracking-wider text-amber-400">
            Role Simulator · dev only
          </div>
          <div className="grid grid-cols-1 gap-1">
            {ALL_ROLES.map((role) => (
              <button
                key={role}
                disabled={isPending}
                onClick={() => switchTo(role)}
                className={`text-left px-2 py-2 rounded border transition-colors disabled:opacity-60 ${
                  role === currentRole
                    ? "border-amber-400/50 bg-amber-400/10 text-amber-200"
                    : "border-white/10 text-zinc-300 hover:bg-white/5"
                }`}
              >
                {pendingRole === role ? "Signing in…" : ROLE_LABEL[role]}
                <span className="block text-[10px] text-zinc-500">{role}</span>
              </button>
            ))}
          </div>
          {error && <div className="mt-2 p-2 rounded bg-red-500/10 text-red-300 text-[11px] leading-snug">{error}</div>}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="ml-auto block px-3 py-2 rounded-full border border-amber-500/40 bg-[#1a160c] text-amber-300 shadow-lg"
        aria-expanded={open}
      >
        🎭 {ROLE_LABEL[currentRole]}
      </button>
    </div>
  );
}
