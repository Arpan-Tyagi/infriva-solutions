"use client";

import { motion, useScroll, useTransform, MotionValue } from "motion/react";
import { useRef } from "react";

interface AnimatedWordProps {
  /** The word text to render */
  word: string;
  /** MotionValue tracking overall container scroll progress from 0 to 1 */
  progress: MotionValue<number>;
  /** Scroll progress point where this word begins fading in */
  start: number;
  /** Scroll progress point where this word reaches full opacity */
  end: number;
}

/**
 * Renders an individual word whose opacity is tied to the parent section's scroll progress.
 */
function AnimatedWord({ word, progress, start, end }: AnimatedWordProps) {
  // Map progress slice to opacity transition: 0.1 (subtle shadow) to 1.0 (crisp black)
  const opacity = useTransform(progress, [start, end], [0.1, 1]);
  return <motion.span style={{ opacity }}>{word}{" "}</motion.span>;
}

export function AnimatedHeadline() {
  // Reference for the headline container to anchor scroll progress calculation
  const targetRef = useRef<HTMLHeadingElement>(null);
  
  // Track scroll position of headline: starts when top hits viewport bottom, finishes at viewport center
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end center"]
  });

  // Split agency manifesto into individual words for scrubbed reveal
  const words = "Turning business ideas into scalable digital systems.".split(" ");

  return (
    <h1 ref={targetRef} className="text-4xl sm:text-5xl md:text-7xl xl:text-8xl tracking-tight-display leading-[1.05] font-medium text-balance mt-8 flex flex-wrap gap-x-[0.25em] break-words">
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + (1 / words.length);
        return <AnimatedWord key={i} word={word} progress={scrollYProgress} start={start} end={end} />;
      })}
    </h1>
  );
}
