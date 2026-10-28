"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/types/crm";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

interface PersonaMeta {
  role: UserRole;
  name: string;
  email: string;
  title: string;
  initials: string;
  href: string;
}

const PERSONAS: PersonaMeta[] = [
  {
    role: "MD_CEO",
    name: "Arpan Tyagi",
    email: "md@infrivasolutions.com",
    title: "MD / CEO",
    initials: "AT",
    href: "/dashboard/executive",
  },
  {
    role: "SALES_REP",
    name: "Rohan Sharma",
    email: "sales@infrivasolutions.com",
    title: "Sales & RevOps",
    initials: "RS",
    href: "/dashboard/sales",
  },
  {
    role: "WEB_DEVELOPER",
    name: "Aditya Verma",
    email: "dev@infrivasolutions.com",
    title: "Web Dev & Coding",
    initials: "AV",
    href: "/dashboard/engineering",
  },
  {
    role: "SMM_MEDIA",
    name: "Pooja Nair",
    email: "smm@infrivasolutions.com",
    title: "SMM & Paid Media",
    initials: "PN",
    href: "/dashboard/smm",
  },
  {
    role: "DESIGNER_EDITOR",
    name: "Kavita Patel",
    email: "creative@infrivasolutions.com",
    title: "Creative & Video",
    initials: "KP",
    href: "/dashboard/creative",
  },
  {
    role: "SEO_EDITORIAL",
    name: "Sameer Rao",
    email: "seo@infrivasolutions.com",
    title: "SEO & GEO",
    initials: "SR",
    href: "/dashboard/seo",
  },
  {
    role: "CLIENT_VIEW",
    name: "Karan Mehra",
    email: "client@flyinglyte.com",
    title: "Client (FlyingLyte)",
    initials: "KM",
    href: "/portal/client/proj-flyinglyte",
  },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<PersonaMeta>(PERSONAS[0]);
  const [istTime, setIstTime] = useState<string>("");

  // Determine active persona based on route or default
  useEffect(() => {
    const matched = PERSONAS.find((p) => pathname === p.href);
    if (matched) {
      setCurrentUser(matched);
    }
  }, [pathname]);

  // Keep IST clock updated
  useEffect(() => {
    const updateTime = () => {
      setIstTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSwitchPersona = (p: PersonaMeta) => {
    setCurrentUser(p);
    setMenuOpen(false);
    router.push(p.href);
  };

  const handleSignOut = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out local notice:", e);
    }
    router.push("/login");
  };

  return (
    <header className="h-14 border-b border-white/10 px-6 flex items-center justify-between shrink-0 bg-[#0A0A0B]/90 backdrop-blur z-40 select-none">
      {/* System Status Telemetry */}
      <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
        <Link href="/dashboard" className="text-zinc-200 font-semibold hover:text-white transition-colors">
          INF-CORE-SYSTEM
        </Link>
        <span>/</span>
        <span className="text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          API Mesh Active
        </span>
        <span className="hidden md:inline text-zinc-600">|</span>
        <span className="hidden md:inline text-[11px] text-zinc-400">
          Target LCP: &lt;1.5s
        </span>
      </div>

      {/* Right Controls: IST Clock + User Persona Menu & Sign Out */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="hidden sm:flex items-center gap-2 text-zinc-400">
          <span>New Delhi:</span>
          <span className="text-zinc-200">{istTime || "12:00:00 PM"} IST</span>
        </div>

        {/* User Persona & Role Selector */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors"
          >
            <div className="w-5 h-5 rounded bg-[#FBF8F3] text-[#0A0A0B] flex items-center justify-center font-bold text-[10px]">
              {currentUser.initials}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[#FBF8F3] leading-none font-medium truncate max-w-[120px]">
                {currentUser.name}
              </span>
              <span className="text-[9px] text-zinc-400 leading-none mt-0.5">
                {currentUser.title}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 ml-0.5">▼</span>
          </button>

          {/* Persona Switcher Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-[#121214] border border-white/15 rounded shadow-2xl z-50 py-1.5 text-xs">
              <div className="px-3 py-1.5 border-b border-white/10 text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
                Switch Operational Persona
              </div>

              <div className="max-h-60 overflow-y-auto py-1">
                {PERSONAS.map((p) => (
                  <button
                    key={p.role}
                    onClick={() => handleSwitchPersona(p)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                      currentUser.role === p.role
                        ? "bg-white/15 text-[#FBF8F3]"
                        : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[160px]">
                        {p.email}
                      </div>
                    </div>
                    {currentUser.role === p.role && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-white/10 pt-1.5 mt-1 px-2 flex flex-col gap-1">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-white/5 text-[11px] text-brand-300 flex items-center justify-between transition-colors"
                >
                  <span>Open Full Login Portal</span>
                  <span>&rarr;</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-red-500/10 text-[11px] text-red-400 flex items-center justify-between transition-colors"
                >
                  <span>Sign Out of CRM</span>
                  <span>✕</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
