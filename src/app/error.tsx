/**
 * @file src/app/error.tsx
 * @description Global Client-Side Error Boundary (500 Internal Error)
 *
 * This Client Component catches uncaught runtime exceptions across the component tree.
 * In Next.js App Router, `error.tsx` must be a Client Component (`"use client"`).
 *
 * Resilience Mechanics:
 * 1. Exception Capture:
 *    - Receives the thrown `Error` object and optional cryptographic `digest` string from Next.js.
 *    - Logs the exception to console / APM tools via `useEffect`.
 * 2. Self-Healing Recovery (`reset`):
 *    - Next.js provides a `reset()` function prop that attempts to re-render the segment boundary
 *      without requiring a full hard browser reload.
 * 3. Fallback Navigation:
 *    - If recovery fails, offers a direct link back to `/` to restore the application shell.
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowClockwise } from "@phosphor-icons/react";

interface GlobalErrorProps {
  /** The caught JavaScript error */
  error: Error & { digest?: string };
  /** Function to attempt re-rendering the error boundary segment */
  reset: () => void;
}

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps) {
  useEffect(() => {
    // Log exception details for developer diagnostics
    console.error("Application Error Boundary caught runtime exception:", error);
  }, [error]);

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center bg-[#FBF8F3] text-[#0A0A0B] px-4 md:px-12 pt-32 pb-24">
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
        {/* Monospaced Anomaly Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 border border-red-200 mb-8">
          <span className="w-2 h-2 rounded-full bg-red-600" />
          <span className="text-[10px] tracking-widest-caps font-medium uppercase font-mono text-red-900">
            500 // Runtime Exception
          </span>
        </div>

        {/* Display Headline */}
        <h1 className="text-5xl md:text-7xl tracking-tight-display leading-[1.05] font-medium mb-6 text-balance">
          System interrupt <br />
          <span className="text-black/40">encountered.</span>
        </h1>

        {/* Technical Explanatory Note */}
        <p className="text-lg md:text-xl text-black/60 font-medium max-w-lg mb-12 text-pretty">
          An unexpected anomaly occurred during page execution. Our engineering protocols have logged this trace.
        </p>

        {/* Recovery Action Triggers */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Re-render segment trigger */}
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0A0A0B] text-[#FBF8F3] rounded-xl hover:bg-black/80 transition-colors text-sm font-medium tracking-tight cursor-pointer"
          >
            <ArrowClockwise size={16} />
            <span>Attempt Recovery</span>
          </button>
          {/* Fallback to home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-black/10 text-[#0A0A0B] rounded-xl hover:border-black/30 hover:bg-black/5 transition-all text-sm font-medium tracking-tight"
          >
            <ArrowLeft size={16} />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
