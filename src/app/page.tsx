"use client"; // Required for Framer Motion and React hooks like useRef, useState

// Import custom Reveal component for scroll-based fade-up animations.
import { Reveal } from "@/components/ui/Reveal";
// Import phosphor-icons for scalable SVG iconography.
import { ArrowUpRight, Desktop, Users, ChartLineUp, Megaphone } from "@phosphor-icons/react/dist/ssr";
// Import Framer Motion components and hooks for advanced UI animations.
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "motion/react";
// Import React hooks for managing state and DOM references.
import { useRef } from "react";
// Import Next.js optimized routing link.
import Link from "next/link";
import Image from "next/image";
import { isInitialLoad } from "@/lib/store";

// Split the main headline into individual words to enable staggering letter/word animation.
const headlineWords = "We Build Digital Systems That Generate & Convert Leads".split(" ");

// Main Home Page Component
export default function Home() {
  // Reference for the Hero section container to track scroll progress.
  const containerRef = useRef(null);
  
  // Track scroll position within the Hero container.
  // "start start" tracks when the top of the container is at the top of the viewport.
  // "end start" tracks when the bottom of the container reaches the top of the viewport.
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  
  // Parallax background transform: maps the scroll progress [0,1] to a vertical translation ["0%", "20%"]
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  
  // Reference and logic for the magnetic hover button effect
  const buttonRef = useRef<HTMLAnchorElement>(null);
  
  // Raw motion values for X and Y cursor offset tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Spring configuration defining the physics of the magnetic snap-back effect
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  
  // Wrap raw motion values in springs for fluid interpolation
  const btnX = useSpring(x, springConfig);
  const btnY = useSpring(y, springConfig);

  // Calculate mouse position relative to the button center and apply a multiplier (0.3) for the pull effect.
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!buttonRef.current) return;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    x.set((e.clientX - left - width / 2) * 0.3);
    y.set((e.clientY - top - height / 2) * 0.3);
  };
  
  // Reset coordinates to 0 when the mouse leaves the button area.
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="w-full">
      {/* 
        ========================================================================
        1. Hero Section 
        Full viewport height section with fixed/parallax background video.
        ========================================================================
      */}
      <section ref={containerRef} className="relative w-full min-h-[100svh] flex flex-col items-center justify-center pb-12 md:pb-24 px-4 md:px-12 overflow-hidden">
        
        {/* Full Screen Motion Graphics Video Background */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 w-full h-full mix-blend-multiply opacity-55 md:opacity-65 z-0 pointer-events-none transition-opacity duration-1000">
          {/* HTML5 Video configured for silent, auto-looping background playback */}
          <video 
            autoPlay 
            muted 
            playsInline 
            loop
            preload="metadata"
            poster="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23FBF8F3'/%3E%3C/svg%3E"
            className="w-full h-full object-cover bg-[#FBF8F3]"
          >
            <source src="/hero-bg-v2.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Ambient Studio Lighting Scrims - Ultra-diffused champagne illumination for crisp typographic contrast without harsh blobs */}
        <div className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_80%_65%_at_50%_48%,rgba(251,248,243,0.72)_0%,rgba(251,248,243,0.3)_45%,transparent_75%)] pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-32 z-[2] bg-gradient-to-b from-[#FBF8F3] to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-32 z-[2] bg-gradient-to-t from-[#FBF8F3] to-transparent pointer-events-none" />

        {/* Foreground Content Wrapper */}
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center mt-auto md:mt-24">
          
          {/* Small eyebrow tag with entry animation */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: isInitialLoad ? 2.0 : 0.2 }} // Delays entry to wait for preloader
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FBF8F3]/85 backdrop-blur-md border border-black/10 shadow-sm mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-brand-900" />
            <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">Vanguard Architecture</span>
          </motion.div>
          
          {/* 
            Animated HTML Headline Overlay
            Uses the mapped headlineWords array to animate each word sliding up from below an invisible clipping mask.
          */}
          <h1 className="text-[clamp(2.75rem,5.5vw+0.75rem,6.25rem)] tracking-tight-display leading-[1.0] font-medium text-balance mb-8 max-w-5xl flex flex-wrap justify-center gap-x-[0.25em] text-brand-900 drop-shadow-[0_2px_16px_rgba(251,248,243,0.95)]">
            {headlineWords.map((word, i) => (
              <span key={i} className="overflow-hidden inline-flex pb-4 -mb-4 pt-2 -mt-2">
                <motion.span
                  initial={{ y: "100%" }} // Start hidden below
                  animate={{ y: "0%" }} // Slide up into place
                  transition={{
                    type: "spring",
                    bounce: 0,
                    duration: 0.9,
                    delay: (isInitialLoad ? 2.2 : 0.4) + i * 0.04, // Stagger animation delay per word
                  }}
                  className="inline-block"
                >
                  {word}{" "}
                </motion.span>
              </span>
            ))}
          </h1>
          
          {/* Subheading wrapped in the Reveal component to fade in after the title */}
          <Reveal delay={isInitialLoad ? 2.6 : 0.4}>
            <p className="text-xl md:text-2xl leading-[1.4] text-brand-900/90 font-medium max-w-2xl text-pretty mb-10 drop-shadow-[0_1px_12px_rgba(251,248,243,0.95)]">
              Modern websites, custom CRMs, SEO, Meta Ads, WhatsApp API and automation systems for growing businesses.
            </p>
          </Reveal>
          
          {/* Call to Action Button with Magnetic Cursor Effect */}
          <Reveal delay={isInitialLoad ? 2.7 : 0.5}>
            <Link 
              href="/contact"
              ref={buttonRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="pressable group relative flex items-center justify-center gap-4 pl-8 pr-6 py-5 bg-brand-900 text-white rounded-none hover:bg-black transition-colors w-full sm:w-auto overflow-hidden shadow-2xl"
            >
              {/* Internal hover highlight overlay sliding from left to right */}
              <motion.div 
                className="absolute inset-0 bg-white/10"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
              />
              
              {/* Content layer that moves based on the magnetic spring values (btnX, btnY) */}
              <motion.div style={{ x: btnX, y: btnY }} className="flex items-center gap-4 relative z-10 pointer-events-none">
                <span className="font-medium tracking-tight">Get Free Consultation</span>
                <div className="w-8 h-8 rounded-none bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ArrowUpRight weight="light" size={16} />
                </div>
              </motion.div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 
        ========================================================================
        2. The Paradigm Shift 
        Bold, high-contrast typography section emphasizing brand philosophy.
        ========================================================================
      */}
      <section className="w-full py-24 md:py-40 bg-brand-900 text-white px-4 md:px-12 selection:bg-white selection:text-brand-900">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <h2 className="text-4xl md:text-7xl xl:text-8xl tracking-tight-display leading-none font-medium max-w-5xl">
              We do not just build websites. <br />
              <span className="text-white/40">We build business systems.</span>
            </h2>
          </Reveal>
        </div>
      </section>

      {/* 
        ========================================================================
        3. Core Expertise (Bento Grid)
        CSS Grid based layout showcasing specific service offerings.
        ========================================================================
      */}
      <section className="w-full py-24 md:py-40 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div>
                <h3 className="text-4xl md:text-5xl tracking-tight-display font-medium mb-4">Modern Tech Stack</h3>
                <p className="text-lg text-black/60 max-w-md">Scalable digital ecosystems engineered for acquisition, management, and conversion.</p>
              </div>
            </div>
          </Reveal>

          {/* 12-column grid layout defining the bento boxes across breakpoints */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-[24rem]">
            
            {/* Box 1: Web Development (Spans 8 cols on large screens) */}
            <Link href="/services/web-development" className="lg:col-span-8 block h-full">
              <Reveal className="group pressable w-full h-full bg-brand-100 rounded-none p-8 md:p-12 flex flex-col justify-between border border-black/5 relative overflow-hidden">
                  <Image src="/images/glass-panels.jpg" alt="Web Development" fill className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] z-0 mix-blend-overlay" />
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-black/5 z-10">
                    <Desktop size={24} weight="light" />
                  </div>
                  <div className="z-10">
                    <h4 className="text-2xl leading-[1.4] font-medium tracking-tight-display mb-2">Web Dev & UI/UX Design<br/><span className="text-black/40 text-xl">Digital Property</span></h4>
                    <p className="text-black/60 max-w-sm">High-performance interfaces built on React, Next.js, Node.js, and PostgreSQL.</p>
                  </div>
              </Reveal>
            </Link>
            
            {/* Box 2: Premium Content (Spans 4 cols on large screens) */}
            <Link href="/services/premium-content" className="lg:col-span-4 block h-full">
              <Reveal delay={0.1} className="group pressable w-full h-full bg-brand-100 rounded-none p-8 md:p-12 flex flex-col justify-between border border-black/5 relative overflow-hidden">
                  <Image src="/images/marketing-megaphone.jpg" alt="Premium Content" fill className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] z-0 mix-blend-overlay" />
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-black/5 z-10">
                    <Users size={24} weight="light" />
                  </div>
                  <div className="z-10">
                    <h4 className="text-2xl leading-[1.4] font-medium tracking-tight-display mb-2">Premium Content</h4>
                    <p className="text-black/60">Blog, Social & Video distribution mapped to buying intent.</p>
                  </div>
              </Reveal>
            </Link>

            {/* Box 3: SEO Services (Spans 5 cols on large screens) */}
            <Link href="/services/seo-and-geo" className="lg:col-span-5 block h-full">
              <Reveal delay={0.2} className="group pressable w-full h-full bg-brand-100 rounded-none p-8 md:p-12 flex flex-col justify-between border border-black/5 relative overflow-hidden">
                  <Image src="/images/stone-staircase.jpg" alt="Full-Stack SEO" fill className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] z-0 mix-blend-overlay" />
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-black/5 z-10">
                    <ChartLineUp size={24} weight="light" />
                  </div>
                  <div className="z-10">
                    <h4 className="text-2xl leading-[1.4] font-medium tracking-tight-display mb-2">Full-Stack SEO & GEO<br/><span className="text-black/40 text-xl">Organic Dominance</span></h4>
                    <p className="text-black/60 max-w-xs">AI Generative Engine Optimization.</p>
                  </div>
              </Reveal>
            </Link>

            {/* Box 4: Paid Ads (Spans 7 cols on large screens) */}
            <Link href="/services/paid-advertising" className="lg:col-span-7 block h-full">
              <Reveal delay={0.3} className="group pressable w-full h-full bg-brand-100 rounded-none p-8 md:p-12 flex flex-col justify-between border border-black/5 relative overflow-hidden">
                  <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:scale-[1.15] group-hover:-rotate-12 transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]">
                    <Megaphone size={280} weight="thin" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-brand-900 text-white flex items-center justify-center border border-black/5 z-10">
                    <Megaphone size={24} weight="light" />
                  </div>
                  <div className="z-10">
                    <h4 className="text-2xl leading-[1.4] font-medium tracking-tight-display mb-2">Paid Advertising Management</h4>
                    <p className="text-black/60 max-w-sm">Algorithmic bidding across Meta and Google Ads engines.</p>
                  </div>
              </Reveal>
            </Link>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        3.5 The Architecture of Advantage
        List-based benefits section outlining business value.
        ========================================================================
      */}
      <section className="w-full py-24 md:py-40 bg-brand-900 text-white px-4 md:px-12 selection:bg-white selection:text-brand-900">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <h3 className="text-4xl md:text-5xl tracking-tight-display font-medium mb-16 max-w-2xl">
              The Architecture of Advantage
            </h3>
          </Reveal>
          
          {/* CSS Grid dynamically maps the features array into a 3-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 border-t border-white/10 pt-16">
            {[
              { title: "Growth-Focused Strategy", desc: "Every system is designed with acquisition and conversion as the primary metrics." },
              { title: "Modern Tech Stack", desc: "Built on a high-performance stack using React, Next.js, Node.js, and PostgreSQL." },
              { title: "CRM-Connected Lead Flow", desc: "Direct, automated routing from frontend capture directly to your sales pipeline." },
              { title: "SEO & Marketing Ready", desc: "Optimized at the code level to dominate search and lower your CAC." },
              { title: "Custom Business Solutions", desc: "No generic templates. Bespoke architecture mapped to your operations." },
              { title: "Long-Term Support", desc: "Continuous refinement, maintenance, and strategic scaling." }
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.05}>
                {/* Map each benefit item with a subtle left border to structure the text */}
                <div className="border-l border-white/20 pl-6">
                  <h4 className="text-xl font-medium tracking-tight mb-3">{item.title}</h4>
                  <p className="text-white/50 text-sm leading-[1.4]">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        4. Workflow Timeline
        Visual sequence displaying process steps using an animated horizontal line.
        ========================================================================
      */}
      <section className="w-full py-24 md:py-40 px-4 md:px-12 border-t border-black/5">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <h3 className="text-4xl md:text-5xl tracking-tight-display font-medium mb-24">The Engineering Process</h3>
          </Reveal>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-8 relative">
            {/* Background connecting timeline track (horizontal line) */}
            <div className="hidden md:block absolute top-8 left-0 w-full h-[1px] bg-black/5" />
            
            {/* Map over the sequential steps to generate timeline nodes */}
            {['Consultation', 'Planning', 'Design', 'Development', 'Launch', 'Support'].map((step, i) => (
              <Reveal key={step} delay={i * 0.1}>
                <div className="relative pt-8 group">
                  {/* Interactive timeline indicator that fills from the left on hover (desktop only) */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-brand-900 origin-left scale-x-0 md:group-hover:scale-x-100 transition-transform duration-500" />
                  {/* Step number label (01, 02, etc.) */}
                  <div className="text-[10px] tracking-widest-caps text-black/40 mb-4">0{i + 1}</div>
                  {/* Step Title */}
                  <h4 className="text-xl font-medium tracking-tight-display">{step}</h4>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


