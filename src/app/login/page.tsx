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

const TEST_PERSONAS: PersonaConfig[] = [
  {
    id: "md",
    level: "L1",
    role: "MD_CEO",
    title: "Managing Director / CEO",
    name: "Arpan Tyagi",
    email: "md@infrivasolutions.com",
    targetRoute: "/dashboard/executive",
    scope: "Global Oversight, Revenue Ledgers, CAC Payback, Deploy Health",
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
    scope: "Omnichannel Leads, Waterfall Enrichment, Twilio Calls, Quotations",
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
    scope: "GitHub Octokit Repos, Vercel Previews, Dual-Gate QA, 90d Warranty",
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
    scope: "20th Planning SLA, Meta Advantage+ ODAX, Instagram Direct Publisher",
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
    scope: "Figma Tokens, Client Asset Drops, Automated FFmpeg Spec Gate",
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
    scope: "Schema.org Entity Graphs, Sub-1.5s CWV Gate, GA4/GSC Telemetry",
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
    scope: "Tenant-Isolated Milestones, Staging Previews, 48h Approval Window",
    color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/5",
    tag: "CLIENT_PORTAL",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<PersonaConfig>(TEST_PERSONAS[0]);
  const [email, setEmail] = useState<string>(TEST_PERSONAS[0].email);
  const [password, setPassword] = useState<string>("Infriva2026!");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authModeNotice, setAuthModeNotice] = useState<string | null>(null);

  const handleSelectPersona = (persona: PersonaConfig) => {
    setSelectedPersona(persona);
    setEmail(persona.email);
    setPassword("Infriva2026!");
    setErrorMessage(null);
    setAuthModeNotice(null);
  };

  const handleDirectLaunch = (targetRoute: string) => {
    router.push(targetRoute);
  };

  const handleSupabaseSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setAuthModeNotice(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If Supabase URL is placeholder or network error occurs, guide the user cleanly
        console.warn("Supabase Auth notice:", error.message);
        setErrorMessage(`Supabase Auth: ${error.message}`);
        setAuthModeNotice("Note: You can use the 'Instant Launch' button below to explore the cockpit in simulated mode.");
      } else if (data?.user) {
        // Successful login
        router.push(selectedPersona.targetRoute);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error?.message || "Failed to establish Supabase session.");
      setAuthModeNotice("You can launch the dashboard directly using the 'Instant Launch' button.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] text-[#FBF8F3] flex flex-col justify-between selection:bg-brand-50 selection:text-black">
      {/* Top Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black/40 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-sm bg-[#FBF8F3] text-[#0A0A0B] flex items-center justify-center font-bold font-mono text-sm tracking-tighter group-hover:scale-105 transition-transform">
              IS
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest font-mono text-[#FBF8F3]">
                INFRIVA SOLUTIONS
              </div>
              <div className="text-[10px] text-zinc-400 font-mono tracking-tight">
                Enterprise CRM & ERP Portal [2026]
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="hidden sm:inline text-zinc-400">PostgreSQL RLS Protected</span>
          <Link
            href="/"
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 border border-white/10 px-3 py-1.5 rounded"
          >
            &larr; Public Site
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
        {/* Left Column: 1-Click Role Switcher Matrix */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-brand-300">
                Persona Test Directory
              </div>
              <h1 className="text-xl md:text-2xl font-serif tracking-tight mt-1">
                Select an Operational Role
              </h1>
            </div>
            <span className="text-[11px] font-mono px-2 py-1 rounded bg-white/5 border border-white/10 text-zinc-400">
              7 Personas Provisioned
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Click any persona card to auto-fill the credentials or immediately launch into its tenant-isolated cockpit. All 7 roles are defined in <code className="text-zinc-300 bg-white/10 px-1 py-0.5 rounded">supabase/seed_test_logins.sql</code> with password <code className="text-amber-400 font-mono">Infriva2026!</code>.
          </p>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {TEST_PERSONAS.map((persona) => {
              const isSelected = selectedPersona.id === persona.id;
              return (
                <div
                  key={persona.id}
                  onClick={() => handleSelectPersona(persona)}
                  className={`p-3.5 rounded border transition-all cursor-pointer text-left flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "border-[#FBF8F3] bg-white/[0.07] ring-1 ring-[#FBF8F3]/50 shadow-xl"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${persona.color}`}>
                        {persona.level} &bull; {persona.tag}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Selected
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-sm text-[#FBF8F3]">{persona.title}</div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{persona.name}</div>
                  </div>

                  <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span className="truncate max-w-[160px]">{persona.email}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectLaunch(persona.targetRoute);
                      }}
                      className="text-xs text-[#FBF8F3] hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded border border-white/10 flex items-center gap-1 transition-colors shrink-0"
                      title={`Launch ${persona.title} Cockpit`}
                    >
                      Launch &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Authentication Console */}
        <div className="lg:col-span-5 bg-[#121214] border border-white/15 rounded-lg p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative">
          <div className="border-b border-white/10 pb-4">
            <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
              Supabase Auth Console
            </div>
            <h2 className="text-xl font-medium tracking-tight mt-1 text-[#FBF8F3]">
              Portal Authentication
            </h2>
            <div className="text-xs text-zinc-400 mt-1">
              Active Selection: <span className="text-[#FBF8F3] font-mono">{selectedPersona.title}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              <div className="font-mono font-medium mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Auth Handshake
              </div>
              <div>{errorMessage}</div>
              {authModeNotice && (
                <div className="mt-2 text-zinc-300 border-t border-red-500/20 pt-1.5 font-mono text-[11px]">
                  {authModeNotice}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSupabaseSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                User Email (Persona)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded bg-black/60 border border-white/15 text-sm text-[#FBF8F3] font-mono focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded bg-black/60 border border-white/15 text-sm text-[#FBF8F3] font-mono focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40"
              />
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded bg-[#FBF8F3] hover:bg-white text-[#0A0A0B] font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Authenticating Session...
                  </>
                ) : (
                  <>Sign In via Supabase &rarr;</>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDirectLaunch(selectedPersona.targetRoute)}
                className="w-full py-2.5 px-4 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 font-mono text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Instant Launch Cockpit (Simulated Session)</span>
                <span className="text-[#FBF8F3] font-bold">&rarr;</span>
              </button>
            </div>
          </form>

          {/* Persona Spec Details */}
          <div className="p-3.5 rounded bg-black/40 border border-white/10 text-[11px] font-mono space-y-1.5 text-zinc-400">
            <div className="flex items-center justify-between text-zinc-300">
              <span>Target Route:</span>
              <span className="text-[#FBF8F3]">{selectedPersona.targetRoute}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Security Tier:</span>
              <span className="text-zinc-200">PostgreSQL RLS Claims</span>
            </div>
            <div className="pt-1.5 border-t border-white/5 text-[10px] leading-relaxed text-zinc-400">
              <span className="text-zinc-300 font-semibold">Scope: </span>
              {selectedPersona.scope}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="border-t border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-zinc-400 gap-2 bg-black/40">
        <div>Infriva Solutions CRM & ERP &bull; Next.js 16.3 + React 19 + Supabase RLS</div>
        <div className="flex items-center gap-4">
          <span className="text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Healthy
          </span>
          <span>Seed: <code className="text-zinc-300">supabase/seed_test_logins.sql</code></span>
        </div>
      </footer>
    </div>
  );
}
