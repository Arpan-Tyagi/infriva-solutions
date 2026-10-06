import { Reveal } from "@/components/ui/Reveal";
import { Desktop, Users, ChartLineUp, Megaphone } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Image from "next/image";
import { Hero } from "./Hero";

// Main Home Page Component
export default function Home() {
  return (
    <div className="w-full">
      {/* 
        ========================================================================
        1. Hero Section 
        Full viewport height section with fixed/parallax background video.
        ========================================================================
      */}
      <Hero />

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
            <h3 className="text-4xl md:text-5xl tracking-tight-display font-medium mb-20">The Engineering Process</h3>
          </Reveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {[
              {
                title: 'Consultation',
                description: 'Deep dive into your current operations, tech stack, and growth bottlenecks. We identify exactly where a digital system can automate workflows and drive revenue.'
              },
              {
                title: 'Planning',
                description: 'Mapping out the data flow, CRM integrations, and tech stack. This blueprint ensures your website, marketing channels, and sales pipelines work as a unified engine.'
              },
              {
                title: 'Design',
                description: 'Crafting high-conversion, premium interfaces that build immediate trust. We design for the end-user while maintaining a strong, authoritative brand presence.'
              },
              {
                title: 'Development',
                description: 'Building the core infrastructure. Custom React frontends, robust backends, and seamless API connections to tools like WhatsApp, Meta, and your CRM.'
              },
              {
                title: 'Launch',
                description: 'Rigorous pre-launch stress testing across all devices. We ensure flawless performance, technical SEO readiness, and a seamless, zero-downtime deployment.'
              },
              {
                title: 'Support',
                description: 'Post-launch scale and optimization. We monitor system health, manage updates, and iteratively improve conversion rates based on real user data.'
              }
            ].map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1}>
                <div className="relative pt-8 group border-t border-black/10 hover:border-transparent transition-colors">
                  {/* Interactive timeline indicator that fills from the left on hover */}
                  <div className="absolute top-[-1px] left-0 w-full h-[2px] bg-brand-900 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]" />
                  {/* Step number label (01, 02, etc.) */}
                  <div className="text-[10px] tracking-widest-caps text-black/40 mb-4 group-hover:text-brand-900 transition-colors duration-300">0{i + 1}</div>
                  {/* Step Title */}
                  <h4 className="text-xl font-medium tracking-tight-display mb-3 group-hover:translate-x-1 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]">{step.title}</h4>
                  {/* Step Description */}
                  <p className="text-sm text-black/60 leading-relaxed group-hover:text-black/80 transition-colors duration-300">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


