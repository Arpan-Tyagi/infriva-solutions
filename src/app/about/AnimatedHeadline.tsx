"use client";

import { motion, useScroll, useTransform, useReducedMotion, MotionValue } from "motion/react";
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
  /** Whether reduced motion is active */
  reduceMotion: boolean;
}

function AnimatedWord({ word, progress, start, end, reduceMotion }: AnimatedWordProps) {
  const opacity = useTransform(progress, [start, end], [reduceMotion ? 1 : 0.65, 1]);
  return <motion.span style={{ opacity }}>{word}{" "}</motion.span>;
}

export function AnimatedHeadline() {
  const targetRef = useRef<HTMLHeadingElement>(null);
  const reduceMotion = Boolean(useReducedMotion());
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end center"]
  });

  const words = "Turning business ideas into scalable digital systems.".split(" ");

  return (
    <h1 ref={targetRef} className="text-4xl sm:text-5xl md:text-7xl xl:text-8xl tracking-tight-display leading-[1.05] font-medium text-balance mt-8 flex flex-wrap gap-x-[0.25em] break-words">
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + (1 / words.length);
        return <AnimatedWord key={i} word={word} progress={scrollYProgress} start={start} end={end} reduceMotion={reduceMotion} />;
      })}
    </h1>
  );
}
