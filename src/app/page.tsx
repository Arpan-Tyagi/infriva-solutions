import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { Desktop, Users, ChartLineUp, Megaphone, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Image from "next/image";
import { Hero } from "./Hero";
import { AGENCY_NAP, SITE_URL } from "@/lib/site";
import { PROJECTS_LIST } from "@/lib/projects";

export const metadata: Metadata = {
  title: {
    absolute: "Infriva Solutions | B2B Web Engineering, Custom CRM & SEO/GEO Systems [2026]",
  },
  description: AGENCY_NAP.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Infriva Solutions | B2B Digital Systems, Custom CRM & SEO/GEO Engineering",
    description: AGENCY_NAP.description,
    url: SITE_URL,
    type: "website",
    images: [
      {
        url: "/images/glass-panels.jpg",
        width: 1200,
        height: 630,
        alt: "Infriva Solutions — B2B Digital Systems & Revenue Architecture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infriva Solutions | B2B Digital Systems, Custom CRM & SEO/GEO Engineering",
    description: AGENCY_NAP.description,
    images: ["/images/glass-panels.jpg"],
  },
};

export default function Home() {
  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. The Paradigm Shift */}
      <section className="w-full py-24 md:py-40 bg-brand-900 text-white px-4 md:px-12 selection:bg-white selection:text-brand-900">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <h2 className="text-4xl md:text-7xl xl:text-8xl tracking-tight-display leading-none font-medium max-w-5xl mb-10">
              We do not just build websites. <br />
              <span className="text-white/40">We build business systems.</span>
            </h2>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl leading-relaxed">
              Modern B2B and growth-stage organizations lose compounding revenue when their web properties, search engines, paid media channels, and sales pipelines operate in disconnected silos. At Infriva Solutions, we unify Next.js 16 edge web architecture, PostgreSQL CRM automation, full-stack SEO &amp; Generative Engine Optimization (GEO), algorithmic ad buying, and WhatsApp Cloud API retention into a single revenue engine.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. Core Expertise (Bento Grid + Full 7-Capability Index) */}
      <section className="w-full py-24 md:py-40 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div>
                <h2 className="text-4xl md:text-5xl tracking-tight-display font-medium mb-4">Modern Tech Stack</h2>
                <p className="text-lg text-black/60 max-w-xl">
                  Scalable digital ecosystems engineered for high-intent customer acquisition, deterministic lead routing, and compounding conversion rates.
                </p>
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-900 hover:opacity-70 transition-opacity"
              >
                <span>Explore All 7 Capabilities</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </Reveal>

          {/* 12-column Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-[24rem]">
            {/* Box 1: Web Development */}
            <Link href="/services/web-development" className="lg:col-span-8 block h-full">
              <Reveal className="group pressable w-full h-full bg-brand-100 rounded-none p-8 md:p-12 flex flex-col justify-between border border-black/5 relative overflow-hidden">
                <Image
                  src="/images/glass-panels.jpg"
                  alt="Next.js & React B2B Web Development Architecture"
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] z-0 mix-blend-overlay"
                />
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-black/5 z-10">
                  <Desktop size={24} weight="light" />
                </div>
                <div className="z-10">
                  <h3 className="text-2xl leading-[1.4] font-medium tracking-tight-display mb-2">
                    Web Dev &amp; UI/UX Design
                    <br />
                    <span className="text-black/40 text-xl">Digital Property</span>
                  </h3>
                  <p className="text-black/60 max-w-md">
                    High-performance digital properties engineered on React 19, Next.js App Router, Node.js, and PostgreSQL with sub-1.5s LCP and direct CRM telemetry.
                  </p>
                </div>
              </Reveal>
            </Link>

            {/* Box 2: Premium Content */}
            <Link href="/services/premium-content" className="lg:col-span-4 block h-full">
              <Reveal delay={0.1} className="group pressable w-full h-full bg-brand-100 rounded-none p-8 md:p-12 flex flex-col justify-between border border-black/5 relative overflow-hidden">
                <Image
                  src="/images/marketing-megaphone.jpg"
                  alt="B2B Editorial Content & Video Production"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] z-0 mix-blend-overlay"
                />
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-black/5 z-10">
                  <Users size={24} weight="light" />
                </div>
                <div className="z-10">
                  <h3 className="text-2xl leading-[1.4] font-medium tracking-tight-display mb-2">Premium Content</h3>
                  <p className="text-black/60">
                    Long-form editorial articles, executive social narratives, and short-form video assets mapped directly to B2B buying intent.
                  </p>
                </div>
              </Reveal>
            </Link>

            {/* Box 3: SEO & GEO Services */}
            <Link href="/services/seo-and-geo" className="lg:col-span-5 block h-full">
              <Reveal delay={0.2} className="group pressable w-full h-full bg-brand-100 rounded-none p-8 md:p-12 flex flex-col justify-between border border-black/5 relative overflow-hidden">
                <Image
                  src="/images/stone-staircase.jpg"
                  alt="Full-Stack Technical SEO and Generative Engine Optimization"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] z-0 mix-blend-overlay"
                />
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-black/5 z-10">
                  <ChartLineUp size={24} weight="light" />
                </div>
                <div className="z-10">
                  <h3 className="text-2xl leading-[1.4] font-medium tracking-tight-display mb-2">
                    Full-Stack SEO &amp; GEO
                    <br />
                    <span className="text-black/40 text-xl">Organic Dominance</span>
                  </h3>
                  <p className="text-black/60 max-w-xs">
                    Technical SEO, Schema.org entity graphs, and AI Generative Engine Optimization for Google AI Overviews, ChatGPT, and Perplexity.
                  </p>
                </div>
              </Reveal>
            </Link>

            {/* Box 4: Paid Ads */}
            <Link href="/services/paid-advertising" className="lg:col-span-7 block h-full">
              <Reveal delay={0.3} className="group pressable w-full h-full bg-brand-100 rounded-none p-8 md:p-12 flex flex-col justify-between border border-black/5 relative overflow-hidden">
                <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:scale-[1.15] group-hover:-rotate-12 transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]">
                  <Megaphone size={280} weight="thin" />
                </div>
                <div className="w-12 h-12 rounded-full bg-brand-900 text-white flex items-center justify-center border border-black/5 z-10">
                  <Megaphone size={24} weight="light" />
                </div>
                <div className="z-10">
                  <h3 className="text-2xl leading-[1.4] font-medium tracking-tight-display mb-2">Paid Advertising Management</h3>
                  <p className="text-black/60 max-w-md">
                    Algorithmic media buying across Meta Advantage+ and Google Search with server-side Conversions API (CAPI) and CRM offline attribution.
                  </p>
                </div>
              </Reveal>
            </Link>
          </div>

          {/* Secondary Row: CRM Systems, Retention Marketing, Social Media Management */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Link href="/services/crm-systems" className="block group">
              <Reveal className="h-full p-8 bg-brand-50 border border-black/5 hover:border-black/20 transition-colors flex flex-col justify-between">
                <div>
                  <div className="text-[10px] tracking-widest-caps text-black/40 mb-3">Pipeline Infrastructure</div>
                  <h3 className="text-xl font-medium tracking-tight-display mb-2 group-hover:underline">Custom CRM Systems</h3>
                  <p className="text-sm text-black/60 leading-relaxed mb-6">
                    Bespoke PostgreSQL &amp; Supabase CRM systems with sub-second lead routing, SLA timers, and real-time revenue attribution dashboards.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-900">
                  View CRM Spec Sheet <ArrowUpRight size={14} />
                </span>
              </Reveal>
            </Link>

            <Link href="/services/retention-marketing" className="block group">
              <Reveal delay={0.05} className="h-full p-8 bg-brand-50 border border-black/5 hover:border-black/20 transition-colors flex flex-col justify-between">
                <div>
                  <div className="text-[10px] tracking-widest-caps text-black/40 mb-3">Lifecycle Automation</div>
                  <h3 className="text-xl font-medium tracking-tight-display mb-2 group-hover:underline">Retention Marketing</h3>
                  <p className="text-sm text-black/60 leading-relaxed mb-6">
                    WhatsApp Cloud API automation, abandoned cart recovery, and event-driven win-back sequences that compound Customer Lifetime Value (LTV).
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-900">
                  View Retention Spec Sheet <ArrowUpRight size={14} />
                </span>
              </Reveal>
            </Link>

            <Link href="/services/social-media-management" className="block group">
              <Reveal delay={0.1} className="h-full p-8 bg-brand-50 border border-black/5 hover:border-black/20 transition-colors flex flex-col justify-between">
                <div>
                  <div className="text-[10px] tracking-widest-caps text-black/40 mb-3">Brand Distribution</div>
                  <h3 className="text-xl font-medium tracking-tight-display mb-2 group-hover:underline">Social Media Management</h3>
                  <p className="text-sm text-black/60 leading-relaxed mb-6">
                    Human-curated static carousels, short-form reels, and LinkedIn executive distribution engineered for consistent algorithmic reach.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-900">
                  View Social Spec Sheet <ArrowUpRight size={14} />
                </span>
              </Reveal>
            </Link>
          </div>
        </div>
      </section>

      {/* 3.5 The Architecture of Advantage */}
      <section className="w-full py-24 md:py-40 bg-brand-900 text-white px-4 md:px-12 selection:bg-white selection:text-brand-900">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <h2 className="text-4xl md:text-5xl tracking-tight-display font-medium mb-16 max-w-2xl">
              The Architecture of Advantage
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 border-t border-white/10 pt-16">
            {[
              { title: "Growth-Focused Strategy", desc: "Every system is architected with qualified pipeline velocity, conversion rate, and CAC payback as primary engineering metrics." },
              { title: "Modern Tech Stack", desc: "Built on a resilient edge stack using React 19, Next.js App Router, Node.js, TypeScript, and PostgreSQL with Row-Level Security." },
              { title: "CRM-Connected Lead Flow", desc: "Zero-latency automated routing from frontend capture and Meta/WhatsApp webhooks directly into your sales team's pipeline." },
              { title: "SEO & GEO Ready", desc: "Optimized at the code and schema level to rank in traditional SERPs and earn citations across AI answer engines." },
              { title: "Custom Business Solutions", desc: "No bloated page builders or brittle templates. Bespoke software architecture mapped around your exact operational workflow." },
              { title: "Long-Term SLA Support", desc: "90-day post-launch warranty, proactive Core Web Vitals monitoring, and iterative conversion optimization." },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="border-l border-white/20 pl-6">
                  <h3 className="text-xl font-medium tracking-tight mb-3">{item.title}</h3>
                  <p className="text-white/60 text-sm leading-[1.5]">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Client Architecture (Case Studies) */}
      <section className="w-full py-24 md:py-36 px-4 md:px-12 border-t border-black/5">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div>
                <div className="text-[10px] tracking-widest-caps text-black/40 mb-3">Verified Outcomes</div>
                <h2 className="text-4xl md:text-5xl tracking-tight-display font-medium">Featured Client Architecture</h2>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-900 hover:opacity-70 transition-opacity"
              >
                <span>View Full Case Study Index</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PROJECTS_LIST.map((project, idx) => (
              <Reveal key={project.id} delay={idx * 0.1}>
                <Link
                  href={`/projects/${project.id}`}
                  className="group block bg-brand-50 border border-black/10 overflow-hidden hover:border-black/30 transition-colors"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-100">
                    <Image
                      src={project.heroImage}
                      alt={project.heroImageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between text-xs uppercase tracking-widest text-black/50 mb-3">
                      <span>{project.category}</span>
                      <span>{project.year}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-medium tracking-tight-display mb-3 group-hover:underline">
                      {project.title}
                    </h3>
                    <p className="text-sm text-black/70 leading-relaxed mb-6">
                      {project.shortDesc}
                    </p>
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-black/10">
                      {project.results.slice(0, 3).map((res) => (
                        <div key={res.label}>
                          <div className="text-lg md:text-xl font-medium tracking-tight-display text-brand-900">
                            {res.value}
                          </div>
                          <div className="text-[11px] text-black/50 leading-snug">{res.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Workflow Timeline */}
      <section className="w-full py-24 md:py-40 px-4 md:px-12 border-t border-black/5">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <h2 className="text-4xl md:text-5xl tracking-tight-display font-medium mb-20">The Engineering Process</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {[
              {
                title: "Consultation",
                description:
                  "Deep dive into your current operations, tech stack, and growth bottlenecks. We identify exactly where a digital system can automate workflows and drive revenue.",
              },
              {
                title: "Planning",
                description:
                  "Mapping out the data flow, CRM integrations, and tech stack. This blueprint ensures your website, marketing channels, and sales pipelines work as a unified engine.",
              },
              {
                title: "Design",
                description:
                  "Crafting high-conversion, premium interfaces that build immediate trust. We design for the end-user while maintaining a strong, authoritative brand presence.",
              },
              {
                title: "Development",
                description:
                  "Building the core infrastructure. Custom React frontends, robust backends, and seamless API connections to tools like WhatsApp, Meta, and your CRM.",
              },
              {
                title: "Launch",
                description:
                  "Rigorous pre-launch stress testing across all devices. We ensure flawless performance, technical SEO readiness, and a seamless, zero-downtime deployment.",
              },
              {
                title: "Support",
                description:
                  "Post-launch scale and optimization. We monitor system health, manage updates, and iteratively improve conversion rates based on real user data.",
              },
            ].map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1}>
                <div className="relative pt-8 group border-t border-black/10 hover:border-transparent transition-colors">
                  <div className="absolute top-[-1px] left-0 w-full h-[2px] bg-brand-900 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]" />
                  <div className="text-[10px] tracking-widest-caps text-black/40 mb-4 group-hover:text-brand-900 transition-colors duration-300">
                    0{i + 1}
                  </div>
                  <h3 className="text-xl font-medium tracking-tight-display mb-3 group-hover:translate-x-1 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]">
                    {step.title}
                  </h3>
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


