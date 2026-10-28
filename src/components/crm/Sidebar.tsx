"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/types/crm";
import type { Viewer } from "@/lib/crm-auth";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/crm-roles";

interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
  sample?: boolean;
}

const INTERNAL: UserRole[] = ["MD_CEO", "SALES_REP", "WEB_DEVELOPER", "SMM_MEDIA", "DESIGNER_EDITOR", "SEO_EDITORIAL"];

// `sample`: cockpit still renders sample data until its module is wired.
const NAV_ITEMS: NavItem[] = [
  { label: "Executive Cockpit", href: "/dashboard/executive", roles: ["MD_CEO"], sample: true },
  { label: "Sales & RevOps", href: "/dashboard/sales", roles: ["MD_CEO", "SALES_REP"] },
  { label: "Web Dev & CI/CD", href: "/dashboard/engineering", roles: INTERNAL, sample: true },
  { label: "Creative Studio", href: "/dashboard/creative", roles: INTERNAL, sample: true },
  { label: "SMM & Paid Media", href: "/dashboard/smm", roles: INTERNAL, sample: true },
  { label: "SEO & Editorial", href: "/dashboard/seo", roles: INTERNAL, sample: true },
  { label: "Client Portal Preview", href: "/portal/client/proj-flyinglyte", roles: ["MD_CEO"], sample: true },
];

export function Sidebar({
  viewer,
  mobileOpen,
  onNavigate,
}: {
  viewer: Viewer;
  mobileOpen: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(viewer.role));
  const home = ROLE_HOME[viewer.role];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onNavigate}
        className={`fixed inset-0 z-40 bg-black/60 md:hidden transition-opacity ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0A0B] border-r border-white/10 flex flex-col justify-between select-none transition-transform md:static md:translate-x-0 md:shrink-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="CRM navigation"
      >
        <div>
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <Link href={home} onClick={onNavigate} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-sm bg-[#FBF8F3] text-[#0A0A0B] flex items-center justify-center font-bold font-mono text-sm tracking-tighter">
                IS
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-mono text-[#FBF8F3]">INFRIVA</div>
                <div className="text-[10px] text-zinc-400 font-mono tracking-tight">Enterprise CRM & ERP</div>
              </div>
            </Link>
            <button
              onClick={onNavigate}
              className="md:hidden w-9 h-9 rounded border border-white/10 text-zinc-300 text-lg leading-none"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <nav className="p-3 space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 px-3 py-1">Workspaces</div>
            {items.map((item) => {
              const isActive = pathname === item.href;
              const isHome = item.href === home;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center justify-between px-3 py-2.5 rounded text-sm md:text-xs transition-all ${
                    isActive ? "bg-[#FBF8F3] text-[#0A0A0B] font-semibold" : "text-zinc-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{item.label}</span>
                  {isHome ? (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isActive ? "bg-black/15" : "bg-emerald-500/15 text-emerald-400"}`}>
                      Yours
                    </span>
                  ) : item.sample ? (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isActive ? "bg-black/15" : "bg-white/10 text-zinc-400"}`}>
                      Sample
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 bg-white/[0.02] text-xs">
          <div className="text-[#FBF8F3] font-medium truncate">{viewer.fullName}</div>
          <div className="text-[11px] text-zinc-400 font-mono truncate">{viewer.email}</div>
          <div className="mt-1 inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
            {ROLE_LABEL[viewer.role]}
          </div>
        </div>
      </aside>
    </>
  );
}
