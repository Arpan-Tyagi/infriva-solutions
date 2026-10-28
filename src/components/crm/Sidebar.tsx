"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { UserRole } from "@/types/crm";

interface NavItem {
  label: string;
  href: string;
  role: string;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Operations Gateway", href: "/dashboard", role: "Portal Gate", badge: "Auth" },
  { label: "Executive Cockpit", href: "/dashboard/executive", role: "MD / CEO", badge: "Live" },
  { label: "Sales & RevOps", href: "/dashboard/sales", role: "Sales Rep", badge: "3 New", badgeColor: "bg-emerald-500/20 text-emerald-400" },
  { label: "Web Dev & CI/CD", href: "/dashboard/engineering", role: "Web Dev", badge: "Dual Gate", badgeColor: "bg-amber-500/20 text-amber-400" },
  { label: "Creative Studio", href: "/dashboard/creative", role: "Design & Video", badge: "FFmpeg" },
  { label: "SMM & Paid Media", href: "/dashboard/smm", role: "SMM / Media", badge: "20th SLA" },
  { label: "SEO & Editorial", href: "/dashboard/seo", role: "SEO / GEO", badge: "ISR Edge" },
  { label: "Client Portal Preview", href: "/portal/client/proj-flyinglyte", role: "External Client", badge: "Isolated", badgeColor: "bg-cyan-500/20 text-cyan-400" },
];

const ROLES: { id: UserRole; label: string; desc: string; href: string }[] = [
  { id: "MD_CEO", label: "Managing Director / CEO", desc: "Global executive oversight & ledgers", href: "/dashboard/executive" },
  { id: "SALES_REP", label: "Sales & RevOps", desc: "Lead queue, Twilio calls, quotations", href: "/dashboard/sales" },
  { id: "WEB_DEVELOPER", label: "Web Dev & Coding", desc: "GitHub repos, Vercel deployments, warranty", href: "/dashboard/engineering" },
  { id: "SMM_MEDIA", label: "SMM & Paid Media", desc: "Content calendar, IG publisher, ODAX ads", href: "/dashboard/smm" },
  { id: "DESIGNER_EDITOR", label: "Graphic Designer & Editor", desc: "Asset drops, FFmpeg validation, Figma specs", href: "/dashboard/creative" },
  { id: "SEO_EDITORIAL", label: "SEO, GEO & Editorial", desc: "Schema.org graphs, GA4 reports, CWV QA", href: "/dashboard/seo" },
  { id: "CLIENT_VIEW", label: "External Client View", desc: "Milestones, staging previews, calendar approvals", href: "/portal/client/proj-flyinglyte" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<UserRole>("MD_CEO");
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  useEffect(() => {
    const matched = ROLES.find((r) => r.href === pathname);
    if (matched) {
      setActiveRole(matched.id);
    }
  }, [pathname]);

  const handleSelectRole = (roleItem: (typeof ROLES)[number]) => {
    setActiveRole(roleItem.id);
    setRoleMenuOpen(false);
    router.push(roleItem.href);
  };

  return (
    <aside className="w-72 bg-[#0A0A0B] border-r border-white/10 flex flex-col justify-between shrink-0 select-none">
      {/* Top Branding */}
      <div>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#FBF8F3] text-[#0A0A0B] flex items-center justify-center font-bold font-mono text-sm tracking-tighter">
              IS
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest font-mono text-[#FBF8F3]">
                INFRIVA
              </div>
              <div className="text-[10px] text-zinc-400 font-mono tracking-tight">
                Enterprise CRM & ERP
              </div>
            </div>
          </Link>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Operational" />
        </div>

        {/* Active Role Selector Simulator */}
        <div className="p-3 border-b border-white/10 bg-white/[0.02]">
          <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1 px-2">
            Simulated Persona (RLS)
          </div>
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="w-full text-left px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between transition-colors text-xs text-[#FBF8F3]"
            >
              <span className="font-mono truncate">
                {ROLES.find((r) => r.id === activeRole)?.label}
              </span>
              <span className="text-[10px] text-zinc-400 ml-1">▼</span>
            </button>

            {roleMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#121214] border border-white/15 rounded shadow-2xl z-50 py-1">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRole(r)}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex flex-col ${
                      activeRole === r.id
                        ? "bg-white/15 text-[#FBF8F3] font-medium"
                        : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className="text-[10px] text-zinc-400">{r.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 px-3 py-1">
            Departmental Cockpits
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3 py-2 rounded text-xs transition-all ${
                  isActive
                    ? "bg-[#FBF8F3] text-[#0A0A0B] font-semibold"
                    : "text-zinc-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  <span
                    className={`text-[10px] font-mono ${
                      isActive ? "text-zinc-700" : "text-zinc-400"
                    }`}
                  >
                    {item.role}
                  </span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      item.badgeColor ||
                      (isActive
                        ? "bg-black/15 text-black"
                        : "bg-white/10 text-zinc-300")
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info, Session Controls & Telemetry */}
      <div>
        <div className="p-3 border-t border-white/10 bg-white/[0.02]">
          <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1.5 px-1">
            Active Auth Session
          </div>
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/login"
              className="flex-1 text-center py-1.5 px-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors"
            >
              Sign In / Change Role
            </Link>
            <Link
              href="/"
              className="px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
              title="Return to Public Website"
            >
              Site &rarr;
            </Link>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-white/[0.01] text-[11px] font-mono text-zinc-400">
          <div className="flex items-center justify-between mb-1.5">
            <span>PostgreSQL RLS:</span>
            <span className="text-emerald-400">Enforced</span>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span>Search Latency:</span>
            <span className="text-zinc-200">1.2s target</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Edge LCP Gate:</span>
            <span className="text-zinc-200">&lt; 1.5s sub-second</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
