/**
 * @file src/app/services/[slug]/page.tsx
 * @description Dynamic Service Detail Page & Specification Sheet
 *
 * This Next.js Server Component dynamically generates dedicated landing pages
 * for all 7 flagship Infriva Solutions agency offerings.
 *
 * Architecture & Performance Patterns:
 * 1. Static Site Generation (SSG) via `generateStaticParams`:
 *    - All 7 service pages are pre-rendered into static HTML during `npm run build`.
 *    - Delivers sub-millisecond TTFB and zero runtime database latency.
 * 2. Dynamic SEO & Social Graph via `generateMetadata`:
 *    - Dynamically computes page title, meta description, and OpenGraph preview images.
 * 3. Graceful 404 Routing (`notFound()`):
 *    - If a user enters an unmapped slug coordinate, invokes Next.js `notFound()`,
 *      seamlessly triggering `src/app/not-found.tsx`.
 * 4. Asymmetric Bento Geometry:
 *    - Uses a 12-column layout on desktop: 7 columns for narrative & investment specs,
 *      5 columns for operational deliverables with Phosphor checkmarks.
 */

import { Reveal } from "@/components/ui/Reveal";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

/**
 * Service Data Dictionary
 *
 * Central source of truth for all 7 agency services, detailing scope, pricing,
 * delivery timelines, SLA guarantees, and operational inclusions.
 */
const servicesData: Record<string, { 
  title: string; 
  subtitle: string; 
  overview: string; 
  pricing: string; 
  timeline: string; 
  sla: string; 
  features: string[]; 
  image?: string; 
}> = {
  "premium-content": {
    title: "Premium Content Creation",
    subtitle: "Blog, Social & Video Distribution.",
    overview: "Enhance brand authority, drive high-intent organic traffic, and foster deep customer engagement through a comprehensive content and social strategy.",
    pricing: "₹60,000 / month",
    timeline: "Strategy in Week 1, Delivery Ongoing",
    sla: "Response < 2hrs, Guaranteed > 99.9% Uptime",
    features: [
      "Blog Production (2 posts/month, 1000+ words)",
      "Social Media Management (Daily across 3 platforms)",
      "Video Production (2 short-form videos/month)",
      "Competitor Content Gap Analysis"
    ]
  },
  "social-media-management": {
    title: "Social Media Management",
    subtitle: "Human-Curated Standard Tier.",
    overview: "Establish organic brand authority and maintain consistent market visibility through high-fidelity, human-curated multimedia production.",
    pricing: "₹20,000 / month",
    timeline: "Monthly Planning by 20th",
    sla: "90-day Incubation, 48-hour Approval Window",
    features: [
      "Custom Strategy & Audience Monitoring",
      "Static Posts (Daily)",
      "Reel Production (3 per week)",
      "Long-form Video (1 per month)"
    ]
  },
  "seo-and-geo": {
    image: "/images/stone-staircase.jpg",
    title: "Full-Stack SEO & GEO",
    subtitle: "Generative Engine Optimization.",
    overview: "Dominate organic search rankings and AI generative engine citations through rigorous technical optimization, authority link-building, and content syndication.",
    pricing: "₹65,000 / month",
    timeline: "Audit by 10th Business Day",
    sla: "6-month Incubation Period Required",
    features: [
      "Social & SMO Syndication (IG, FB, Medium, LinkedIn)",
      "Content Marketing (3 SEO-optimized blogs/week)",
      "Technical SEO & GEO (AI search optimization)",
      "Local SEO & Backlink Building"
    ]
  },
  "retention-marketing": {
    image: "/images/champagne-sphere.jpg",
    title: "Retention Marketing",
    subtitle: "WhatsApp Add-On Ecosystem.",
    overview: "Maximize Customer Lifetime Value (LTV) and repeat purchase rates through personalized, highly-converting direct messaging sequences.",
    pricing: "₹25,000 / month",
    timeline: "Automation Logic Maps (Week 2)",
    sla: "90-day Incubation, Response < 8hrs",
    features: [
      "Broadcast Campaigns (4 per month)",
      "Abandoned Cart Triggers",
      "Welcome Series Sequences",
      "Win-Back Sequences"
    ]
  },
  "web-development": {
    image: "/images/glass-panels.jpg",
    title: "Web Dev & UI/UX Design",
    subtitle: "High-Performance Digital Property.",
    overview: "Architect a conversion-optimized digital property that establishes brand authority, accelerates user acquisition, and serves as a scalable technical foundation.",
    pricing: "₹80,000+ (One-time)",
    timeline: "Launch in 45 Business Days",
    sla: "90-day Post-Launch Warranty",
    features: [
      "UI/UX Strategy & Wireframing (Up to 10 pages)",
      "High-Fidelity Design (1 Concept, 2 Revisions)",
      "Responsive Front-End & CMS Back-End Dev",
      "Technical SEO & Pre-Launch QA"
    ]
  },
  "paid-advertising": {
    image: "/images/titanium-gears.jpg",
    title: "Paid Advertising Management",
    subtitle: "Meta & Google Ads Engine.",
    overview: "Accelerate predictable customer acquisition and revenue generation through targeted performance marketing, algorithmic bidding, and optimized media buying.",
    pricing: "₹50,000 / month + 10% Spend",
    timeline: "Strategy & Roadmap (Week 1)",
    sla: "90-day Incubation for Algorithmic Learning",
    features: [
      "Meta Ads Campaign Architecture & Targeting",
      "Google Ads Keyword Optimization",
      "Ad Creative & Copy Deck Preparation",
      "Bi-Weekly Performance Attribution Reports"
    ]
  },
  "crm-systems": {
    image: "/images/glass-panels.jpg",
    title: "Custom CRM Systems",
    subtitle: "Bespoke Automation Architecture.",
    overview: "Architect a custom CRM system designed perfectly around your existing sales workflows to increase conversion rates and automate lead tracking.",
    pricing: "₹90,000+ (One-time)",
    timeline: "Launch in 60 Business Days",
    sla: "90-day Post-Launch Warranty",
    features: [
      "Database Architecture & Modeling",
      "Automated Lead Routing",
      "Third-Party API Integrations",
      "Custom Reporting Dashboards"
    ]
  }
};

