/**
 * @file src/app/projects/[slug]/page.tsx
 * @description Dynamic Case Study & Client Architectural Proof
 *
 * This Next.js Server Component dynamically renders deep case study narratives
 * for client deployments (FlyingLyte, StarX Hotel).
 *
 * Case Study Architecture:
 * 1. Build-Time Static Generation (SSG):
 *    - `generateStaticParams()` pre-compiles all case studies into immutable HTML.
 * 2. Dynamic Social Graph (OpenGraph):
 *    - `generateMetadata()` injects project titles, taglines, and hero photography into `<head>`.
 * 3. 3-Part Engineering Narrative:
 *    - The Challenge: Legacy platform failure points and operational drop-offs.
 *    - The Solution: Custom Next.js architectures, CRM pipelines, and messaging workflows.
 *    - Measured Outcomes: Quantitative results grid (leads generated, commission saved).
 * 4. Spatial Geometry:
 *    - Asymmetric Golden Ratio grid ($38.2\%$ deliverables sidebar, $61.8\%$ narrative body).
 *    - Inverted obsidian results section (`bg-[#0A0A0B]`) for high-contrast visual rhythm.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

/**
 * Case Study Registry
 * Maps unique slug identifiers to full case study narrative briefs, images, and metrics.
 */
const projects: Record<string, {
  id: string;
  title: string;
  tagline: string;
  category: string;
  year: string;
  deliverables: string[];
  heroImage: string;
  overview: string;
  challenge: string;
  solution: string;
  results: { label: string; value: string }[];
  images: string[];
  nextProject: string;
}> = {
  flyinglyte: {
    id: "flyinglyte",
    title: "FlyingLyte",
    tagline: "A high-performance booking engine built to generate and convert leads at scale.",
    category: "Travel · Flight Booking · Hotel Packages",
    year: "2024",
    deliverables: [
      "Next.js Web Application",
      "Custom Booking Engine",
      "CRM Integration",
      "SEO Architecture",
      "Meta Ads Integration",
      "Lead Capture System",
    ],
    heroImage: "/images/flight-smartphone.jpg",
    overview:
      "FlyingLyte is a modern travel platform serving customers across flight bookings, hotel reservations, and curated holiday packages. The client came to us with a legacy site that was bleeding leads due to a broken booking flow and zero structured CRM.",
    challenge:
      "The previous platform had a 74% drop-off rate at the booking step — customers were entering the funnel but abandoning before conversion. The entire system was manual: enquiries arrived via WhatsApp, were tracked in a spreadsheet, and had no follow-up automation whatsoever.",
    solution:
      "We rebuilt the platform from scratch on Next.js with a custom multi-step booking engine at its core. Every enquiry is now captured into a structured CRM with automated follow-up sequences via WhatsApp API. SEO architecture and targeted Meta Ads campaigns were layered on top to drive qualified traffic.",
    results: [
      { label: "Increase in Leads", value: "+40%" },
      { label: "Drop-off Reduction", value: "−55%" },
      { label: "Page Load (LCP)", value: "1.1s" },
      { label: "WhatsApp Automations", value: "12 Flows" },
    ],
    images: [
      "/images/marketing-megaphone.jpg",
      "/images/stone-monolith.jpg",
    ],
    nextProject: "starx",
  },
  starx: {
    id: "starx",
    title: "StarX Hotel",
    tagline: "An immersive digital presence engineered to establish luxury authority and drive direct, commission-free bookings.",
    category: "Hospitality · Room Showcase · Responsive Design",
    year: "2024",
    deliverables: [
      "Luxury Hotel Website",
      "Custom CRM for Bookings",
      "Room Showcase Gallery",
      "WhatsApp API Integration",
      "Google Ads Setup",
      "Responsive Design System",
    ],
    heroImage: "/images/hotel-keycard.jpg",
    overview:
      "StarX Hotel is a premium boutique hospitality brand competing against OTA giants like Booking.com and MakeMyTrip. The ownership wanted a direct booking channel that could rival the experience of a luxury hotel app while eliminating the 15-20% OTA commission on every reservation.",
    challenge:
      "The hotel had no direct digital presence — 100% of bookings came through third-party aggregators with crippling commission fees. There was no brand story, no visual differentiation, and no system for capturing guest data to build loyalty.",
    solution:
      "We designed an immersive, visually-led website anchored by cinematic room showcases and a frictionless booking form connected to a live availability CRM. A WhatsApp API flow was integrated to send booking confirmations, pre-arrival messages, and post-stay review requests automatically.",
    results: [
      { label: "Direct Booking Share", value: "+35%" },
      { label: "OTA Commission Saved", value: "~18%" },
      { label: "Review Score Improvement", value: "+0.4★" },
      { label: "Repeat Guest Rate", value: "+22%" },
    ],
    images: [
      "/images/champagne-sphere.jpg",
      "/images/stone-staircase.jpg",
    ],
    nextProject: "flyinglyte",
  },
};

