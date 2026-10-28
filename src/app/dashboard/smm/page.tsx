"use client";

import { useState } from "react";
import { MOCK_CALENDAR, MOCK_SOCIAL_POSTS, MOCK_CAMPAIGNS } from "@/lib/crm-mock-data";
import { INFRIVA_DYNAMIC_UTM_TEMPLATE } from "@/lib/meta-marketing";

export default function SmmPaidMediaBoard() {
  const [posts, setPosts] = useState(MOCK_SOCIAL_POSTS);
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null);
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [campaignLaunched, setCampaignLaunched] = useState(false);

  const handlePublishNow = (postId: string) => {
    setPublishingPostId(postId);
    setTimeout(() => {
      setPublishingPostId(null);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, ig_published_media_id: `ig_${Date.now()}` }
            : p
        )
      );
      alert("Instagram Graph API 3-Step Async Container Publisher completed! (Child status verified FINISHED -> Parent container published with zero Error 9007 exceptions).");
    }, 3000);
  };

  const handleBoostEvergreen = () => {
    setCampaignLaunched(true);
    setTimeout(() => {
      setBoostModalOpen(false);
      setCampaignLaunched(false);
      alert("Meta Marketing API v22/23 Campaign Launched! ODAX: OUTCOME_LEADS, Advantage+ Audience, Dynamic UTMs injected.");
    }, 2000);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#FBF8F3]">
            SMM & Paid Media Blueprint Board (/dashboard/smm)
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            20th-of-month planning SLA, 48-hour client approval gate, Instagram 3-step async publisher, and Meta ODAX campaign launcher.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setBoostModalOpen(true)}
            className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
          >
            + Launch Meta ODAX Campaign
          </button>
        </div>
      </div>

      {/* SLA & Approval State Machine Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 20th-of-Month Planning SLA */}
        <div className="p-4 rounded border border-white/10 bg-[#121214] space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider">20th Planning SLA</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
              ✓ SLA MET
            </span>
          </div>
          <div className="text-base font-bold text-white">November Blueprint Submitted</div>
          <p className="text-[10px] text-zinc-500">
            Submitted on Oct 19 (1 day before 20th deadline). 12 Reels + 1 Long-Form script approved.
          </p>
        </div>

        {/* 48-Hour Client Approval Window */}
        <div className="p-4 rounded border border-white/10 bg-[#121214] space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider">Client Approval Window</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
              24h 18m Left
            </span>
          </div>
          <div className="text-base font-bold text-white">48-Hour Review Cadence</div>
          <p className="text-[10px] text-zinc-500">
            Unreviewed items auto-transition to AUTO_APPROVED when countdown expires per SLA contract.
          </p>
        </div>

        {/* Evergreen Retention Detector */}
        <div className="p-4 rounded border border-white/10 bg-[#121214] space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider">Evergreen Paid Booster</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
              1 Winner Flagged
            </span>
          </div>
          <div className="text-base font-bold text-emerald-400">46.8% 3s Hook Retention</div>
          <p className="text-[10px] text-zinc-500">
            Reel #1 exceeded 40% benchmark. One-click Meta Advantage+ boost unlocked.
          </p>
        </div>
      </div>

      {/* Content Calendar Execution Matrix */}
      <div className="p-5 rounded border border-white/10 bg-[#121214] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Monthly Scheduled Posts & 3-Step Instagram Container Publisher
          </h2>
          <span className="text-zinc-400 text-[10px]">The Kesari Bagh Account</span>
        </div>

        <div className="divide-y divide-white/5">
          {posts.map((post) => (
            <div key={post.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-xs">{post.hook_3s_strategy}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-zinc-300">
                    {post.post_format}
                  </span>
                  {post.is_evergreen_winner && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      ⭐ Evergreen Winner ({String(post.metrics_snapshot.hook_3s_retention_pct)}%)
                    </span>
                  )}
                </div>

                <p className="text-zinc-400 text-[11px] line-clamp-1">{post.caption}</p>

                <div className="text-[10px] text-zinc-500 flex items-center gap-3">
                  <span>Scheduled: {new Date(post.scheduled_publish_at || '').toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                  <span>Approval: <strong className={post.approval_status === 'APPROVED' ? 'text-emerald-400' : 'text-amber-400'}>{post.approval_status}</strong></span>
                  {post.ig_published_media_id && (
                    <span className="text-cyan-400">Live on IG: {post.ig_published_media_id}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {post.is_evergreen_winner && (
                  <button
                    onClick={() => setBoostModalOpen(true)}
                    className="px-3 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold"
                  >
                    Boost with Meta Ads →
                  </button>
                )}

                <button
                  onClick={() => handlePublishNow(post.id)}
                  disabled={publishingPostId === post.id || Boolean(post.ig_published_media_id)}
                  className={`px-3 py-1.5 rounded font-semibold transition-colors ${
                    post.ig_published_media_id
                      ? "bg-white/5 text-zinc-500 cursor-default"
                      : "bg-[#FBF8F3] hover:bg-white text-black"
                  }`}
                >
                  {publishingPostId === post.id
                    ? "Polling Container..."
                    : post.ig_published_media_id
                    ? "✓ Published Live"
                    : "Execute 3-Step Publish"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meta ODAX Campaign Launcher Modal */}
      {boostModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg border border-white/15 bg-[#121214] p-6 space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Meta Marketing API v22/23 Campaign Launcher</h3>
              <button onClick={() => setBoostModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-zinc-300">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Campaign Objective (ODAX Enforced)</label>
                <select className="w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs">
                  <option value="OUTCOME_LEADS">OUTCOME_LEADS (Advantage+ Lead Generation)</option>
                  <option value="OUTCOME_TRAFFIC">OUTCOME_TRAFFIC (Direct Landing Page)</option>
                  <option value="OUTCOME_SALES">OUTCOME_SALES (Direct Booking Engine)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Budget Optimization Mode (CBO vs ABO)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-white/10 border border-white/20 text-white font-semibold text-center cursor-pointer">
                    CBO (Campaign Level)
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/10 text-zinc-400 text-center cursor-pointer">
                    ABO (Ad Set Level)
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Daily Budget (INR)</label>
                <input
                  type="text"
                  defaultValue="₹3,000 / day"
                  className="w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Standardized Dynamic UTM Tag Injection</label>
                <div className="p-2 rounded bg-black/50 border border-white/10 text-[10px] text-zinc-400 break-all">
                  {INFRIVA_DYNAMIC_UTM_TEMPLATE}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setBoostModalOpen(false)}
                className="px-3 py-1.5 rounded bg-white/10 text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleBoostEvergreen}
                disabled={campaignLaunched}
                className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
              >
                {campaignLaunched ? "Submitting to Graph API..." : "Confirm & Launch Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
