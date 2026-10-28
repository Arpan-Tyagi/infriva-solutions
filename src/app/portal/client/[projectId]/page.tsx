"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MOCK_PROJECTS, MOCK_DEPLOYMENTS, MOCK_SOCIAL_POSTS } from "@/lib/crm-mock-data";

export default function ExternalClientPortal() {
  const params = useParams();
  const projectId = (params?.projectId as string) || "proj-flyinglyte";
  const project = MOCK_PROJECTS.find((p) => p.id === projectId) || MOCK_PROJECTS[0];
  const deployment = MOCK_DEPLOYMENTS[0];

  const [posts, setPosts] = useState(MOCK_SOCIAL_POSTS);
  const [warrantyTitle, setWarrantyTitle] = useState("");
  const [warrantyDesc, setWarrantyDesc] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"MILESTONES" | "PREVIEW" | "CALENDAR" | "DROPZONE" | "WARRANTY">("MILESTONES");

  const handleApprovePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, approval_status: "APPROVED" } : p))
    );
    alert("Post approved! Status updated in SMM calendar queue.");
  };

  const handleWarrantySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warrantyTitle) return;
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setWarrantyTitle("");
      setWarrantyDesc("");
      alert("Warranty Bug Ticket submitted! Synced to GitHub Issues & Lead Developer assigned under 90-day post-launch warranty.");
    }, 1500);
  };

  const engineeringPhases = [
    { id: "01_CONSULTATION", label: "01 Consultation & System Audit", done: true },
    { id: "02_PLANNING", label: "02 Data Flow & Webhook Blueprint", done: true },
    { id: "03_DESIGN", label: "03 Figma Design System & UI/UX Handoff", done: true },
    { id: "04_DEVELOPMENT", label: "04 Next.js 16 Full-Stack Engineering", done: true },
    { id: "05_LAUNCH_QA", label: "05 Pre-Launch Stress Testing & LCP QA", done: project.engineering_phase === "05_LAUNCH_QA" || project.engineering_phase === "06_SUPPORT_WARRANTY", current: project.engineering_phase === "05_LAUNCH_QA" },
    { id: "06_SUPPORT_WARRANTY", label: "06 Zero-Downtime Launch & 90-Day Warranty", done: project.engineering_phase === "06_SUPPORT_WARRANTY", current: project.engineering_phase === "06_SUPPORT_WARRANTY" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#FBF8F3] font-mono text-xs">
      {/* Top Client Header */}
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between bg-[#121214]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-[#FBF8F3] text-black font-bold flex items-center justify-center tracking-tighter">
            IS
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide">{project.name}</div>
            <div className="text-[10px] text-zinc-400">Infriva Solutions White-Glove Client Portal</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
            {project.status}
          </span>
          <span className="text-zinc-500">|</span>
          <a
            href="/dashboard/executive"
            className="text-zinc-400 hover:text-white text-[11px] underline"
          >
            ← Return to Agency Dashboard
          </a>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-white/10 px-8 py-2.5 flex items-center gap-2 bg-white/[0.01]">
        <button
          onClick={() => setActiveTab("MILESTONES")}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === "MILESTONES" ? "bg-[#FBF8F3] text-black font-semibold" : "text-zinc-400 hover:text-white"
          }`}
        >
          Engineering Milestones
        </button>
        <button
          onClick={() => setActiveTab("PREVIEW")}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === "PREVIEW" ? "bg-[#FBF8F3] text-black font-semibold" : "text-zinc-400 hover:text-white"
          }`}
        >
          Live Staging Preview
        </button>
        <button
          onClick={() => setActiveTab("CALENDAR")}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === "CALENDAR" ? "bg-[#FBF8F3] text-black font-semibold" : "text-zinc-400 hover:text-white"
          }`}
        >
          Content Calendar (48h Approval)
        </button>
        <button
          onClick={() => setActiveTab("DROPZONE")}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === "DROPZONE" ? "bg-[#FBF8F3] text-black font-semibold" : "text-zinc-400 hover:text-white"
          }`}
        >
          Asset Dropzone
        </button>
        <button
          onClick={() => setActiveTab("WARRANTY")}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === "WARRANTY" ? "bg-[#FBF8F3] text-black font-semibold" : "text-zinc-400 hover:text-white"
          }`}
        >
          90-Day Warranty Desk
        </button>
      </div>

      {/* Content Body */}
      <div className="max-w-6xl mx-auto p-8 space-y-6">
        {activeTab === "MILESTONES" && (
          <div className="p-6 rounded border border-white/10 bg-[#121214] space-y-5">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                6-Stage Engineering Process Milestone Tracker
              </h2>
              <p className="text-zinc-400 mt-1">
                Every bespoke web property and custom CRM deployment progresses deterministically across these six milestones.
              </p>
            </div>

            <div className="space-y-3">
              {engineeringPhases.map((phase, idx) => (
                <div
                  key={phase.id}
                  className={`p-3.5 rounded border flex items-center justify-between ${
                    phase.current
                      ? "bg-amber-950/20 border-amber-500/40"
                      : phase.done
                      ? "bg-white/[0.02] border-white/10"
                      : "opacity-40 border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        phase.done
                          ? "bg-emerald-500 text-black"
                          : phase.current
                          ? "bg-amber-500 text-black"
                          : "bg-white/10 text-zinc-400"
                      }`}
                    >
                      {phase.done ? "✓" : idx + 1}
                    </span>
                    <span className="font-semibold text-white">{phase.label}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold ${
                      phase.current
                        ? "text-amber-400 animate-pulse"
                        : phase.done
                        ? "text-emerald-400"
                        : "text-zinc-500"
                    }`}
                  >
                    {phase.current ? "CURRENT SPRINT" : phase.done ? "COMPLETED" : "UPCOMING"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "PREVIEW" && (
          <div className="p-6 rounded border border-white/10 bg-[#121214] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Live Vercel Staging Candidate Preview
                </h2>
                <p className="text-zinc-400 mt-0.5">
                  Real-time edge preview URL pushed by the Infriva Web Dev team for milestone inspection.
                </p>
              </div>

              <a
                href={deployment.preview_url}
                target="_blank"
                className="px-4 py-2 rounded bg-[#FBF8F3] hover:bg-white text-black font-bold transition-colors"
              >
                Open in Full Window ↗
              </a>
            </div>

            <div className="p-3 rounded bg-black/60 border border-white/10 flex justify-between items-center text-[11px]">
              <span>Staging Endpoint: <strong className="text-cyan-400">{deployment.preview_url}</strong></span>
              <span className="text-emerald-400">Core Web Vitals LCP: {deployment.lcp_ms}ms</span>
            </div>

            <div className="border border-white/10 rounded overflow-hidden bg-black h-96 flex items-center justify-center text-zinc-500">
              <iframe
                src={deployment.preview_url}
                title="Staging Preview"
                className="w-full h-full opacity-90"
              />
            </div>
          </div>
        )}

        {activeTab === "CALENDAR" && (
          <div className="p-6 rounded border border-white/10 bg-[#121214] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Monthly Content Calendar (48-Hour Approval Studio)
                </h2>
                <p className="text-zinc-400 mt-0.5">
                  Review planned video Reels, Carousels, and captions. Unreviewed posts auto-approve after 48h.
                </p>
              </div>

              <span className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px]">
                48h Window Active (24h 18m left)
              </span>
            </div>

            <div className="divide-y divide-white/10">
              {posts.map((p) => (
                <div key={p.id} className="py-4 space-y-2 first:pt-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{p.hook_3s_strategy}</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 text-[10px]">
                        {p.post_format}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {p.approval_status === "APPROVED" ? (
                        <span className="text-emerald-400 font-bold">✓ Approved</span>
                      ) : (
                        <button
                          onClick={() => handleApprovePost(p.id)}
                          className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-colors"
                        >
                          Approve Post
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-zinc-300">{p.caption}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "DROPZONE" && (
          <div className="p-6 rounded border border-white/10 bg-[#121214] space-y-4">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Raw Media Footage & Brand Assets Dropzone
              </h2>
              <p className="text-zinc-400 mt-0.5">
                Upload raw video B-roll, testimonials, high-resolution logos, or typography guidelines.
              </p>
            </div>

            <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center space-y-3">
              <div className="text-sm font-semibold text-white">Drag & drop raw files here or click to browse</div>
              <div className="text-[10px] text-zinc-400">Files upload directly to your tenant CLIENT_RAW cloud storage bucket.</div>
            </div>
          </div>
        )}

        {activeTab === "WARRANTY" && (
          <div className="p-6 rounded border border-white/10 bg-[#121214] space-y-5">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                90-Day Post-Launch Warranty Desk
              </h2>
              <p className="text-zinc-400 mt-0.5">
                Submit bug reports or layout adjustments. Tickets synchronize instantly to our lead developers&apos; GitHub board.
              </p>
            </div>

            <form onSubmit={handleWarrantySubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1">Issue Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Booking confirmation email delay on mobile"
                  value={warrantyTitle}
                  onChange={(e) => setWarrantyTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1">Detailed Steps & Observation</label>
                <textarea
                  rows={4}
                  placeholder="Describe where the issue occurs, browser or device used..."
                  value={warrantyDesc}
                  onChange={(e) => setWarrantyDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={ticketSubmitted}
                className="px-4 py-2 rounded bg-[#FBF8F3] hover:bg-white text-black font-bold transition-colors"
              >
                {ticketSubmitted ? "Submitting to GitHub Issues..." : "Submit Warranty Ticket"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
