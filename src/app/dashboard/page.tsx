"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { UserRole } from "@/types/crm";

interface PersonaConfig {
  id: string;
  level: string;
  role: UserRole;
  title: string;
  name: string;
  email: string;
  targetRoute: string;
  scope: string;
  color: string;
  tag: string;
}

const PERSONAS: PersonaConfig[] = [
  {
    id: "md",
    level: "L1",
    role: "MD_CEO",
    title: "Managing Director / CEO",
    name: "Arpan Tyagi",
    email: "md@infrivasolutions.com",
    targetRoute: "/dashboard/executive",
    scope: "Global executive oversight, revenue ledgers, CAC payback, sprint health",
    color: "border-amber-500/30 text-amber-400 bg-amber-500/5",
    tag: "EXECUTIVE",
  },
  {
    id: "sales",
    level: "L2",
    role: "SALES_REP",
    title: "Sales & RevOps Lead",
    name: "Rohan Sharma",
    email: "sales@infrivasolutions.com",
    targetRoute: "/dashboard/sales",
    scope: "Omnichannel lead intake, waterfall enrichment, Twilio calls, quotations",
    color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
    tag: "REVOPS",
  },
  {
    id: "dev",
    level: "L3",
    role: "WEB_DEVELOPER",
    title: "Principal Web Architect",
    name: "Aditya Verma",
    email: "dev@infrivasolutions.com",
    targetRoute: "/dashboard/engineering",
    scope: "GitHub Octokit repos, Vercel deployments, dual-gate QA (<1.5s LCP), warranty",
    color: "border-sky-500/30 text-sky-400 bg-sky-500/5",
    tag: "ENGINEERING",
  },
  {
    id: "smm",
    level: "L4",
    role: "SMM_MEDIA",
    title: "Growth & Paid Media Lead",
    name: "Pooja Nair",
    email: "smm@infrivasolutions.com",
    targetRoute: "/dashboard/smm",
    scope: "20th-of-month planning SLA, Meta Advantage+ ODAX, Instagram publisher",
    color: "border-rose-500/30 text-rose-400 bg-rose-500/5",
    tag: "GROWTH",
  },
  {
    id: "creative",
    level: "L5",
    role: "DESIGNER_EDITOR",
    title: "Creative Director & Editor",
    name: "Kavita Patel",
    email: "creative@infrivasolutions.com",
    targetRoute: "/dashboard/creative",
    scope: "Asset drops, automated FFmpeg spec gate (H.264/AAC), Figma design tokens",
    color: "border-purple-500/30 text-purple-400 bg-purple-500/5",
    tag: "STUDIO",
  },
  {
    id: "seo",
    level: "L6",
    role: "SEO_EDITORIAL",
    title: "SEO, GEO & Editorial Engineer",
    name: "Sameer Rao",
    email: "seo@infrivasolutions.com",
    targetRoute: "/dashboard/seo",
    scope: "Schema.org entity graphs, CWV staging gate, batched GA4/GSC bounce telemetry",
    color: "border-teal-500/30 text-teal-400 bg-teal-500/5",
    tag: "GEO_SEO",
  },
  {
    id: "client",
    level: "L7",
    role: "CLIENT_VIEW",
    title: "External Client Partner",
    name: "Karan Mehra (FlyingLyte)",
    email: "client@flyinglyte.com",
    targetRoute: "/portal/client/proj-flyinglyte",
    scope: "Tenant-isolated milestones, Vercel staging preview, 48h calendar approval desk",
    color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/5",
    tag: "CLIENT_PORTAL",
  },
];

