/**
 * @file src/lib/projects.ts
 * @description Unified Client Case Studies Registry & Schema.org CreativeWork Generators
 *
 * Single source of truth for Infriva Solutions' portfolio deployments (FlyingLyte, StarX Hotel, The Kesari Bagh).
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
    tagline: "A custom online travel platform engineered from scratch on React and Django, powered by real-time Travel Boutique Online (TBO) API integration and secure PayU payment gateway.",
    shortDesc:
      "A complete custom travel portal built from the ground up on React and Django, integrating Travel Boutique Online's (TBO) API and PayU payment gateway for live multi-airline flight booking, automated PNR generation, and CRM workflows.",
    metaDescription:
      "FlyingLyte Case Study: How Infriva Solutions built a custom travel platform from scratch with React, Django, TBO API, and PayU with automated PNR generation.",
    category: "Full-Stack Travel Portal · React & Django · TBO & PayU",
    indexCategory: "Full-Stack Web, React, Django, TBO API, PayU Gateway, Flight Booking",
    year: "2025",
    lastModified: "2026-10-15",
    clientIndustry: "Online Travel Agency (OTA) & Flight Aggregation",
    engagementDuration: "60 Business Days (Full-Stack Architecture, TBO Integration & Launch)",
    deliverables: [
      "Custom React Single Page Application (SPA)",
      "Django & Django REST Framework (DRF) Backend",
      "Travel Boutique Online (TBO) API Integration",
      "PayU Payment Gateway Integration (SHA-512 Verification)",
      "Real-Time Flight Search & Dynamic Fare Matrix",
      "Automated PNR Generation & E-Ticket Issuance",
      "PostgreSQL Booking Database & Consultant CRM",
      "Automated WhatsApp Booking Confirmation & PDF Dispatch",
    ],
    techStack: [
      "React",
      "Django (Python)",
      "Django REST Framework",
      "Travel Boutique Online (TBO) API",
      "PayU Payment Gateway",
      "PostgreSQL",
      "Redis Caching",
      "Tailwind CSS",
      "WhatsApp Cloud API",
    ],
    heroImage: "/images/flight-smartphone.jpg",
    heroImageAlt: "FlyingLyte custom React and Django flight booking portal with TBO API and PayU payment gateway integration",
    overview: [
      "FlyingLyte is a full-service online travel agency providing corporate and leisure travelers with comprehensive domestic and international flight bookings, curated holiday itineraries, and boutique hotel reservations. To compete effectively against established travel aggregators, the leadership required an independent digital property that could deliver real-time airline inventories, dynamic fare calculations, secure instant payment processing, and automated booking confirmations without the crippling load times, generic layouts, and rigid commission restrictions of white-label travel templates.",
      "They engaged Infriva Solutions to build their entire digital web platform completely from scratch. We designed and developed an end-to-end custom architecture: a responsive, state-driven Single Page Application in React, a high-throughput backend service engineered in Django (Python) and Django REST Framework, bidirectional integration with Travel Boutique Online's (TBO) global B2B travel distribution API, robust checkout via the PayU payment gateway, and an automated PostgreSQL CRM pipeline that synchronizes live PNRs, e-tickets, and booking alerts directly to travelers via WhatsApp.",
    ],
    challenge: [
      "Building a modern online travel agency from scratch presents formidable technical hurdles. Off-the-shelf white-label platforms rely on heavy iframes and bloated script bundles that take upwards of 5 to 7 seconds to render, suffer severe cumulative layout shifts on mobile devices, and offer no ability to implement custom business logic or dynamic markup tiers. Prior to our build, FlyingLyte experienced over 70% funnel abandonment as users dropped off during sluggish multi-step search queries.",
      "The core engineering challenge centered on orchestrating two critical external systems in real time: Travel Boutique Online (TBO) for live inventory and the PayU payment gateway for transaction settlement. TBO's API coordinates live flight schedules, dynamic cabin classes, taxes, and seat availability, while flight ticketing requires immediate, non-reversible PNR issuance upon payment. Without strict server-side cryptographic hash verification and idempotent webhook reconciliation between PayU and Django, any network drop or payment callback delay could result in unticketed payments or unauthorized booking locks.",
    ],
    solution: [
      "We engineered FlyingLyte's web application from the ground up using a decoupled React and Django architecture. On the client side, we built a modern React SPA featuring instant route switching (one-way, round-trip, multi-city), live airline filtering (by stops, baggage allowance, departure windows, and refundable fares), and a friction-free progressive checkout funnel that preserves traveler state across navigations.",
      "On the backend, we constructed a robust Django REST Framework application to serve as the secure orchestration bridge. Django handles all communication with both the Travel Boutique Online (TBO) API and PayU payment gateway. We implemented an intelligent multi-tier Redis caching layer to store high-frequency flight availability queries, dynamic margin and markup calculators, server-side SHA-512 cryptographic hash generation for PayU checkout, automated PNR creation upon verified payment webhook confirmations, and real-time triggers that dispatch branded WhatsApp e-tickets within seconds.",
    ],
    architectureSections: [
      {
        heading: "Custom Full-Stack Architecture: React SPA & Django REST Backend",
        body: [
          "To provide seamless, 60 FPS consumer booking experiences while enforcing enterprise-grade security and transaction reliability, we decoupled the frontend client from backend business logic. The React client communicates with custom Django REST endpoints over encrypted, authenticated channels.",
          "This separation of concerns enables the React frontend to handle complex client-side state—such as multi-city leg configurations, dynamic fare breakdowns, and interactive seat selections—without page reloads. Meanwhile, the Django backend isolates proprietary agency markup algorithms, booking logic, and sensitive passenger credentials in a secure, tamper-proof environment.",
        ],
        bullets: [
          "Sub-1.2s Largest Contentful Paint (LCP) on mobile networks via optimized React bundle splitting and lightweight asset delivery.",
          "Django REST Framework (DRF) middleware managing dynamic agency markups, promotional discount codes, and multi-currency conversions.",
          "Modular component system allowing FlyingLyte to deploy new destination landing pages and seasonal holiday corridors without backend modifications.",
        ],
      },
      {
        heading: "Travel Boutique Online (TBO) API Integration & High-Throughput Caching",
        body: [
          "Direct integration with Travel Boutique Online's (TBO) global API gives FlyingLyte live access to hundreds of domestic and international airlines, real-time seat availability, and instant GDS ticket issuance. However, unoptimized flight queries across dozens of airline carriers can degrade performance.",
          "We engineered an intelligent query broker in Django that normalizes TBO's XML/JSON responses into standardized schemas. Frequent route lookups are cached in Redis with granular Time-To-Live (TTL) policies, ensuring sub-second response times while running deterministic re-validation before the final booking lock to guarantee 100% fare accuracy.",
        ],
        bullets: [
          "Full TBO API lifecycle integration: Flight Search, Fare Rule Verification, Special Service Requests (SSR), Seat Map Rendering, and Instant PNR Generation.",
          "Intelligent Redis caching layer that reduced flight search response times from 4.8 seconds down to under 1.2 seconds.",
          "Resilient circuit-breaker architecture with automated error handling and fallback routing to maintain platform uptime during upstream provider updates.",
        ],
      },
      {
        heading: "PayU Payment Gateway, Automated PNR Ticketing & WhatsApp Dispatch",
        body: [
          "We eliminated manual booking entry by developing an automated end-to-end transaction pipeline. When a traveler confirms their itinerary, Django calculates the dynamic order total and signs the payload with PayU's SHA-512 cryptographic hash, supporting instant payments across UPI, credit/debit cards, NetBanking, and corporate wallets.",
          "The moment PayU's server-to-server webhook verifies successful payment, Django commands TBO's API to generate the official airline PNR and renders a branded PDF e-ticket with detailed flight itineraries, baggage allowances, and barcode data. Simultaneously, our event engine dispatches the confirmed e-ticket directly to the passenger's WhatsApp via the Meta WhatsApp Cloud API.",
        ],
        bullets: [
          "Seamless PayU payment gateway integration with server-side SHA-512 cryptographic verification and idempotent webhook processing.",
          "Zero-touch PNR generation and automated PDF ticket rendering directly within the Django backend.",
          "12 automated WhatsApp Cloud API lifecycle flows for booking confirmations, payment receipts, flight status reminders, and post-trip reviews.",
          "Centralized PostgreSQL booking database with consultant dashboard for real-time customer support, booking modifications, and cancellation handling.",
        ],
      },
    ],
    results: [
      { label: "Increase in Leads", value: "+40%", detail: "Surge in qualified flight and holiday package inquiries within 60 days of launch" },
      { label: "Drop-off Reduction", value: "−55%", detail: "Booking funnel abandonment reduced from 74% down to 33% via React SPA UX" },
      { label: "Search Latency", value: "1.2s", detail: "Down from 4.8s via Django query optimization & Redis caching" },
      { label: "Ticketing Automation", value: "100%", detail: "Zero-touch PayU payment verification, TBO PNR creation, and WhatsApp ticket dispatch" },
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
    nextProject: "the-kesari-bagh",
  },
  {
    id: "the-kesari-bagh",
    title: "The Kesari Bagh",
    tagline: "An ultra-luxury 4-key French-Colonial Countryside Estate engineering prototype and direct-reservation booking engine deployed on Cloudflare Workers edge network.",
    shortDesc:
      "Ultra-luxury French-Colonial countryside estate engineering prototype and direct reservation engine deployed on Next.js and Cloudflare Workers, demonstrating real-time suite availability locks and WhatsApp concierge automation.",
    metaDescription:
      "The Kesari Bagh Case Study: How Infriva Solutions built an ultra-luxury French-Colonial estate booking prototype on Next.js and Cloudflare Workers edge network.",
    category: "Ultra-Luxury Hospitality · Next.js & Cloudflare Edge · Interactive Prototype",
    indexCategory: "Next.js 16, Cloudflare Workers, Direct Booking Engine, WhatsApp Concierge, Ultra-Luxury Estate Prototype",
    year: "2026",
    lastModified: "2026-10-26",
    clientIndustry: "Ultra-Luxury Boutique Hospitality & Countryside Estates",
    engagementDuration: "45 Business Days (Identity Alignment, Edge Architecture & Launch)",
    deliverables: [
      "French-Colonial High-Contrast Editorial Design System",
      "Next.js 16 App Router on Cloudflare Workers Edge Runtime",
      "Direct 4-Key Suite Availability & Full Estate Buyout Prototype Engine",
      "Automated Meta WhatsApp Cloud API Guest Concierge",
      "Zero-CLS Responsive Image Optimization Pipeline (AVIF)",
      "Technical Hospitality SEO & Schema.org LodgingBusiness Graph",
    ],
    techStack: [
      "Next.js 16 (App Router)",
      "React 19",
      "Cloudflare Workers (Edge Runtime)",
      "TypeScript 5",
      "Tailwind CSS v4",
      "Meta WhatsApp Cloud API",
    ],
    heroImage: "/images/kesari-estate-heritage.jpg",
    heroImageAlt:
      "The Kesari Bagh French-colonial countryside estate in Manesar with emerald lawns and Aravalli foothills engineered by Infriva Solutions",
    overview: [
      "Set across 1.25 private acres with a 1-acre manicured emerald lawn in the Aravalli foothills of Manesar, Gurugram, The Kesari Bagh is an exclusive 4-key French-colonial countryside estate. Designed with classical French symmetry, Parisian crystal chandeliers, and bespoke teakwood furnishings, the property offers unhurried seclusion just 45 minutes from Delhi NCR.",
      "To preserve its ultra-luxury positioning and avoid the high commission extraction and generic catalog presentation of commercial aggregator portals (OTAs), the estate leadership engaged Infriva Solutions to design and engineer a bespoke direct-reservation web property and digital guest concierge.",
    ],
    challenge: [
      "Prior to engaging Infriva Solutions, luxury estate bookings were coordinated informally through Instagram DMs and manual phone calls. High-net-worth guests inquiring about weekend retreats and full-estate buyouts faced delayed responses, while prospective guests had no frictionless way to inspect the four private suites or review curated equestrian experiences with Elly.",
      "Standard boutique hotel templates and commercial white-label booking widgets felt mass-market, slow, and aesthetically disconnected from the tranquil French-colonial character of the estate. The leadership needed a digital experience that rendered instantly across luxury mobile devices, communicated unhurried refinement, and automated guest reservations without intermediary OTA fees.",
    ],
    solution: [
      "Infriva Solutions engineered a custom editorial hospitality platform utilizing Next.js 16 App Router, deployed directly onto the Cloudflare Workers edge runtime for sub-50ms global Time to First Byte (TTFB) and sub-1.1s Largest Contentful Paint (LCP) on mobile networks.",
      "We developed an intuitive direct-reservation system allowing guests to seamlessly inspect individual suite specifications (Garden Pool View, Aravalli Terrace, Kitchen Garden, and Lush Green) or lock in exclusive full-estate buyouts for up to 16 guests. An automated WhatsApp Cloud API concierge engine instantly delivers confirmed PDF booking itineraries and coordinates personalized dining preferences beneath the French chandelier.",
    ],
    architectureSections: [
      {
        heading: "Sub-50ms Edge Performance & Editorial Aesthetic Alignment",
        body: [
          "Ultra-luxury travelers evaluate boutique estates primarily on mobile smartphones. Sluggish page transitions or generic grid layouts instantly destroy perceived luxury value. We engineered The Kesari Bagh web platform to render with sub-second immediacy by deploying the application onto Cloudflare Workers' distributed edge runtime.",
          "High-resolution estate photography—showcasing the French chandelier dining salon, azure swimming pool, and equestrian sessions with Elly—is processed through an automated edge image pipeline delivering modern AVIF assets with strict container aspect ratios to achieve a perfect 0.00 Cumulative Layout Shift (CLS).",
        ],
        bullets: [
          "Cloudflare Workers edge rendering delivering sub-50ms TTFB across domestic and international luxury travelers.",
          "High-contrast editorial typography pairing elegant French Didone serifs with Swiss sans-serif spatial structure.",
          "Zero layout shifts (CLS 0.00) and 1.1s Largest Contentful Paint (LCP) across mobile 4G/5G connections.",
        ],
      },
      {
        heading: "Direct 4-Key Reservation Engine & WhatsApp Concierge SLA",
        body: [
          "With only four exclusive suites across 1.25 acres, avoiding double bookings while offering flexible full-estate buyouts was a vital operational requirement. We engineered a direct availability calendar that supports both individual suite stays and full-estate buyouts (up to 16 guests).",
          "The moment a reservation is submitted, our event engine triggers the Meta WhatsApp Cloud API to dispatch an interactive booking voucher directly to the guest's mobile phone within 15 seconds. Automated pre-arrival notifications collect bespoke dietary preferences for the estate chef and coordinate sunset horseback sessions.",
        ],
        bullets: [
          "100% direct, commission-free booking capture, bypassing the 18% to 22% fee extraction of commercial OTAs.",
          "Sub-15 second automated WhatsApp booking voucher and PDF itinerary dispatch directly to guest handsets.",
          "Curated pre-arrival concierge workflows capturing culinary preferences and horseback carriage bookings.",
        ],
      },
    ],
    results: [
      { label: "Direct Booking Capture", value: "100%", detail: "All prototype inquiries and reservations routed commission-free through the owned digital portal" },
      { label: "Mobile LCP", value: "1.1s", detail: "Sub-second Largest Contentful Paint achieved via Cloudflare Workers edge delivery" },
      { label: "Concierge SLA", value: "< 15s", detail: "Automated WhatsApp booking confirmations and pre-arrival dining preferences" },
      { label: "OTA Commission Saved", value: "~20%", detail: "Full margin retained vs commercial aggregator portal fees" },
    ],
    images: [
      {
        src: "/images/kesari-suite-terrace.jpg",
        alt: "The Kesari Bagh Luxury Aravalli Facing Pool View Suite with private terrace",
      },
      {
        src: "/images/kesari-french-chandelier.jpg",
        alt: "The Kesari Bagh Parisian crystal chandelier private dining salon and epicurean feast",
      },
    ],
    relatedServices: [
      { slug: "web-development", title: "Web Dev & UI/UX Design" },
      { slug: "crm-systems", title: "Custom CRM Systems" },
      { slug: "retention-marketing", title: "Retention Marketing" },
      { slug: "seo-and-geo", title: "Full-Stack SEO & GEO" },
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