/**
 * Pre-computes all static routes for build-time generation.
 */
export function generateStaticParams() {
  return Object.keys(servicesData).map((slug) => ({ slug }));
}

/**
 * Generates dynamic OpenGraph and document metadata for search crawlers.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = servicesData[slug];
  
  // Fallback metadata for unmatched routes
  if (!data) {
    return {
      title: "Service Not Found | Infriva",
    };
  }

  return {
    title: `${data.title} | Infriva Solutions`,
    description: data.overview,
    openGraph: {
      title: `${data.title} | Infriva Solutions`,
      description: data.overview,
      images: data.image ? [data.image] : undefined,
    },
  };
}

/**
 * Service Detail Page Component
 */
export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  // Await dynamic route params promise (Next.js 15+ convention)
  const { slug } = await params;
  const data = servicesData[slug];

  // Route guard: Render 404 boundary if slug does not exist in registry
  if (!data) {
    notFound();
  }

  return (
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      {/* 12-Column Asymmetric Grid Container */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        
        {/* Left Column: Narrative Details, Investment Specs & Booking CTA (7 Cols) */}
        <div className="lg:col-span-7">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-900" />
              <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">Deliverables Spec Sheet</span>
            </div>
          </Reveal>
          
          <Reveal delay={0.1}>
            <h1 className="text-5xl md:text-7xl tracking-tight-display leading-[1.05] font-medium text-balance mb-6">
              {data.title}
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-xl md:text-2xl leading-[1.4] tracking-tight-display text-black/60 mb-12 text-balance">
              {data.subtitle}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="prose prose-lg prose-neutral max-w-none text-black/80 mb-12">
              <p>{data.overview}</p>
            </div>
          </Reveal>

          {/* Investment & Timeline Bento Grid */}
          <Reveal delay={0.4}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              <div className="p-6 bg-brand-50 border border-black/5 rounded-xl">
                <div className="text-[10px] tracking-widest-caps text-black/40 mb-2">Investment</div>
                <div className="text-xl tracking-tight-display font-medium text-brand-900">{data.pricing}</div>
              </div>
              <div className="p-6 bg-brand-50 border border-black/5 rounded-xl">
                <div className="text-[10px] tracking-widest-caps text-black/40 mb-2">Delivery Timeline</div>
                <div className="text-xl tracking-tight-display font-medium text-brand-900">{data.timeline}</div>
              </div>
              <div className="sm:col-span-2 p-6 bg-brand-50 border border-black/5 rounded-xl">
                <div className="text-[10px] tracking-widest-caps text-black/40 mb-2">SLA Terms</div>
                <div className="text-base tracking-tight-display font-medium text-brand-900">{data.sla}</div>
              </div>
            </div>
          </Reveal>

          {/* Direct Consultation Link */}
          <Reveal delay={0.5}>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 bg-brand-900 text-white rounded-xl hover:bg-black transition-colors font-medium tracking-tight text-sm">
              Initiate Project
            </Link>
          </Reveal>
        </div>

        {/* Right Column: Operational Inclusions & Checklist (5 Cols) */}
        {data.features.length > 0 && (
          <div className="lg:col-span-5 flex flex-col pt-12 lg:pt-0">
            <Reveal delay={0.2}>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest-caps text-black/40 mb-8">Operational Inclusions</h3>
            </Reveal>

            <div className="flex flex-col gap-4">
              {data.features.map((feature, i) => (
                <Reveal key={i} delay={0.3 + i * 0.1}>
                  <div className="flex gap-4 p-5 bg-white border border-black/10 rounded-xl hover:border-black/30 hover:shadow-xl transition-all duration-300 group">
                    <div className="mt-0.5">
                      <CheckCircle size={20} className="text-brand-900 group-hover:scale-110 transition-transform" weight="fill" />
                    </div>
                    <div>
                      <h4 className="font-medium tracking-tight text-sm leading-[1.4] text-black/80 group-hover:text-black transition-colors">
                        {feature}
                      </h4>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
