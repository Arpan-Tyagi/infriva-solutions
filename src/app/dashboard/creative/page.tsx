"use client";

import { useState } from "react";
import { validateImageSpecs, validateVideoSpecs, MediaValidationResult } from "@/lib/ffmpeg-validator";

export default function CreativeStudio() {
  const [validationResult, setValidationResult] = useState<MediaValidationResult | null>({
    passed: true,
    fileType: "VIDEO",
    specs: {
      width: 1080,
      height: 1920,
      aspectRatio: 0.5625,
      aspectRatioLabel: "9:16 (Vertical Reel)",
      fps: 30,
      durationSec: 28,
      videoCodec: "H.264 (avc1)",
      audioCodec: "AAC",
      audioSampleRate: 44100,
      moovAtFront: true,
    },
    errors: [],
  });

  const [activeTab, setActiveTab] = useState<"MEDIA_CHECK" | "FIGMA_HANDOFF" | "CLIENT_RAW">("MEDIA_CHECK");

  const runTestValidation = (type: "VALID_REEL" | "INVALID_ASPECT" | "BAD_CODEC") => {
    if (type === "VALID_REEL") {
      setValidationResult(
        validateVideoSpecs({
          width: 1080,
          height: 1920,
          fps: 30,
          durationSec: 42,
          videoCodec: "h264",
          audioCodec: "aac",
          audioSampleRate: 48000,
          moovAtFront: true,
        })
      );
    } else if (type === "INVALID_ASPECT") {
      setValidationResult(validateImageSpecs(2400, 1000)); // 2.4:1 exceeds 1.91:1 limit
    } else if (type === "BAD_CODEC") {
      setValidationResult(
        validateVideoSpecs({
          width: 1920,
          height: 1080,
          fps: 120, // exceeds 60 FPS
          durationSec: 15,
          videoCodec: "prores", // not H.264/HEVC
          audioCodec: "mp3",
          audioSampleRate: 96000,
          moovAtFront: false,
        })
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-[#FBF8F3]">
            Creative Studio & Media Pipeline (/dashboard/creative)
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Graphic Designers & Video Editors workspace: client asset ingestion, FFmpeg binary validation, and Figma UI handoff.
          </p>
        </div>

        <div className="flex gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab("MEDIA_CHECK")}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === "MEDIA_CHECK" ? "bg-[#FBF8F3] text-black font-semibold" : "bg-white/10 text-zinc-300"
            }`}
          >
            FFmpeg Binary Inspector
          </button>
          <button
            onClick={() => setActiveTab("FIGMA_HANDOFF")}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === "FIGMA_HANDOFF" ? "bg-[#FBF8F3] text-black font-semibold" : "bg-white/10 text-zinc-300"
            }`}
          >
            Figma UI Systems
          </button>
          <button
            onClick={() => setActiveTab("CLIENT_RAW")}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === "CLIENT_RAW" ? "bg-[#FBF8F3] text-black font-semibold" : "bg-white/10 text-zinc-300"
            }`}
          >
            Client Raw Dropzone
          </button>
        </div>
      </div>

      {activeTab === "MEDIA_CHECK" && (
        <div className="space-y-6">
          {/* FFmpeg Inspection Panel */}
          <div className="p-5 rounded border border-white/10 bg-[#121214] space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Pre-Upload FFmpeg Media Specification Validator</span>
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    Instagram Container Spec Gate
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Pre-flight check preventing Instagram Graph API Error 9007 and server-side container encoding failures.
                </p>
              </div>

              {/* Simulation test triggers */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500">Test Preset:</span>
                <button
                  onClick={() => runTestValidation("VALID_REEL")}
                  className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs"
                >
                  Pass 9:16 Reel
                </button>
                <button
                  onClick={() => runTestValidation("INVALID_ASPECT")}
                  className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs"
                >
                  Fail Aspect (2.4:1)
                </button>
                <button
                  onClick={() => runTestValidation("BAD_CODEC")}
                  className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs"
                >
                  Fail Codec & Moov
                </button>
              </div>
            </div>

            {/* Validation Output Diagnostic Card */}
            {validationResult && (
              <div
                className={`p-4 rounded border ${
                  validationResult.passed
                    ? "bg-emerald-950/20 border-emerald-500/30"
                    : "bg-rose-950/20 border-rose-500/30"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      Validation Status: {validationResult.passed ? "✓ READY FOR IG CONTAINER" : "✗ REJECTED BY SPECS"}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                      {validationResult.fileType}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400">
                    Checked in 14ms
                  </span>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mt-3">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">DIMENSIONS & ASPECT</span>
                    <span className="text-white font-semibold">
                      {validationResult.specs.width}x{validationResult.specs.height} ({validationResult.specs.aspectRatioLabel})
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block text-[10px]">VIDEO CODEC & FPS</span>
                    <span className="text-white font-semibold">
                      {validationResult.specs.videoCodec || "N/A"} @ {validationResult.specs.fps || 0} FPS
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block text-[10px]">AUDIO SPECIFICATION</span>
                    <span className="text-white font-semibold">
                      {validationResult.specs.audioCodec || "N/A"} ({validationResult.specs.audioSampleRate ? `${validationResult.specs.audioSampleRate}Hz` : "Muted"})
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block text-[10px]">FASTSTART (MOOV AT FRONT)</span>
                    <span className={validationResult.specs.moovAtFront ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                      {validationResult.specs.moovAtFront ? "✓ Verified" : "✗ Missing (Will Fail)"}
                    </span>
                  </div>
                </div>

                {/* Errors list if any */}
                {validationResult.errors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-rose-500/20 space-y-1">
                    <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wide">
                      Diagnostic Errors ({validationResult.errors.length}):
                    </span>
                    {validationResult.errors.map((err, i) => (
                      <div key={i} className="text-xs text-rose-300 flex items-center gap-1.5">
                        <span>•</span>
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Media Asset Production Queue */}
          <div className="p-5 rounded border border-white/10 bg-[#121214] space-y-4 font-mono">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Asset Queue: 3 Weekly Reels & Monthly Long-Form (The Kesari Bagh)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex justify-between text-zinc-400">
                  <span className="text-white font-semibold">Reel #1: Courtyard Acoustics</span>
                  <span className="text-emerald-400">ig_ready = true</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Cut: 28s | 1080x1920 (9:16) | H.264 + AAC 48k. Moov faststart verified.
                </p>
                <div className="text-[10px] text-zinc-500">Scheduled for Nov 3 via SMM Board</div>
              </div>

              <div className="p-3.5 rounded bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex justify-between text-zinc-400">
                  <span className="text-white font-semibold">Carousel: 5 Archway Secrets</span>
                  <span className="text-emerald-400">ig_ready = true</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  5 Slides | 1080x1350 (4:5 portrait) | JPEG sRGB 100%.
                </p>
                <div className="text-[10px] text-zinc-500">Approved by Client (48h window met)</div>
              </div>

              <div className="p-3.5 rounded bg-white/[0.02] border border-white/5 space-y-2 opacity-60">
                <div className="flex justify-between text-zinc-400">
                  <span className="text-white font-semibold">Reel #2: Royal Dining Feast</span>
                  <span className="text-amber-400">In Edit (Cut 2)</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Awaiting audio mix and final color grade.
                </p>
                <div className="text-[10px] text-zinc-500">Due Nov 10</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "FIGMA_HANDOFF" && (
        <div className="p-5 rounded border border-white/10 bg-[#121214] space-y-4 font-mono text-xs">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            UI/UX Design Systems & Handoff to Coding Team (Stage 03 → Stage 04)
          </h2>
          <div className="p-4 rounded bg-white/[0.02] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">FlyingLyte Multi-Airline Flight Matrix</div>
                <div className="text-zinc-400 text-[11px]">Design System v2.4 (Figma Tokens + React 19 Components)</div>
              </div>
              <a
                href="https://figma.com/@infrivasolutions"
                target="_blank"
                className="px-3 py-1 rounded bg-white/10 hover:bg-white/15 text-zinc-200"
              >
                Open Figma File ↗
              </a>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Includes 8-point base grids, double-bezel card geometry, Champagne Beige / Jet Black color palette, and bespoke cubic-bezier motion specifications.
            </p>
          </div>
        </div>
      )}

      {activeTab === "CLIENT_RAW" && (
        <div className="p-5 rounded border border-white/10 bg-[#121214] space-y-4 font-mono text-xs">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Client Raw Footage Dropzone (CLIENT_RAW Bucket)
          </h2>
          <div className="border-2 border-dashed border-white/15 rounded-lg p-8 text-center space-y-2">
            <div className="text-zinc-400">Drag & drop raw 4K footage, B-roll, or brand guidelines here</div>
            <div className="text-[10px] text-zinc-500">Supports ProRes, MP4, MOV up to 5 GB. Automatically routes to editors.</div>
          </div>
        </div>
      )}
    </div>
  );
}
