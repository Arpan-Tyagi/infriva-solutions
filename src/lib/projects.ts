/**
 * @file src/lib/projects.ts
 * @description Unified Client Case Studies Registry & Schema.org CreativeWork Generators
 *
 * Single source of truth for Infriva Solutions' portfolio deployments (FlyingLyte, StarX Hotel).
 * Consumed by:
 * - `src/app/sitemap.ts`
 * - `src/app/projects/page.tsx` & `src/app/projects/ProjectsGrid.tsx`
 * - `src/app/projects/[slug]/page.tsx`
 * - `src/app/page.tsx`
 */

import { SITE_URL, absoluteUrl, buildBreadcrumbJsonLd } from "./site";

export interface ProjectArchitectureSection {
  heading: string;
  body: string[];
  bullets?: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  shortDesc: string;
  metaDescription: string;
  category: string;
  indexCategory: string;
  year: string;
  lastModified: string;
  clientIndustry: string;
  engagementDuration: string;
  deliverables: string[];
  techStack: string[];
  heroImage: string;
  heroImageAlt: string;
  overview: string[];
  challenge: string[];
  solution: string[];
  architectureSections: ProjectArchitectureSection[];
  results: { label: string; value: string; detail: string }[];
  images: { src: string; alt: string }[];
  relatedServices: { slug: string; title: string }[];
  nextProject: string;
}

