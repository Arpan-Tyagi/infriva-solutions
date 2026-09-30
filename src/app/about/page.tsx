"use client"; // Marks this as a Client Component, allowing React hooks and Framer Motion

import { Reveal } from "@/components/ui/Reveal"; // Custom component for scroll-based fade-up animations
import { CheckCircle } from "@phosphor-icons/react/dist/ssr"; // Scalable SVG icons from Phosphor
import { motion, useScroll, useTransform, MotionValue } from "motion/react"; // Framer Motion hooks and components
import { useRef } from "react";
import Image from "next/image"; // React hook for creating DOM references

// Helper component to animate individual words based on scroll progress
function AnimatedWord({ word, progress, start, end }: { word: string, progress: MotionValue<number>, start: number, end: number }) {
  // useTransform maps the scroll progress range [start, end] to an opacity range [0.1, 1]
  const opacity = useTransform(progress, [start, end], [0.1, 1]);
  return <motion.span style={{ opacity }}>{word}{" "}</motion.span>;
}

export default function About() {
  // targetRef tracks the main headline container to calculate scroll progress
  const targetRef = useRef<HTMLHeadingElement>(null);
  
  // useScroll tracks scroll progress specifically for the targetRef element.
  // "start end" = track when top of element hits bottom of viewport.
  // "end center" = stop tracking when bottom of element hits center of viewport.
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end center"]
  });

  // The text to be animated word-by-word
  const words = "Turning business ideas into scalable digital systems.".split(" ");

  return (
    // Outer shell providing vertical padding and horizontal bounds
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      {/* 2-column grid layout for desktop, single column on mobile */}
      
      {/* Massive Hero Image */}
      <Reveal delay={0.1} className="w-full max-w-7xl mx-auto h-[50vh] md:h-[70vh] relative mb-24 overflow-hidden bg-brand-100">
        <Image src="/images/minimalist-office.jpg" alt="Infriva Office Architecture" fill className="object-cover" />
      </Reveal>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        
        {/* Left Column: Mission Statement */}
        <div className="lg:pr-12">
          {/* Eyebrow tag with fade-in animation */}
          <Reveal className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-900" />
            <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">The Growth Partner</span>
          </Reveal>
          
          {/* Headline block mapped to individual AnimatedWord components */}
          <h1 ref={targetRef} className="text-4xl sm:text-5xl md:text-7xl xl:text-8xl tracking-tight-display leading-[1.05] font-medium text-balance mt-8 flex flex-wrap gap-x-[0.25em] break-words">
            {words.map((word, i) => {
              // Calculate the fractional start and end points for this word's opacity animation
              const start = i / words.length;
              const end = start + (1 / words.length);
              return <AnimatedWord key={i} word={word} progress={scrollYProgress} start={start} end={end} />;
            })}
          </h1>
        </div>

        {/* Right Column: The Infriva Advantage */}
        <div className="flex flex-col justify-center">
          {/* Introductory text block with slight animation delay */}
          <Reveal delay={0.2}>
            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mb-8">The Infriva Advantage</h2>
            <p className="text-lg text-black/60 mb-12 text-pretty">
              We transition brands from manual enquiries to structured digital lead management, offering 360° IT solutions that scale.
            </p>
          </Reveal>

          {/* List of advantages dynamically rendered from an array */}
          <div className="flex flex-col gap-6">
            {[
              { title: "Traffic Generation", desc: "Visitor comes through website, SEO, or targeted ads." },
              { title: "Lead Capture", desc: "Enquiry form captures lead details with frictionless UI." },
              { title: "Automated Routing", desc: "Lead enters CRM for tracking and automated assignment." },
              { title: "Accelerated Conversion", desc: "Team follows up instantly and converts faster." }
            ].map((item, i) => (
              // Staggered reveal for each list item
              <Reveal key={i} delay={0.3 + i * 0.1} className="flex gap-4 p-6 bg-brand-50 rounded-2xl border border-black/5 hover:border-black/20 transition-colors">
                  {/* Item Icon */}
                  <div className="mt-1"><CheckCircle size={24} className="text-brand-900" weight="light" /></div>
                  {/* Item Content */}
                  <div>
                    <h3 className="font-medium tracking-tight mb-1">{item.title}</h3>
                    <p className="text-black/60 text-sm leading-[1.4]">{item.desc}</p>
                  </div>
              </Reveal>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
