/**
 * @file src/components/ui/Reveal.tsx
 * @description Viewport-Triggered Scroll Reveal Wrapper
 *
 * This client component wraps any React node in an accessible, scroll-linked
 * entrance animation powered by Motion.
 *
 * Accessibility & Motion Standards:
 * 1. Reduced Motion Compliance (WCAG 2.1 AA):
 *    - Uses `useReducedMotion()` to detect whether the user has enabled "Reduce Motion" in their OS.
 *    - If enabled, skips transforms (`y: 40, scale: 0.95`) completely, rendering content immediately
 *      with standard opacity to prevent motion sickness.
 * 2. Zero-Bounce Spring Physics:
 *    - Configures a deadened spring (`bounce: 0, duration: 0.8`) for clean architectural reveal
 *      without cartoonish bounce.
 * 3. Viewport Memory:
 *    - `viewport={{ once: true }}` ensures the animation executes only once when scrolled into view,
 *      preventing elements from re-animating and flickering as the user scrolls up and down.
 */

"use client";

import { motion, useReducedMotion } from "motion/react";

interface RevealProps {
  /** The child elements to reveal */
  children: React.ReactNode;
  /** Optional delay in seconds before the animation begins */
  delay?: number;
  /** Optional CSS class names applied to the motion wrapper container */
  className?: string;
}

export function Reveal({ 
  children, 
  delay = 0, 
  className = "" 
}: RevealProps) {
  // Query browser/OS preference for prefers-reduced-motion
  const reduce = useReducedMotion();
  
  return (
    <motion.div
      className={className}
      // If reduced motion is requested by the user, bypass initial transform offsets
      initial={reduce ? false : { opacity: 0, y: 40, scale: 0.95 }}
      // Animate to standard resting position and full opacity when scrolled into view
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      // Trigger only once when first scrolled into view
      viewport={{ once: true }}
      // Zero-bounce spring creates smooth, weighted deceleration
      transition={{
        type: "spring",
        bounce: 0,
        duration: 0.8,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