/**
 * Pre-computes static parameters for build-time static page generation.
 */
export function generateStaticParams() {
  return Object.keys(projects).map((slug) => ({ slug }));
}

/**
 * Computes dynamic metadata for social sharing and search indexing.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects[slug];
  if (!project) {
    return {
      title: "Project Not Found | Infriva",
    };
  }

  return {
    title: `${project.title} — Case Study | Infriva`,
    description: project.tagline,
    openGraph: {
      title: `${project.title} — Case Study | Infriva`,
      description: project.tagline,
      images: [project.heroImage],
    },
  };
}

export default async function ProjectSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects[slug];
  
  // Trigger 404 boundary if requested case study does not exist
  if (!project) notFound();

  // Resolve next case study for circular navigation footer
  const next = projects[project.nextProject];

  return (
    <div className="w-full bg-[#FBF8F3]">
      {/* Back to Projects Navigation Anchor */}
      <div className="pt-32 px-4 md:px-12 max-w-7xl mx-auto">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-black/40 hover:text-black/80 transition-colors duration-300 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
          All Projects
        </Link>
      </div>

      {/* Case Study Header & Manifesto */}
      <section className="px-4 md:px-12 pt-12 pb-16 max-w-7xl mx-auto">
        <div className="mb-6">
          <span className="text-[10px] tracking-widest-caps font-medium text-black/40 uppercase font-mono">
            {project.category} · {project.year}
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl xl:text-[6rem] tracking-tight-display leading-[1.0] font-medium mb-6 max-w-5xl">
          {project.title}
        </h1>
        <p className="text-xl md:text-2xl leading-[1.5] text-black/60 font-medium max-w-3xl">
          {project.tagline}
        </p>
      </section>

      {/* Hero Photography Banner */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden">
        <Image
          src={project.heroImage}
          alt={project.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Case Study Narrative Body: Asymmetric 38.2% / 61.8% Golden Ratio Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-20 md:py-24 grid grid-cols-1 lg:grid-cols-[38.2fr_61.8fr] gap-16 lg:gap-24">
        {/* Sidebar: Deliverables Stack */}
        <div>
          <p className="text-[10px] tracking-widest-caps font-medium text-black/40 uppercase font-mono mb-6">
            Deliverables
          </p>
          <ul className="flex flex-col gap-3">
            {project.deliverables.map((d) => (
              <li key={d} className="flex items-center gap-3 text-sm font-medium text-black/70">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-900 shrink-0" />
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Narrative Flow: Overview -> Challenge -> Solution */}
        <div className="flex flex-col gap-12">
          <div>
            <h2 className="text-[10px] tracking-widest-caps font-medium text-black/40 uppercase font-mono mb-4">
              Overview
            </h2>
            <p className="text-lg leading-[1.6] text-black/80">{project.overview}</p>
          </div>

          <div>
            <h2 className="text-[10px] tracking-widest-caps font-medium text-black/40 uppercase font-mono mb-4">
              The Challenge
            </h2>
            <p className="text-lg leading-[1.6] text-black/80">{project.challenge}</p>
          </div>

          <div>
            <h2 className="text-[10px] tracking-widest-caps font-medium text-black/40 uppercase font-mono mb-4">
              The Solution
            </h2>
            <p className="text-lg leading-[1.6] text-black/80">{project.solution}</p>
          </div>
        </div>
      </div>

      {/* Measured Outcomes: Inverted Dark Metrics Matrix */}
      <div className="bg-[#0A0A0B] text-[#FBF8F3] py-12 md:py-20 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] tracking-widest-caps font-medium text-white/40 uppercase font-mono mb-12">
            Measured Outcomes
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-white/10">
            {project.results.map((r) => (
              <div key={r.label} className="p-8 border border-white/5">
                <div className="text-4xl md:text-5xl tracking-tight-display font-medium mb-2">
                  {r.value}
                </div>
                <div className="text-sm text-white/40">{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Project Photography Gallery */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-24 flex flex-col gap-8">
        {project.images.map((img, i) => (
          <div
            key={i}
            className="relative w-full aspect-[16/9] overflow-hidden border border-black/5"
          >
            <Image
              src={img}
              alt={`${project.title} detail ${i + 1}`}
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        ))}
      </div>

      {/* Next Case Study Carousel Transition Anchor */}
      {next && (
        <div className="border-t border-black/10 px-4 md:px-12 py-16">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-[10px] tracking-widest-caps font-medium text-black/40 uppercase font-mono">
              Next Project
            </span>
            <Link
              href={`/projects/${next.id}`}
              className="group flex items-center gap-4 text-2xl md:text-4xl tracking-tight-display font-medium hover:text-black/60 transition-colors duration-300"
            >
              {next.title}
              <ArrowUpRight
                size={32}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
              />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
