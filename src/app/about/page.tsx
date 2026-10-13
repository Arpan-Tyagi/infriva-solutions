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

import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { CheckCircle, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { AnimatedHeadline } from "./AnimatedHeadline";
import { AGENCY_NAP, SITE_URL, buildBreadcrumbJsonLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Infriva Solutions | B2B Systems & Revenue Engineering Studio",
  description:
    "Meet the systems architects behind Infriva Solutions. Based in New Delhi, we engineer Next.js web platforms, custom PostgreSQL CRMs, and SEO/GEO growth engines.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Infriva Solutions | B2B Systems & Revenue Engineering Studio",
    description:
      "Meet the systems architects behind Infriva Solutions. Based in New Delhi, we engineer Next.js web platforms, custom PostgreSQL CRMs, and SEO/GEO growth engines.",
    url: `${SITE_URL}/about`,
    type: "website",
    images: ["/images/minimalist-office.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Infriva Solutions | B2B Systems & Revenue Engineering Studio",
    description:
      "Meet the systems architects behind Infriva Solutions. Based in New Delhi, we engineer Next.js web platforms, custom PostgreSQL CRMs, and SEO/GEO growth engines.",
    images: ["/images/minimalist-office.jpg"],
  },
};

export default function About() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ]);

  return (
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Studio Architecture Photography Banner */}
      <Reveal priority className="w-full max-w-7xl mx-auto h-[50vh] md:h-[70vh] relative mb-24 overflow-hidden bg-brand-100">
        <Image
          src="/images/minimalist-office.jpg"
          alt="Infriva Solutions Digital Engineering Studio in New Delhi"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </Reveal>

      {/* Main 2-Column Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-28">
        {/* Left Column: Manifesto & Scroll-Scrubbed Headline */}
        <div className="lg:pr-12">
          <Reveal priority className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-900" />
            <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">The Growth Partner</span>
          </Reveal>

          <AnimatedHeadline />

          <Reveal>
            <p className="mt-8 text-base md:text-lg text-black/70 leading-relaxed">
              Founded in {AGENCY_NAP.foundingYear} in New Delhi, Infriva Solutions was established to solve a recurring failure mode in modern digital agencies: design studios build visually appealing websites with zero backend pipeline connectivity, while traditional marketing agencies buy traffic that leaks into unmonitored spreadsheets. We bridge both disciplines under one roof—combining full-stack software engineering with algorithmic demand generation.
            </p>
          </Reveal>
        </div>

        {/* Right Column: The Infriva Advantage & Operational Pipeline */}
        <div className="flex flex-col justify-center">
          <Reveal>
            <h2 className="text-2xl md:text-3xl leading-[1.3] font-medium tracking-tight-display mb-6">
              The Infriva Advantage
            </h2>
            <p className="text-lg text-black/65 mb-10 text-pretty leading-relaxed">
              We transition growth-stage companies and enterprise teams from fragmented, manual enquiries to deterministic digital lead management—delivering 360&deg; IT, CRM, and acquisition infrastructure that scales predictably.
            </p>
          </Reveal>

          {/* 4-Step Lead Conversion Lifecycle */}
          <div className="flex flex-col gap-5">
            {[
              {
                title: "High-Intent Traffic Generation",
                desc: "Qualified buyers discover your brand through technical SEO, AI Generative Engine Optimization (GEO), and server-side attributed Meta & Google Ads.",
              },
              {
                title: "Frictionless Lead Capture",
                desc: "Sub-second Next.js landing experiences and interactive multi-step booking engines capture buyer intent without layout shifts or form friction.",
              },
              {
                title: "Automated CRM Routing",
                desc: "Every web form, ad lead, and WhatsApp inquiry is ingested into a centralized PostgreSQL CRM with instant rep assignment and SLA countdown timers.",
              },
              {
                title: "Accelerated Revenue Conversion",
                desc: "Automated WhatsApp Cloud API sequences and structured sales playbooks engage prospects within seconds, lifting lead-to-close velocity.",
              },
            ].map((item, i) => (
              <Reveal
                key={i}
                delay={0.05 * i}
                className="flex gap-4 p-6 bg-brand-50 rounded-2xl border border-black/5 hover:border-black/20 transition-colors"
              >
                <div className="mt-1 shrink-0">
                  <CheckCircle size={24} className="text-brand-900" weight="light" />
                </div>
                <div>
                  <h3 className="font-medium tracking-tight mb-1">{item.title}</h3>
                  <p className="text-black/65 text-sm leading-[1.5]">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Studio Track Record Metrics */}
      <section className="max-w-7xl mx-auto py-16 border-y border-black/10 mb-28">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: "100+", label: "Enterprise & B2B Deployments" },
            { value: "250+", label: "Digital Systems Delivered" },
            { value: "5+ Years", label: "Production Engineering Track Record" },
            { value: "4.9 / 5", label: "Verified Client Retention Rating" },
          ].map((stat) => (
            <Reveal key={stat.label}>
              <div>
                <div className="text-4xl md:text-5xl font-medium tracking-tight-display text-brand-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-mono text-black/55">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Architectural Standards & Leadership (E-E-A-T) */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 mb-28">
        <div className="lg:col-span-5">
          <Reveal>
            <div className="text-[10px] tracking-widest-caps text-black/40 mb-3">Leadership &amp; Accountability</div>
            <h2 className="text-3xl md:text-4xl tracking-tight-display font-medium mb-6">
              Principal-Led Systems Architecture
            </h2>
            <p className="text-base text-black/70 leading-relaxed mb-6">
              Every engagement at Infriva Solutions is architected and reviewed directly by our senior engineering leadership—never outsourced to junior account managers or template assembly shops.
            </p>
            <div className="p-8 bg-brand-900 text-white rounded-2xl">
              <div className="text-[10px] tracking-widest-caps text-white/50 mb-2">Founder &amp; Principal Systems Architect</div>
              <h3 className="text-2xl font-medium tracking-tight-display mb-3">Arpan Tyagi</h3>
              <p className="text-sm text-white/75 leading-relaxed mb-6">
                Arpan leads full-stack web architecture, PostgreSQL/Supabase CRM engineering, and technical SEO/GEO strategy at Infriva Solutions. Over the past five years, he has architected custom booking platforms, multi-channel WhatsApp Cloud API ecosystems, and organic acquisition systems for hospitality, travel, SaaS, and service enterprises across India and global markets.
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-white/80 pt-4 border-t border-white/10">
                <span>New Delhi, India</span>
                <span>&bull;</span>
                <a href={`mailto:${AGENCY_NAP.email}`} className="underline hover:text-white">
                  {AGENCY_NAP.email}
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal>
            <div className="text-[10px] tracking-widest-caps text-black/40 mb-3">Engineering Doctrine</div>
            <h2 className="text-3xl md:text-4xl tracking-tight-display font-medium mb-8">
              Four Non-Negotiable Production Standards
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "01. Zero-Template Codebases",
                body: "We engineer custom applications using React 19, Next.js App Router, TypeScript, and Tailwind CSS. By eliminating bloated third-party themes and page builders, our platforms sustain sub-1.5s Largest Contentful Paint (LCP) and zero Cumulative Layout Shift (CLS).",
              },
              {
                title: "02. Database-First Lead Integrity",
                body: "Every enquiry point is backed by ACID-compliant PostgreSQL schemas, Row-Level Security (RLS), and idempotent webhook handlers. Whether a prospect reaches out via web form, Meta Lead Ad, or WhatsApp, zero leads are ever lost.",
              },
              {
                title: "03. Dual Search & AI Visibility",
                body: "We structure every page with semantic HTML, self-referencing canonicals, Schema.org JSON-LD entity graphs, and machine-readable documentation (/llms.txt) so our clients dominate both Google SERPs and AI answer engines.",
              },
              {
                title: "04. Contractual SLA Warranties",
                body: "Every web and CRM deployment includes a 90-day post-launch architectural warranty, documented API specifications, and transparent bi-weekly attribution reporting tied directly to closed revenue.",
              },
            ].map((principle) => (
              <Reveal key={principle.title}>
                <div className="p-8 bg-brand-50 border border-black/10 rounded-2xl h-full">
                  <h3 className="text-lg font-medium tracking-tight-display mb-3 text-brand-900">
                    {principle.title}
                  </h3>
                  <p className="text-sm text-black/70 leading-relaxed">{principle.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto p-10 md:p-16 bg-brand-50 border border-black/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl tracking-tight-display font-medium mb-3">
            Ready to audit your digital infrastructure?
          </h2>
          <p className="text-base text-black/65 leading-relaxed">
            Explore our 7 specialized engineering capabilities, inspect our verified client deployments, or schedule a technical consultation with our New Delhi studio.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 shrink-0">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-4 bg-white border border-black/15 rounded-xl text-sm font-medium text-brand-900 hover:border-black/40 transition-colors"
          >
            <span>Explore Capabilities</span>
            <ArrowUpRight size={16} />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
          >
            <span>Book Technical Consultation</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
