/**
 * @file src/components/ui/Preloader.tsx
 * @description Brutalist-Luxury Entry Animation & Preloader Sequence
 *
 * This client component renders a fullscreen intro overlay on the user's initial visit.
 * It reinforces brand identity with the vertical monogram logo and establishes a calm,
 * deliberate agency rhythm before revealing the page content.
 *
 * Animation Lifecycle:
 * 1. Mounting & Scroll Locking:
 *    - Checks `isInitialLoad` from `@/lib/store`. If false (user navigated internally),
 *      the component skips rendering entirely.
 *    - If true, locks document body scrolling (`overflow = 'hidden'`) to prevent awkward partial
 *      scrolling during the intro.
 * 2. Stage 1 (0ms - 1000ms): Logo fades in and scales from 0.9 to 1.0 with luxury easing `[0.77, 0, 0.175, 1]`.
 * 3. Stage 2 (2000ms - 2500ms): Logo scales down slightly (0.95) and fades to opacity 0.
 * 4. Stage 3 (2500ms): Background curtain fades to opacity 0, pointer-events are disabled,
 *    and body scroll is restored (`overflow = ''`).
 * 5. State Commit: Calls `setInitialLoad(false)` so subsequent page visits render instantaneously.
 */

"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { LogoVertical } from "@/components/ui/LogoVertical";
import { isInitialLoad, setInitialLoad } from "@/lib/store";

export function Preloader() {
  // Track whether the preloader curtain is currently active
  const [loading, setLoading] = useState(isInitialLoad);

  useEffect(() => {
    // If not the initial page load (e.g., subsequent SPA navigation), do nothing
    if (!isInitialLoad) return;
    
    // Lock document scroll to maintain visual immersion during the introduction
    document.body.style.overflow = "hidden";

    // Set 2.5-second timer to orchestrate the transition out
    const timer = setTimeout(() => {
      setLoading(false);
      setInitialLoad(false);
      // Restore native document scrolling
      document.body.style.overflow = "";
    }, 2500);

    // Cleanup timer and restore scroll if component unmounts unexpectedly
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <motion.div
      // Fullscreen fixed container with high z-index overlaying all navigation and page content
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-50"
      initial={{ opacity: 1 }}
      // Fade out curtain when loading completes and disable hit-testing
      animate={{ opacity: loading ? 1 : 0, pointerEvents: loading ? "auto" : "none" }}
      // Luxury cubic bezier transition curve
      transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1], delay: loading ? 0 : 0.2 }}
    >
      <motion.div
        // Stage 2: Logo exit choreography starting at 2.0 seconds
        initial={{ opacity: 1 }}
        animate={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: 2, duration: 0.5, ease: [0.77, 0, 0.175, 1] }}
        className="relative flex items-center justify-center"
      >
        <motion.div
          // Stage 1: Initial entrance scale and opacity
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }}
        >
          {/* Vertical brand mark in jet black (#0A0A0B) */}
          <LogoVertical className="w-48 md:w-64 h-auto text-brand-900" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
