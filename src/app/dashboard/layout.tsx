import React from "react";
import { Sidebar } from "@/components/crm/Sidebar";
import { DashboardHeader } from "@/components/crm/DashboardHeader";

export const metadata = {
  title: "Infriva Enterprise CRM & ERP",
  description: "Unified Enterprise CRM, Multi-Departmental Operations & API Orchestration System",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0A0B] text-[#FBF8F3]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#0E0E10] flex flex-col">
        {/* Top Operational Status Bar & Persona Switcher */}
        <DashboardHeader />

        {/* Viewport Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
