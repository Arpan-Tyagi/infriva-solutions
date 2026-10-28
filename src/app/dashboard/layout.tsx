import React from "react";
import { redirect } from "next/navigation";
import { requireViewer } from "@/lib/crm-auth";
import { ROLE_HOME, TEST_PERSONAS_ENABLED } from "@/lib/crm-roles";
import { CrmShell } from "@/components/crm/CrmShell";

export const metadata = {
  title: "Infriva Enterprise CRM & ERP",
  description: "Unified Enterprise CRM, Multi-Departmental Operations & API Orchestration System",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();

  // Clients only ever see their portal.
  if (viewer.role === "CLIENT_VIEW") redirect(ROLE_HOME.CLIENT_VIEW);

  return (
    <CrmShell viewer={viewer} showRoleSimulator={TEST_PERSONAS_ENABLED}>
      {children}
    </CrmShell>
  );
}
