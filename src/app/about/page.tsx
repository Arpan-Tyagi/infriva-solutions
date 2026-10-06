/**
 * @file src/app/about/page.tsx
 * @description Agency Philosophy & Growth Partner Manifesto
 *
 * This client component renders Infriva Solutions' brand mission, studio philosophy,
 * and operational growth framework.
 *
 * Motion Physics & Accessibility:
 * 1. Scroll-Driven Word Scrubbing:
 *    - Uses Framer Motion's `useScroll` with `offset: ["start end", "end center"]` to track
 *      the headline container's entrance into the viewport.
 *    - Computes fractional progress slices for each word (`i / words.length` to `(i + 1) / words.length`).
 *    - Words scrub smoothly from muted opacity (0.1) to full prominence (1.0) as the user scrolls down.
 * 2. Screen Reader Compatibility:
 *    - Appends explicit whitespace (`{" "}`) after each animated word span, preventing screen readers
 *      from erroneously concatenating distinct words together.
 * 3. Semantic Heading Hierarchy:
 *    - Wraps the headline in `<h1 ref={targetRef}>` for proper document outline structure.
 */

import { Reveal } from "@/components/ui/Reveal";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { AnimatedHeadline } from "./AnimatedHeadline";

export default function About() {
  return (
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      {/* Studio Architecture Photography Banner */}
      <Reveal delay={0.1} className="w-full max-w-7xl mx-auto h-[50vh] md:h-[70vh] relative mb-24 overflow-hidden bg-brand-100">
        <Image 
          src="/images/minimalist-office.jpg" 
          alt="Infriva Office Architecture" 
          fill 
          className="object-cover" 
          priority
        />
      </Reveal>

      {/* Main 2-Column Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        
        {/* Left Column: Manifesto & Scroll-Scrubbed Headline */}
        <div className="lg:pr-12">
          {/* Eyebrow Badge */}
          <Reveal className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-900" />
            <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">The Growth Partner</span>
          </Reveal>
          
          {/* Scrubbed Headline: Words illuminate sequentially as user scrolls */}
          <AnimatedHeadline />
        </div>

        {/* Right Column: The Infriva Advantage & Operational Pipeline */}
        <div className="flex flex-col justify-center">
          <Reveal delay={0.2}>
            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mb-8">The Infriva Advantage</h2>
            <p className="text-lg text-black/60 mb-12 text-pretty">
              We transition brands from manual enquiries to structured digital lead management, offering 360° IT solutions that scale.
            </p>
          </Reveal>

          {/* 4-Step Lead Conversion Lifecycle */}
          <div className="flex flex-col gap-6">
            {[
              { title: "Traffic Generation", desc: "Visitor comes through website, SEO, or targeted ads." },
              { title: "Lead Capture", desc: "Enquiry form captures lead details with frictionless UI." },
              { title: "Automated Routing", desc: "Lead enters CRM for tracking and automated assignment." },
              { title: "Accelerated Conversion", desc: "Team follows up instantly and converts faster." }
            ].map((item, i) => (
              <Reveal key={i} delay={0.3 + i * 0.1} className="flex gap-4 p-6 bg-brand-50 rounded-2xl border border-black/5 hover:border-black/20 transition-colors">
                <div className="mt-1">
                  <CheckCircle size={24} className="text-brand-900" weight="light" />
                </div>
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