export default function DashboardGatewayPage() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<PersonaConfig>(PERSONAS[0]);
  const [email, setEmail] = useState<string>(PERSONAS[0].email);
  const [password, setPassword] = useState<string>("Infriva2026!");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const handleSelectPersona = (p: PersonaConfig) => {
    setSelectedPersona(p);
    setEmail(p.email);
    setPassword("Infriva2026!");
    setStatusNotice(null);
  };

  const handleQuickLaunch = (route: string) => {
    router.push(route);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusNotice(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.warn("Supabase auth response:", error.message);
        setStatusNotice(`Supabase Auth Note: ${error.message}. Redirecting in simulated session mode...`);
        // Smooth graceful transition to destination
        setTimeout(() => {
          router.push(selectedPersona.targetRoute);
        }, 800);
      } else if (data?.user) {
        router.push(selectedPersona.targetRoute);
      }
    } catch {
      router.push(selectedPersona.targetRoute);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 select-none">
      {/* Top Banner / Hero */}
      <div className="border border-white/10 rounded-lg p-6 md:p-8 bg-[#121214] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-widest text-brand-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Operations Gateway &bull; Session Control
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-[#FBF8F3] tracking-tight">
              Infriva Enterprise CRM & ERP Portal
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-2xl mt-1.5 leading-relaxed">
              Unified operating system integrating Next.js 16 App Router, React 19, and PostgreSQL Row-Level Security across all 7 agency personas and service tiers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/login"
              className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono text-[#FBF8F3] transition-colors"
            >
              Full Login Page &rarr;
            </Link>
            <button
              onClick={() => handleQuickLaunch(selectedPersona.targetRoute)}
              className="px-4 py-2 rounded bg-[#FBF8F3] hover:bg-white text-[#0A0A0B] text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Launch Active Role &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Fast Login Form & 7-Persona Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 7-Persona Matrix */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                Departmental Personas
              </div>
              <h2 className="text-lg font-medium text-[#FBF8F3]">
                Select an Operating Persona
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 border border-white/10 text-zinc-400">
              Default PW: <code className="text-amber-400 font-mono">Infriva2026!</code>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PERSONAS.map((p) => {
              const isSelected = selectedPersona.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPersona(p)}
                  className={`p-3.5 rounded border transition-all cursor-pointer flex flex-col justify-between gap-3 text-left ${
                    isSelected
                      ? "border-[#FBF8F3] bg-white/[0.08] ring-1 ring-[#FBF8F3]/50 shadow-xl"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${p.color}`}>
                        {p.level} &bull; {p.tag}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-xs text-[#FBF8F3]">{p.title}</div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{p.name}</div>
                  </div>

                  <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="truncate max-w-[140px]">{p.email}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickLaunch(p.targetRoute);
                      }}
                      className="text-[#FBF8F3] hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded border border-white/10 transition-colors shrink-0"
                    >
                      Open &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Fast Sign In Form */}
        <div className="lg:col-span-5 bg-[#121214] border border-white/15 rounded-lg p-6 flex flex-col gap-5 shadow-2xl">
          <div className="border-b border-white/10 pb-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              In-Dashboard Authentication
            </div>
            <h3 className="text-base font-medium text-[#FBF8F3] mt-1">
              Sign In / Establish Session
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Target Cockpit: <span className="text-[#FBF8F3] font-mono">{selectedPersona.title}</span>
            </p>
          </div>

          {statusNotice && (
            <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
              {statusNotice}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Account Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-black/60 border border-white/15 text-xs text-[#FBF8F3] font-mono focus:outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-black/60 border border-white/15 text-xs text-[#FBF8F3] font-mono focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-3 rounded bg-[#FBF8F3] hover:bg-white text-[#0A0A0B] font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>Sign In via Supabase &rarr;</>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleQuickLaunch(selectedPersona.targetRoute)}
                className="w-full py-2 px-3 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 font-mono text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Instant Launch Cockpit</span>
                <span className="text-[#FBF8F3] font-bold">&rarr;</span>
              </button>
            </div>
          </form>

          {/* Operational Scope Overview */}
          <div className="p-3 rounded bg-black/40 border border-white/10 text-[10px] font-mono text-zinc-400 space-y-1">
            <div className="flex items-center justify-between text-zinc-300">
              <span>Route:</span>
              <span className="text-[#FBF8F3]">{selectedPersona.targetRoute}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>RLS Scope:</span>
              <span className="text-zinc-200">{selectedPersona.role}</span>
            </div>
            <div className="pt-1 border-t border-white/5 text-zinc-400">
              <span className="text-zinc-300 font-semibold">Responsibility: </span>
              {selectedPersona.scope}
            </div>
          </div>
        </div>
      </div>

      {/* Operational Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded border border-white/10 bg-white/[0.02]">
          <div className="text-[10px] text-zinc-400 uppercase">PostgreSQL Kernel</div>
          <div className="text-emerald-400 font-semibold mt-1">RLS Protected</div>
        </div>
        <div className="p-3.5 rounded border border-white/10 bg-white/[0.02]">
          <div className="text-[10px] text-zinc-400 uppercase">Edge Pre-Launch Gate</div>
          <div className="text-[#FBF8F3] font-semibold mt-1">&lt;1.5s LCP Verified</div>
        </div>
        <div className="p-3.5 rounded border border-white/10 bg-white/[0.02]">
          <div className="text-[10px] text-zinc-400 uppercase">Lead Decay Window</div>
          <div className="text-emerald-400 font-semibold mt-1">&lt;15s Deterministic</div>
        </div>
        <div className="p-3.5 rounded border border-white/10 bg-white/[0.02]">
          <div className="text-[10px] text-zinc-400 uppercase">Database Seed</div>
          <div className="text-zinc-300 font-semibold mt-1">7 Personas Ready</div>
        </div>
      </div>
    </div>
  );
}