export const PROJECTS_LIST: ProjectItem[] = [
  {
    id: "flyinglyte",
    title: "FlyingLyte",
    tagline: "A high-performance Next.js travel booking engine and automated WhatsApp CRM pipeline built to capture and convert leads at scale.",
    shortDesc:
      "A high-performance booking engine that streamlined the customer experience and increased lead capture by 40%. Built on Next.js with automated WhatsApp CRM workflows.",
    metaDescription:
      "FlyingLyte Case Study: How Infriva Solutions engineered a Next.js travel booking engine and WhatsApp CRM pipeline, achieving +40% leads, -55% drop-off, and 1.1s LCP.",
    category: "Travel · Flight Booking · Hotel Packages",
    indexCategory: "Travel, Flight Booking, Hotel Booking, Packages",
    year: "2025",
    lastModified: "2026-09-28",
    clientIndustry: "Online Travel & Holiday Package Aggregation",
    engagementDuration: "45 Business Days (Architecture, Build & Automation Go-Live)",
    deliverables: [
      "Next.js Web Application",
      "Custom Multi-Step Booking Engine",
      "PostgreSQL CRM Integration",
      "Technical SEO & Schema Architecture",
      "Meta Ads & CAPI Integration",
      "WhatsApp Cloud API Lead Capture",
    ],
    techStack: [
      "Next.js App Router",
      "React 19 & TypeScript",
      "PostgreSQL / Supabase",
      "Meta WhatsApp Cloud API",
      "Meta Conversions API (CAPI)",
      "Tailwind CSS",
    ],
    heroImage: "/images/flight-smartphone.jpg",
    heroImageAlt: "FlyingLyte mobile-first flight and holiday package booking interface engineered by Infriva Solutions",
    overview: [
      "FlyingLyte is a modern travel platform serving leisure and corporate travelers across domestic and international flight bookings, boutique hotel reservations, and curated multi-city holiday packages. As paid and social traffic scaled, the company found that its legacy website was hemorrhaging high-intent travelers before their sales desk could ever issue a quote.",
      "The leadership team engaged Infriva Solutions to replace their fragmented brochure website and manual spreadsheet tracking with a unified digital booking ecosystem: a sub-second Next.js web application, a progressive multi-step itinerary configurator, a centralized PostgreSQL CRM, and 12 automated WhatsApp Cloud API follow-up flows.",
    ],
    challenge: [
      "Prior to our engagement, FlyingLyte suffered from a 74% funnel abandonment rate at the booking inquiry step. Mobile travelers clicking through from Instagram Reels and Google Search Ads encountered a 5.4-second load delay and an intimidating 14-field static form that failed to preserve state if the user navigated back to compare package dates.",
      "Operationally, the backend was entirely manual. Inquiries arrived via unindexed emails or ad-hoc WhatsApp messages, were copied by hand into a shared spreadsheet, and frequently waited 4 to 8 hours for a travel consultant's first response—by which time the traveler had already booked on an aggregator portal.",
    ],
    solution: [
      "We re-architected the entire platform from scratch on Next.js using Static Site Generation (SSG) for destination landing pages and optimistic client state for the interactive booking configurator. Instead of confronting users with a wall of inputs, we split the booking flow into a frictionless 3-step progressive sequence (Destination & Dates -> Traveler Preferences -> Instant WhatsApp/Quote Dispatch) that captures verified contact intent on Step 2.",
      "Every submission writes directly to a centralized PostgreSQL CRM with automatic agent round-robin assignment. Within 15 seconds of form completion—or if a user abandons after Step 2—our webhook engine triggers a personalized WhatsApp Cloud API message containing itinerary options and a direct one-tap connection to their assigned travel specialist.",
    ],
    architectureSections: [
      {
        heading: "Progressive Funnel Engineering & Abandoned Itinerary Recovery",
        body: [
          "To eliminate the 74% booking drop-off, we instrumented every step of the itinerary builder with event telemetry. By separating route selection from traveler contact capture, prospects experience immediate momentum while our backend records partial itinerary intent.",
          "When a traveler pauses mid-booking, our automated retention workflow dispatches a tailored WhatsApp message within 20 minutes with their exact destination and travel dates pre-populated—recovering leads that previously vanished without a trace.",
        ],
        bullets: [
          "1.1-second Largest Contentful Paint (LCP) on 4G mobile networks via AVIF image optimization and edge caching.",
          "12 automated WhatsApp Cloud API flows covering instant quote confirmation, itinerary PDF delivery, visa checklist reminders, and post-trip review capture.",
          "Server-side Meta Conversions API (CAPI) integration feeding qualified booking values back to Meta Ads Manager.",
        ],
      },
      {
        heading: "Search-First Destination Architecture & Paid Acquisition Synergy",
        body: [
          "We structured every holiday package and flight corridor as a statically generated, schema-enriched landing page with clean canonical URLs and dynamic OpenGraph previews. Paired with targeted Meta Ads and high-intent search campaigns, FlyingLyte reduced its cost per qualified inquiry while scaling monthly booking volume.",
          "By deploying hardware-accelerated image optimizations and pre-rendered itinerary cards, search bots index updated package fares in near real-time, while prospective travelers arriving from Google AI Overviews and commercial search queries experience immediate layout stability without content shifts.",
        ],
        bullets: [
          "Static Site Generation (SSG) with ISR caching for hundreds of seasonal travel and flight package routes.",
          "Dynamic OpenGraph preview card generation for high-CTR WhatsApp and social link shares.",
          "Real-time travel consultant dashboard monitoring incoming inquiries and WhatsApp conversation states.",
        ],
      },
    ],
    results: [
      { label: "Increase in Leads", value: "+40%", detail: "Verified growth in qualified travel inquiries within 60 days" },
      { label: "Drop-off Reduction", value: "−55%", detail: "Cut booking step abandonment from 74% down to 33%" },
      { label: "Page Load (LCP)", value: "1.1s", detail: "Down from 5.4s on the legacy mobile platform" },
      { label: "WhatsApp Automations", value: "12 Flows", detail: "End-to-end automated quote, nurture & review sequences" },
    ],
    images: [
      {
        src: "/images/marketing-megaphone.jpg",
        alt: "FlyingLyte omnichannel Meta Ads and conversion campaign architecture",
      },
      {
        src: "/images/stone-monolith.jpg",
        alt: "FlyingLyte structured PostgreSQL CRM and booking pipeline architecture",
      },
    ],
    relatedServices: [
      { slug: "web-development", title: "Web Dev & UI/UX Design" },
      { slug: "crm-systems", title: "Custom CRM Systems" },
      { slug: "retention-marketing", title: "Retention Marketing" },
      { slug: "seo-and-geo", title: "Full-Stack SEO & GEO" },
    ],
    nextProject: "starx",
  },
  {
    id: "starx",
    title: "StarX Hotel",
    tagline: "An immersive hospitality web property and direct-booking CRM engineered to eliminate OTA commissions and maximize repeat guest LTV.",
    shortDesc:
      "Immersive hospitality web property built for direct reservations and automated guest routing, integrated with a custom CRM for real-time booking management.",
    metaDescription:
      "StarX Hotel Case Study: How Infriva Solutions built a luxury direct-booking website, custom reservation CRM, and WhatsApp guest flows, lifting direct bookings by +35%.",
    category: "Hospitality · Room Showcase · Direct Booking CRM",
    indexCategory: "Hotel Website, Hospitality, Room Showcase, Responsive Design",
    year: "2025",
    lastModified: "2026-10-02",
    clientIndustry: "Luxury Boutique Hospitality & Direct Room Reservations",
    engagementDuration: "50 Business Days (Brand UI/UX, Booking CRM & WhatsApp Concierge)",
    deliverables: [
      "Luxury Hospitality Web Property",
      "Custom Reservation & Availability CRM",
      "Interactive Room & Suite Showcase",
      "WhatsApp Cloud API Guest Concierge",
      "High-Intent Google Search Ads Setup",
      "Responsive Brutalist-Luxury Design System",
    ],
    techStack: [
      "Next.js App Router",
      "React 19 & TypeScript",
      "PostgreSQL Reservation Store",
      "WhatsApp Cloud API",
      "Google Ads Conversion Tracking",
      "Framer Motion",
    ],
    heroImage: "/images/hotel-keycard.jpg",
    heroImageAlt: "StarX Hotel luxury direct-booking digital experience and keycard identity by Infriva Solutions",
    overview: [
      "StarX Hotel is a premier boutique hospitality property competing against national hotel chains and Online Travel Agencies (OTAs) such as Booking.com, MakeMyTrip, and Agoda. While the physical property delivered a five-star guest experience, its digital footprint was virtually non-existent—forcing ownership to surrender 15% to 22% of top-line room revenue in third-party aggregator commissions on every single stay.",
      "Infriva Solutions partnered with StarX Hotel to architect an owned direct-booking channel: a visually commanding Next.js web property, a real-time room showcase and reservation intake CRM, high-intent Google Search acquisition campaigns, and an automated WhatsApp guest concierge covering the entire pre-arrival to post-checkout lifecycle.",
    ],
    challenge: [
      "Nearly 100% of StarX Hotel's online reservations originated through third-party OTAs. Not only did these aggregators extract heavy commission fees, they also masked guest contact information—preventing the hotel from building a first-party guest database, offering direct room upgrades, or driving commission-free repeat stays.",
      "Prospective guests who searched for the hotel's brand name on Google after discovering it on an OTA found no authoritative official website where they could inspect suite layouts, verify direct-booking perks, or reserve a room seamlessly on mobile.",
    ],
    solution: [
      "We designed and engineered an editorial, mobile-first hospitality platform that mirrors the tactile calm of the physical property. High-resolution AVIF suite galleries, transparent direct-booking rate comparisons, and a 2-step reservation request flow connect directly to a custom PostgreSQL booking CRM managed by the front desk.",
      "The moment a guest initiates a reservation, our WhatsApp Cloud API integration dispatches an instant booking confirmation, followed by automated pre-arrival check-in instructions 24 hours before arrival, an on-property concierge menu, and a post-checkout review and repeat-stay loyalty voucher.",
    ],
    architectureSections: [
      {
        heading: "Reclaiming Margin From Third-Party Aggregators (OTAs)",
        body: [
          "Hospitality buyers frequently use OTAs for discovery but check the hotel's official website before paying—provided the direct experience feels faster, more trustworthy, and more rewarding. We engineered the StarX Hotel platform to load in under 1.3 seconds on mobile with immediate clarity on suite amenities, flexible check-in perks, and instant WhatsApp front-desk confirmation.",
          "Combined with exact-match brand and local luxury hotel Google Search campaigns, StarX immediately began intercepting high-intent travelers before they completed checkout on high-commission aggregator portals.",
        ],
        bullets: [
          "+35% shift toward direct, commission-free reservations within the first quarter post-launch.",
          "~18% average OTA commission saved on every migrated booking, flowing straight to net operating income.",
          "First-party guest CRM capturing stay preferences, corporate billing details, and anniversary/repeat triggers.",
        ],
      },
      {
        heading: "Automated Post-Stay Reputation & Repeat Guest Engine",
        body: [
          "In hospitality, a 0.4-star increase in review ratings compounds organic booking conversion across every channel. Our automated post-checkout WhatsApp sequence checks in with guests two hours after departure: happy guests are guided with one tap to leave a verified Google review, and every direct guest receives a personalized VIP code for their next stay—lifting repeat guest bookings by 22%.",
          "Front desk staff utilize a clean calendar dashboard to view incoming guest arrivals, dietary preferences, and room allocations without navigating cumbersome legacy hospitality software interfaces.",
        ],
        bullets: [
          "Automated 2-hour post-departure WhatsApp review prompts directing verified guests to Google Business Profile.",
          "VIP return-guest promo codes distributed automatically to drive commission-free repeat stays.",
          "Mobile-responsive front desk tablet view for instantaneous room-availability lookups and check-in verifications.",
        ],
      },
    ],
    results: [
      { label: "Direct Booking Share", value: "+35%", detail: "Shifted from third-party OTAs to owned direct channel" },
      { label: "OTA Commission Saved", value: "~18%", detail: "Margin recaptured per direct room reservation" },
      { label: "Review Score Improvement", value: "+0.4★", detail: "Driven by automated post-stay WhatsApp review flows" },
      { label: "Repeat Guest Rate", value: "+22%", detail: "Powered by first-party CRM & VIP loyalty sequences" },
    ],
    images: [
      {
        src: "/images/champagne-sphere.jpg",
        alt: "StarX Hotel luxury brand identity and direct reservation concierge experience",
      },
      {
        src: "/images/glass-panels.jpg",
        alt: "StarX Hotel responsive room showcase and real-time availability CRM architecture",
      },
    ],
    relatedServices: [
      { slug: "web-development", title: "Web Dev & UI/UX Design" },
      { slug: "crm-systems", title: "Custom CRM Systems" },
      { slug: "retention-marketing", title: "Retention Marketing" },
      { slug: "paid-advertising", title: "Paid Advertising Management" },
    ],
    nextProject: "flyinglyte",
  },
];

export const PROJECTS_BY_SLUG: Record<string, ProjectItem> = Object.fromEntries(
  PROJECTS_LIST.map((p) => [p.id, p])
);

export function buildProjectJsonLd(project: ProjectItem) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": `${SITE_URL}/projects/${project.id}#casestudy`,
      name: `${project.title} — Engineering Case Study`,
      headline: project.tagline,
      description: project.metaDescription,
      url: `${SITE_URL}/projects/${project.id}`,
      image: absoluteUrl(project.heroImage),
      datePublished: `${project.year}-06-15`,
      dateModified: project.lastModified,
      inLanguage: "en-IN",
      author: {
        "@id": `${SITE_URL}/#organization`,
      },
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      about: project.deliverables.map((d) => ({
        "@type": "Thing",
        name: d,
      })),
    },
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Projects", path: "/projects" },
      { name: project.title, path: `/projects/${project.id}` },
    ]),
  ];
}
