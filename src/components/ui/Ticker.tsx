/**
 * @file src/components/ui/Ticker.tsx
 * @description Physics-Based Animated Number Counter
 *
 * This client component renders an animated metric counter that smoothly counts up
 * from 0 to a target value when scrolled into the viewport.
 *
 * Key Engineering Decisions:
 * 1. Motion Springs vs Linear Tweens:
 *    - Instead of standard linear interpolation or setInterval counters, this uses Motion's
 *      `useSpring` hook with physical parameters (`damping: 100, stiffness: 100, mass: 3`).
 *    - This simulates high physical inertia: the count begins fast and agonizingly eases into
 *      its final value, producing a tactile, premium editorial feel.
 * 2. Viewport Triggering:
 *    - `useInView(ref, { once: true, margin: "-50px" })` triggers the spring only when the element
 *      enters 50px into the viewport, avoiding off-screen calculation.
 * 3. Jitter Elimination via `tabular-nums`:
 *    - Uses `font-variant-numeric: tabular-nums` to ensure all numeric glyphs have equal advance width,
 *      preventing horizontal text jitter while digits rapidly change.
 * 4. Decimal vs Integer Precision:
 *    - Dynamically detects if the target number has decimals (e.g., 4.9 vs 98) and renders
 *      `toFixed(1)` or `Math.floor` accordingly.
 */

"use client";

import { useInView, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface TickerProps {
  /** The final numeric value to count up to */
  value: number;
  /** Optional string appended to the number (e.g., '+', '%', 'x') */
  suffix?: string;
}

export function Ticker({ value, suffix = "" }: TickerProps) {
  // DOM reference to the counter element
  const ref = useRef<HTMLSpanElement>(null);
  
  // Detect when the element scrolls into view (fires only once)
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  // High-mass spring configuration for dramatic deceleration
  const springValue = useSpring(0, {
    damping: 100,
    stiffness: 100,
    mass: 3,
  });

  // Local state holding the formatted string/number for rendering
  const [displayValue, setDisplayValue] = useState<number | string>(0);

  // Trigger spring animation when the component enters viewport
  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, springValue, value]);

  // Subscribe to raw spring value changes and format for presentation
  useEffect(() => {
    const hasDecimals = value % 1 !== 0;
    
    return springValue.on("change", (latest) => {
      if (hasDecimals) {
        // Format to 1 decimal place for ratings (e.g., 4.9)
        setDisplayValue(latest.toFixed(1));
      } else {
        // Round down to integers for metrics (e.g., 98, 250)
        setDisplayValue(Math.floor(latest));
      }
    });
  }, [springValue, value]);

  return (
    // tabular-nums ensures uniform digit widths to eliminate layout jitter
    <span ref={ref} className="tabular-nums">
      {displayValue}{suffix}
    </span>
  );
}
