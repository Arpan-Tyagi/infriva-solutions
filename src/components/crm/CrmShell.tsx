"use client";

import { useState } from "react";
import type { Viewer } from "@/lib/crm-auth";
import { Sidebar } from "@/components/crm/Sidebar";
import { DashboardHeader } from "@/components/crm/DashboardHeader";
import { RoleSimulator } from "@/components/crm/RoleSimulator";

export function CrmShell({
  viewer,
  showRoleSimulator,
  children,
}: {
  viewer: Viewer;
  showRoleSimulator: boolean;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#0A0A0B] text-[#FBF8F3]">
      <Sidebar viewer={viewer} mobileOpen={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <main className="flex-1 min-w-0 overflow-hidden bg-[#0E0E10] flex flex-col">
        <DashboardHeader viewer={viewer} onOpenMenu={() => setMenuOpen(true)} />
        <div className="flex-1 min-h-0 overflow-y-auto p-3 md:p-6">{children}</div>
      </main>
      {showRoleSimulator && <RoleSimulator currentRole={viewer.role} />}
    </div>
  );
}
