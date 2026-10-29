/**
 * @file src/lib/services.ts
 * @description Unified B2B Service Registry & Schema.org Service/Offer Generators
 *
 * Single source of truth for all 7 Infriva Solutions engineering and growth services.
 * Consumed by:
 * - `src/app/sitemap.ts`
 * - `src/app/services/page.tsx` & `src/app/services/ServicesList.tsx`
 * - `src/app/services/[slug]/page.tsx`
 * - `src/app/page.tsx`
 */

import { SITE_URL, absoluteUrl, buildBreadcrumbJsonLd } from "./site";

export interface ServiceFeature {
  title: string;
  detail: string;
}

export interface ServiceSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface ServicePhase {
  step: string;
  title: string;
  timeline: string;
  description: string;
}

export interface ServiceQA {
  question: string;
  answer: string;
}

export interface ServiceItem {
  slug: string;
  title: string;
  subtitle: string;
  shortDesc: string;
  metaDescription: string;
  image: string;
  imageAlt: string;
  lastModified: string;
  pricing: string;
  priceAmount: number;
  priceCurrency: string;
  billingNote: string;
  timeline: string;
  sla: string;
  fit: string;
  deliverables: string[];
  overview: string[];
  features: ServiceFeature[];
  architectureSections: ServiceSection[];
  phases: ServicePhase[];
  techStack: string[];
  metrics: { label: string; value: string; context: string }[];
  relatedCaseStudy: {
    slug: string;
    title: string;
    summary: string;
    metric: string;
  };
  relatedBlogSlugs: string[];
  qa: ServiceQA[];
}

export const SERVICES_LIST: ServiceItem[] = [
  {
    slug: "web-development",
    title: "Web Dev & UI/UX Design",
    subtitle: "High-Performance Digital Properties Engineered on Next.js, React & PostgreSQL.",
    shortDesc: "High-Performance Digital Properties. Architect a conversion-optimized scalable technical foundation.",
    metaDescription:
      "Custom Next.js web development and luxury B2B UI/UX engineering by Infriva Solutions. Sub-second LCP, technical SEO architecture, and direct CRM integration.",
    image: "/images/glass-panels.jpg",
    imageAlt: "Architectural glass panels representing Infriva Solutions modular Next.js web engineering",
    lastModified: "2026-10-12",
    pricing: "₹80,000+ (One-time)",
    priceAmount: 80000,
    priceCurrency: "INR",
    billingNote: "One-time milestone-based engineering contract",
    timeline: "Launch in 45 Business Days",
    sla: "90-day Post-Launch Zero-Defect Warranty & Core Web Vitals SLA",
    fit: "Startups and enterprises needing robust digital platforms that convert high-intent traffic.",
    deliverables: [
      "UI/UX Strategy & Wireframing",
      "High-Fidelity Design System",
      "React/Next.js Full-Stack Dev",
      "Technical SEO & Core Web Vitals QA",
    ],
    overview: [
      "Most corporate websites fail not because they lack visual polish, but because they are built as disconnected digital brochures rather than revenue-generating systems. Legacy WordPress themes, bloated page builders, and unoptimized client-side bundles introduce 4-to-6 second load delays, fracture mobile navigation, and drop up to 70% of paid and organic traffic before a prospect ever reaches an inquiry form.",
      "At Infriva Solutions, we engineer bespoke web properties from the ground up using Next.js App Router, React Server Components, TypeScript, and PostgreSQL/Supabase. Every interface is choreographed around buyer psychology, sub-second Largest Contentful Paint (LCP), strict WCAG 2.1 AA accessibility, and direct API telemetry into your CRM and WhatsApp sales pipelines.",
      "Whether we are architecting a multi-step travel booking engine like FlyingLyte or a commission-free hospitality reservation platform like StarX Hotel, our engineering standard remains uncompromising: zero layout shift, deterministic server-side rendering for search and AI crawlers, and frictionless conversion pathways.",
    ],
    features: [
      {
        title: "UI/UX Information Architecture & Wireframing (Up to 10 Core Templates)",
        detail:
          "User journey mapping, conversion funnel diagnosis, interactive Figma wireframes, and spatial hierarchy engineered to guide high-intent B2B and B2C buyers from initial landing to inquiry submission.",
      },
      {
        title: "Bespoke Design System & Tokenized Component Library",
        detail:
          "Custom typography scales, high-contrast color tokens, tactile micro-interactions, and responsive grid geometries crafted without generic third-party templates.",
      },
      {
        title: "Next.js 16 & React 19 Full-Stack Engineering",
        detail:
          "Hybrid Static Site Generation (SSG) and Server-Side Rendering (SSR), strongly-typed API route handlers, server-side input validation, rate limiting, and edge-cached asset delivery.",
      },
      {
        title: "Native CRM, Analytics & WhatsApp Webhook Integration",
        detail:
          "Every form submission and interactive event is wired directly into your PostgreSQL database, custom CRM dashboard, GA4, PostHog, and automated WhatsApp Cloud API notification flows.",
      },
      {
        title: "Technical SEO, Schema.org JSON-LD & Core Web Vitals QA",
        detail:
          "Automated XML sitemaps, self-referencing canonical tags, Organization/Service/Breadcrumb JSON-LD graphs, AVIF image optimization, and hardware-accelerated motion.",
      },
    ],
    architectureSections: [
      {
        heading: "Why Legacy Agency Websites Leak Revenue",
        paragraphs: [
          "Traditional web agencies treat design and engineering as isolated handoffs: a designer produces static mockups, and a developer assembles plugins to approximate them. The result is a fragile stack weighed down by twenty third-party scripts, render-blocking stylesheets, and unvalidated contact forms that silently drop leads when an email server throttles.",
          "Our architecture eliminates plugin bloat entirely. By compiling pages at build time via Next.js Static Site Generation and hydrating only interactive islands, your digital property achieves sub-second Time to First Byte (TTFB) and passes Google's Core Web Vitals thresholds (LCP <= 2.5s, INP <= 200ms, CLS <= 0.1) on real 4G mobile devices.",
        ],
        bullets: [
          "Server-rendered semantic HTML ensures Googlebot, GPTBot, and PerplexityBot index 100% of your copy on first crawl.",
          "Zero-CLS font subsetting and AVIF/WebP responsive image pipelines eliminate visual layout jumps during page load.",
          "Hardened HTTP security headers (HSTS, CSP, X-Frame-Options, Referrer-Policy) protect brand equity and enterprise compliance.",
        ],
      },
      {
        heading: "Conversion-First UX & Lead Capture Mechanics",
        paragraphs: [
          "A high-converting digital property removes cognitive load at every scroll depth. We structure landing pages around progressive disclosure: establishing immediate domain authority above the fold, proving capability through quantitative case studies, addressing technical objections inline, and anchoring clear Calls-to-Action at natural decision points.",
          "Instead of dead-end mailto links, we deploy multi-channel intake modules that validate lead payloads server-side, store records in encrypted PostgreSQL tables, trigger instant WhatsApp/email handoffs, and attribute every conversion back to its originating UTM campaign or organic search query.",
        ],
        bullets: [
          "Progressive form validation with server-side rate limiting and honeypot bot protection.",
          "Real-time webhook dispatch to WhatsApp Cloud API and internal sales slack/email channels.",
          "First-party UTM, referrer, and landing-page session telemetry attached to every inquiry record.",
        ],
      },
      {
        heading: "Scalable Edge Infrastructure & Long-Term Maintainability",
        paragraphs: [
          "Enterprise web properties should never require a complete rebuild every eighteen months. We engineer modular component libraries with strict TypeScript contracts so new landing pages, service verticals, or localization routes can be deployed in hours without regression risk.",
          "Every deployment runs through automated CI/CD build verification, static route pre-rendering, and global CDN edge caching—ensuring consistent sub-second response times whether your prospect is browsing from New Delhi, London, Dubai, or New York.",
        ],
        bullets: [
          "Modular design tokens and isolated React Server Components for zero-regression feature expansion.",
          "Automated XML sitemap and Schema.org JSON-LD generation synchronized with route changes.",
          "90-day post-launch engineering warranty covering Core Web Vitals, uptime, and webhook integrity.",
        ],
      },
    ],
    phases: [
      {
        step: "01",
        title: "Discovery, Funnel Audit & System Blueprint",
        timeline: "Days 1–7",
        description:
          "We audit your existing analytics, competitor positioning, search keyword map, and sales intake workflow to produce a comprehensive technical specification and sitemap blueprint.",
      },
      {
        step: "02",
        title: "Wireframing & Brutalist-Luxury UI/UX Design",
        timeline: "Days 8–20",
        description:
          "Interactive Figma prototypes across desktop and mobile viewports, establishing your bespoke typography, color architecture, and conversion component library with two structured revision cycles.",
      },
      {
        step: "03",
        title: "Next.js Full-Stack Development & CRM Wiring",
        timeline: "Days 21–38",
        description:
          "Clean TypeScript implementation, CMS/database modeling in Supabase/PostgreSQL, API route hardening, WhatsApp/email webhook orchestration, and structured data injection.",
      },
      {
        step: "04",
        title: "Stress Testing, CWV Verification & Zero-Downtime Launch",
        timeline: "Days 39–45",
        description:
          "Cross-device QA, Lighthouse and CrUX performance benchmarking, 301 redirect migration, Search Console indexation submission, and 90-day warranty activation.",
      },
    ],
    techStack: ["Next.js 16", "React 19", "TypeScript 5", "Tailwind CSS v4", "PostgreSQL / Supabase", "Framer Motion", "Vercel Edge Network", "PostHog & GA4"],
    metrics: [
      { label: "Target LCP Speed", value: "< 1.5s", context: "Verified on 4G mobile & desktop viewports" },
      { label: "Lead Capture Lift", value: "+40%", context: "Average conversion improvement post-redesign" },
      { label: "Layout Shift (CLS)", value: "< 0.02", context: "Zero-jitter font & media reservations" },
    ],
    relatedCaseStudy: {
      slug: "flyinglyte",
      title: "FlyingLyte Travel Booking Engine",
      summary: "Re-architected a legacy travel site into a Next.js multi-step booking platform integrated with WhatsApp automation.",
      metric: "+40% increase in qualified leads & 1.1s LCP",
    },
    relatedBlogSlugs: [
      "how-we-engineered-sub-50ms-global-ttfb-nextjs-cloudflare-workers",
      "why-customers-trust-some-websites-instantly",
      "why-branding-and-ui-ux-matter-more-than-ever-for-your-website",
      "why-your-website-is-not-getting-leads-and-how-to-fix-it",
    ],
    qa: [
      {
        question: "Why does Infriva build on Next.js instead of WordPress or Webflow?",
        answer:
          "Next.js gives us complete control over server-side HTML rendering, edge caching, API security, and database integrations without relying on vulnerable third-party plugins. This directly translates into faster Core Web Vitals, stronger organic search rankings, and bespoke CRM workflows that template builders cannot support.",
      },
      {
        question: "Will our internal marketing team be able to update content and blog posts?",
        answer:
          "Yes. We architect structured content modules and headless CMS/Supabase dashboards tailored to your team's workflow, allowing non-technical editors to publish articles, update case studies, and manage media while preserving strict design and SEO guardrails.",
      },
      {
        question: "How do you protect existing SEO rankings during a website redesign?",
        answer:
          "Every redesign begins with a full crawl of your current URL inventory. We preserve high-equity URL structures, map 1:1 permanent 301 redirects for any consolidated paths, upgrade on-page Schema.org JSON-LD markup, and verify canonical and sitemap integrity prior to DNS cutover.",
      },
      {
        question: "What is covered under the 90-day post-launch warranty?",
        answer:
          "Our 90-day warranty covers any functional defects, responsive layout regressions, API webhook disruptions, and Core Web Vitals performance tuning on all delivered templates at zero additional cost.",
      },
    ],
  },
  {
    slug: "crm-systems",
    title: "Custom CRM Systems",
    subtitle: "Bespoke Sales Pipeline, Lead Routing & Operations Architecture.",
    shortDesc: "Bespoke customer relationship management architecture designed around your sales workflow.",
    metaDescription:
      "Custom CRM software development by Infriva Solutions. Centralize lead capture, automate WhatsApp & Meta Lead Ads routing, and track revenue pipelines in real time.",
    image: "/images/digital-system.jpg",
    imageAlt: "Custom CRM system architecture and real-time pipeline telemetry built by Infriva Solutions",
    lastModified: "2026-10-12",
    pricing: "₹90,000+ (One-time)",
    priceAmount: 90000,
    priceCurrency: "INR",
    billingNote: "One-time custom engineering & deployment license (zero per-seat SaaS tax)",
    timeline: "Launch in 60 Business Days",
    sla: "90-day Post-Launch Warranty & 99.9% Database Uptime Architecture",
    fit: "Sales-driven organizations outgrowing spreadsheets or rigid off-the-shelf SaaS CRMs.",
    deliverables: [
      "Database Architecture",
      "Automated Lead Routing",
      "API & Webhook Integrations",
      "Custom Executive Dashboards",
    ],
    overview: [
      "Growing businesses lose between 25% and 45% of their inbound revenue to operational friction: leads sit uncontacted in spreadsheets, WhatsApp inquiries get buried on individual sales reps' phones, and Meta or Google Lead Ads require manual CSV exports before anyone makes a call. Meanwhile, enterprise SaaS CRMs charge punishing per-seat licensing fees while forcing your team to adapt to bloated, generic interfaces.",
      "Infriva Solutions engineers custom Customer Relationship Management (CRM) systems modeled around your exact sales stages, quotation rules, role permissions, and fulfillment workflows. Built on PostgreSQL/Supabase with real-time React dashboards, our CRM platforms unify every lead source—website forms, Meta Lead Ads, Google Ads, WhatsApp Cloud API, and direct phone calls—into a single source of truth.",
      "Because you own the underlying software architecture, you eliminate recurring per-user SaaS taxes while gaining sub-second pipeline visibility, automated SLA escalation alerts, and deterministic attribution from first ad click to closed invoice.",
    ],
    features: [
      {
        title: "Relational Database Architecture & Role-Based Access Control (RBAC)",
        detail:
          "Normalized PostgreSQL schemas with Row-Level Security (RLS), audit logging, and granular permissions for executives, sales managers, SDRs, and operations staff.",
      },
      {
        title: "Omnichannel Lead Ingestion & Instant Round-Robin Routing",
        detail:
          "Real-time webhook listeners for website inquiries, Meta Lead Ads, Google Ads, and WhatsApp messages that automatically deduplicate contacts and assign owners by territory, product line, or capacity.",
      },
      {
        title: "Automated Follow-Up Sequences & SLA Escalation Timers",
        detail:
          "Trigger instant WhatsApp and email acknowledgments within seconds of inquiry capture, schedule multi-day nurture tasks, and alert managers if a high-value lead remains untouched past your SLA window.",
      },
      {
        title: "Quotation Builder, Deal Pipeline & Revenue Attribution Dashboards",
        detail:
          "Kanban and tabular pipeline views, proposal generation, conversion velocity analytics, and channel-by-channel ROI reporting.",
      },
      {
        title: "Bi-Directional Third-Party API & ERP Integrations",
        detail:
          "Seamless REST and webhook synchronization with accounting software, payment gateways (Razorpay/Stripe), booking engines, and internal inventory databases.",
      },
    ],
    architectureSections: [
      {
        heading: "Why Off-the-Shelf SaaS CRMs Fail Operational Teams",
        paragraphs: [
          "Off-the-shelf CRM platforms are designed for the lowest common denominator. Small teams drown in hundreds of unused configuration menus, while scaling organizations hit expensive API rate limits and per-seat pricing walls the moment they add field agents or customer support staff.",
          "By architecting a bespoke CRM tailored strictly to your domain model, your sales team interacts only with the fields, statuses, and actions that move deals forward. Adoption rates soar because the software mirrors how your business actually operates.",
        ],
        bullets: [
          "Zero per-seat licensing fees—scale from 5 to 200+ team members without multiplying monthly software bills.",
          "Sub-5-second lead-to-rep notification speed via direct WhatsApp Cloud API and browser push dispatches.",
          "Complete data sovereignty on dedicated PostgreSQL infrastructure with automated daily point-in-time backups.",
        ],
      },
      {
        heading: "End-to-End Attribution From Ad Click to Closed Revenue",
        paragraphs: [
          "Marketing budgets are wasted when ad platforms optimize for cheap form fills rather than qualified buyers. Our CRM architecture captures UTM parameters, `gclid`/`fbclid` click identifiers, and landing page paths on every inbound record, then feeds offline conversion events back to Meta Conversions API and Google Ads so your bidding algorithms optimize for actual closed revenue.",
          "Executive dashboards aggregate deal velocity, rep response times, and revenue-by-campaign in real time—giving leadership deterministic unit economics without manual spreadsheet reconciliation.",
        ],
        bullets: [
          "Automated capture of UTM source, medium, campaign, adset, and click IDs on every inbound contact.",
          "Server-side offline conversion sync to Meta CAPI and Google Ads upon deal qualification or invoice payment.",
          "Real-time rep leaderboard and SLA breach monitoring to enforce sub-5-minute first-response standards.",
        ],
      },
      {
        heading: "Security, Role Governance & Seamless ERP Extensibility",
        paragraphs: [
          "Customer databases are among your company's most sensitive intellectual property. Unlike shared spreadsheet links where a departing employee can export your entire client list in two clicks, our PostgreSQL Row-Level Security (RLS) architecture enforces strict data boundaries at the database kernel level.",
          "Sales representatives see only their assigned territories and active leads, branch managers oversee regional cohorts, and leadership retains full export and audit-log visibility alongside clean REST webhooks into billing and inventory systems.",
        ],
        bullets: [
          "Database-enforced Row-Level Security (RLS) and immutable activity logs for every record mutation.",
          "Automated phone and email deduplication that merges repeat inquiries into a unified customer timeline.",
          "Extensible webhook and REST API layer ready for Razorpay, Stripe, Tally, or custom ERP synchronization.",
        ],
      },
    ],
    phases: [
      {
        step: "01",
        title: "Workflow Mapping & Data Schema Specification",
        timeline: "Days 1–12",
        description:
          "Shadowing your sales and operations teams to document lead sources, qualification criteria, pipeline stages, user roles, and reporting KPIs.",
      },
      {
        step: "02",
        title: "PostgreSQL Database Engineering & API Layer",
        timeline: "Days 13–30",
        description:
          "Implementing relational tables, Row-Level Security policies, webhook ingestion endpoints, deduplication logic, and automated routing engines.",
      },
      {
        step: "03",
        title: "Custom Dashboard UI & Omnichannel Integrations",
        timeline: "Days 31–48",
        description:
          "Building the responsive React interface, kanban pipelines, quotation modules, WhatsApp Cloud API templates, and Meta/Google lead sync.",
      },
      {
        step: "04",
        title: "Legacy Data Migration, Team Training & Go-Live",
        timeline: "Days 49–60",
        description:
          "Sanitizing and importing historical spreadsheet/CRM records, conducting live role-based workshops, and initiating our 90-day post-launch warranty.",
      },
    ],
    techStack: ["PostgreSQL", "Supabase Auth & RLS", "Next.js / React", "TypeScript", "Meta Graph & Lead Ads API", "WhatsApp Cloud API", "Resend Transactional Email"],
    metrics: [
      { label: "Lead Response Speed", value: "< 30 sec", context: "Automated WhatsApp + rep routing" },
      { label: "Pipeline Leakage Reduction", value: "-55%", context: "Zero dropped spreadsheet or chat leads" },
      { label: "Per-Seat SaaS Tax", value: "₹0", context: "Unlimited internal users on owned infrastructure" },
    ],
    relatedCaseStudy: {
      slug: "starx",
      title: "StarX Hotel Direct Booking & Guest CRM",
      summary: "Replaced manual aggregator tracking with a live room-availability CRM and automated WhatsApp guest lifecycle flows.",
      metric: "+35% direct booking share & +22% repeat guest rate",
    },
    relatedBlogSlugs: [
      "postgresql-row-level-security-rls-supabase-nextjs-crm-architecture",
      "why-every-small-business-needs-crm-software",
      "why-your-website-is-not-getting-leads-and-how-to-fix-it",
      "why-your-social-media-gets-attention-but-not-customers",
    ],
    qa: [
      {
        question: "Can you migrate our existing contacts and deal history from Excel, Zoho, or HubSpot?",
        answer:
          "Yes. During Phase 4, we run automated ETL scripts to clean, normalize, deduplicate, and import your historical contacts, company records, notes, and deal stages into your new PostgreSQL database with zero data loss.",
      },
      {
        question: "How does the CRM connect with WhatsApp and Meta Lead Ads?",
        answer:
          "We integrate directly with the official Meta Graph API and WhatsApp Cloud API via HMAC-verified webhooks. The instant a prospect submits a Meta Lead Ad or sends a WhatsApp message, a lead card is created, assigned to a rep, and an automated WhatsApp greeting is dispatched.",
      },
      {
        question: "Is our customer data secure and private?",
        answer:
          "Absolutely. All data is encrypted in transit (TLS 1.3) and at rest (AES-256) on isolated PostgreSQL instances with strict Row-Level Security (RLS), ensuring sales reps only see records permitted by their role.",
      },
      {
        question: "Can the CRM be expanded with new modules as our company grows?",
        answer:
          "Yes. Because the system is built on a modular TypeScript and PostgreSQL foundation, we can seamlessly add invoicing, inventory tracking, field-service check-ins, or AI lead-scoring modules at any time.",
      },
    ],
  },
  {
    slug: "seo-and-geo",
    title: "Full-Stack SEO & GEO",
    subtitle: "Technical Search Engineering & Generative Engine Optimization (AI Search).",
    shortDesc: "Generative Engine Optimization. Dominate search rankings and AI generative engine citations.",
    metaDescription:
      "Full-Stack SEO, AEO, and Generative Engine Optimization (GEO) by Infriva Solutions. Rank on Google Search, AI Overviews, ChatGPT, Perplexity, and Claude.",
    image: "/images/seo-aeo-geo.jpg",
    imageAlt: "Full-Stack SEO, AEO, and Generative Engine Optimization architecture by Infriva Solutions",
    lastModified: "2026-10-12",
    pricing: "₹65,000 / month",
    priceAmount: 65000,
    priceCurrency: "INR",
    billingNote: "Monthly retainer with comprehensive technical, content & authority deliverables",
    timeline: "Technical & Entity Audit by 10th Business Day",
    sla: "6-month Compounding Incubation Roadmap with Monthly Ranking & Citation Telemetry",
    fit: "Established B2B and B2C brands building compounding organic acquisition moats across Google and AI search.",
    deliverables: [
      "Technical SEO & CWV Engineering",
      "GEO & AI Citation Architecture",
      "12 High-Authority Editorial Pieces/Mo",
      "Digital PR, Local SEO & Syndication",
    ],
    overview: [
      "Search discovery has undergone a structural B2B shift. Buyers still rely on Google Search for high-intent commercial queries, but they increasingly evaluate vendors inside AI-powered answer engines—Google AI Overviews, ChatGPT Search, Perplexity, and Claude. Legacy SEO agencies that merely stuff keywords into shallow 500-word blog posts are invisible to modern retrieval-augmented generation (RAG) systems.",
      "Infriva Solutions executes Full-Stack Search Engineering that unifies Traditional Technical SEO, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO). Because we are full-stack developers as well as search strategists, we implement code-level fixes directly: repairing canonical origin splits, eliminating SSR rendering bottlenecks, authoring rich Schema.org JSON-LD entity graphs, and deploying machine-readable `/llms.txt` documentation.",
      "On top of this technical foundation, our editorial team produces 3 deep-dive, E-E-A-T-verified articles per week mapped to commercial topic clusters, supported by multi-platform syndication across LinkedIn, Medium, Instagram, and authoritative industry backlinks.",
    ],
    features: [
      {
        title: "Code-Level Technical SEO & Core Web Vitals Remediation",
        detail:
          "Crawl budget optimization, canonical/sitemap alignment, SSR HTML visibility audits, internal link graph engineering, and LCP/INP/CLS speed optimization.",
      },
      {
        title: "Generative Engine Optimization (GEO) & Entity Schema Graphs",
        detail:
          "Comprehensive JSON-LD structured data (Organization, Service, Offer, BlogPosting, BreadcrumbList), `/llms.txt` & `/llms-full.txt` deployment, and AI crawler accessibility for GPTBot, ClaudeBot, and PerplexityBot.",
      },
      {
        title: "High-Depth Content Marketing (3 SEO/AEO-Optimized Articles per Week)",
        detail:
          "12 research-backed, 1,200+ word editorial pieces per month structured around semantic topic clusters, direct answer blocks, and buyer decision comparisons.",
      },
      {
        title: "Local SEO, Google Business Profile & Citation Consistency",
        detail:
          "NAP (Name, Address, Phone) standardization, local landing page architecture, review velocity workflows, and Tier-1 business directory citations.",
      },
      {
        title: "Multi-Channel Social & SMO Syndication",
        detail:
          "Systematic distribution of core editorial insights across LinkedIn, Medium, Facebook, and Instagram to build brand mention velocity and off-page entity authority.",
      },
    ],
    architectureSections: [
      {
        heading: "How SEO, AEO, and GEO Work Together as One System",
        paragraphs: [
          "Traditional SEO earns crawlability, indexation, and topical authority in Google's core index. Answer Engine Optimization (AEO) structures headings, tables, and concise definition blocks so search engines can extract direct answers for featured snippets and voice queries.",
          "Generative Engine Optimization (GEO) ensures that when an LLM synthesizes a vendor recommendation—such as 'best custom CRM and Next.js agency in India'—your brand's pricing, SLAs, case study metrics, and entity relationships are unambiguously verifiable in both structured JSON-LD and clean markdown endpoints.",
        ],
        bullets: [
          "Semantic Topic Clustering: Pillar service pages connected to supporting problem-solution and comparison articles via contextual internal anchors.",
          "First-Hand E-E-A-T Signals: Named author bylines, quantitative client case studies, and transparent pricing benchmarks.",
          "Zero-Latency Indexing: Automated XML sitemaps with accurate ISO `lastModified` timestamps and Google Search Console inspection workflows.",
        ],
      },
      {
        heading: "Compounding Organic ROI vs. Rising Paid Click Costs",
        paragraphs: [
          "While paid search ads stop delivering traffic the hour you pause spend, a properly engineered organic search moat compounds month over month. By capturing both early-stage research queries and bottom-of-funnel commercial evaluations, our Full-Stack SEO & GEO program lowers your blended Customer Acquisition Cost (CAC) and insulates your pipeline from ad auction volatility.",
          "Every editorial asset is engineered with self-contained 40-to-60 word answer capsules immediately following question-based H2 headings—maximizing extraction probability in Google AI Overviews and Perplexity citations.",
        ],
        bullets: [
          "12 long-form editorial articles per month (3/week) targeting commercial-intent B2B and B2C search clusters.",
          "Passage-level citability engineering with comparison tables, benchmark data, and FAQ schema alignment.",
          "Monthly Search Console query mining to promote position 4–15 keywords onto the top of Page 1.",
        ],
      },
      {
        heading: "Entity Authority, Digital PR & AI Crawler Governance",
        paragraphs: [
          "Large language models and modern search engines evaluate brands as interconnected Knowledge Graph entities rather than isolated domains. When your company name, founders, service offerings, and client outcomes are consistently corroborated across your website, LinkedIn, Medium, and industry directories, AI citation confidence rises dramatically.",
          "We maintain explicit `robots.txt` policies for `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, and `Google-Extended`, paired with canonical `/llms.txt` and `/llms-full.txt` documentation so generative search agents always retrieve accurate, up-to-date commercial facts.",
        ],
        bullets: [
          "Unified `@graph` JSON-LD linking `Organization`, `Service`, `Offer`, `BlogPosting`, and `BreadcrumbList` nodes.",
          "Cross-platform SMO syndication across LinkedIn, Medium, Facebook, and Instagram for off-page entity signals.",
          "Local SEO and Google Business Profile optimization to capture high-intent geographic and 'near me' queries.",
        ],
      },
    ],
    phases: [
      {
        step: "01",
        title: "Full Technical, Schema & AI Citability Audit",
        timeline: "Days 1–10",
        description:
          "Comprehensive 7-category diagnostic covering crawlability, canonicals, Core Web Vitals, Schema.org gaps, competitor keyword gaps, and AI engine citation baselines.",
      },
      {
        step: "02",
        title: "Code-Level On-Page, JSON-LD & GEO Remediation",
        timeline: "Days 11–30",
        description:
          "Deploying metadata overhauls, heading hierarchy repairs, JSON-LD entity graphs, `/llms.txt` endpoints, and service page depth expansions.",
      },
      {
        step: "03",
        title: "Topic Cluster Production & Authority Link Acquisition",
        timeline: "Months 2–4",
        description:
          "Publishing 3 deep editorial articles per week, building contextual internal link webs, executing SMO syndication, and earning authoritative backlinks.",
      },
      {
        step: "04",
        title: "Conversion Rate Optimization & Query Expansion",
        timeline: "Months 5–6+",
        description:
          "Mining Google Search Console quick-win queries (positions 4–15), refreshing high-impression assets, and scaling commercial landing pages.",
      },
    ],
    techStack: ["Google Search Console API", "PageSpeed Insights & CrUX", "Schema.org JSON-LD", "llms.txt Standard", "Ahrefs / SEMrush Intelligence", "Next.js Metadata & Sitemap APIs"],
    metrics: [
      { label: "Editorial Output", value: "12 / mo", context: "3 deep SEO/GEO articles published weekly" },
      { label: "Audit Delivery", value: "10 Days", context: "Full technical & keyword roadmap by business day 10" },
      { label: "Search Coverage", value: "360°", context: "Google SERPs, AI Overviews, ChatGPT & Perplexity" },
    ],
    relatedCaseStudy: {
      slug: "flyinglyte",
      title: "FlyingLyte Organic & Booking Architecture",
      summary: "Combined technical Next.js SEO architecture with high-intent travel package landing pages and 1.1s LCP speed.",
      metric: "+40% lead growth & 1.1s LCP",
    },
    relatedBlogSlugs: [
      "seo-aeo-geo-three-strategies",
      "seo-vs-google-ads-which-is-better-for-your-business",
      "why-your-website-is-not-getting-leads-and-how-to-fix-it",
    ],
    qa: [
      {
        question: "Why does SEO require a 6-month incubation period?",
        answer:
          "Search engines and AI retrieval indexes evaluate domain authority, content velocity, and user engagement signals over multiple crawl cycles. Months 1–2 establish technical perfection and initial topical clusters; months 3–4 build ranking momentum into positions 4–15; and months 5–6+ compound those rankings into top-3 commercial traffic and AI citations.",
      },
      {
        question: "What is Generative Engine Optimization (GEO) and how is it different from SEO?",
        answer:
          "Traditional SEO optimizes web pages to rank in blue-link search results. GEO optimizes your brand's entity data, factual density, citations, schema markup, and `/llms.txt` documentation so AI assistants (ChatGPT, Perplexity, Google AI Overviews, Claude) accurately cite and recommend your business when users ask conversational buying questions.",
      },
      {
        question: "Do your developers implement the technical SEO fixes, or just hand us a PDF?",
        answer:
          "We implement the fixes directly in your codebase. Unlike advisory-only agencies that hand over a generic audit PDF, our full-stack engineers write the schema markup, fix the canonical tags, optimize the images, and resolve Core Web Vitals bottlenecks.",
      },
      {
        question: "How do you measure SEO and GEO success each month?",
        answer:
          "We track non-branded organic clicks, high-intent keyword rankings, Google Search Console impression velocity, AI citation visibility across target prompts, and—most importantly—attributed CRM inquiries generated by organic search.",
      },
    ],
  },
  {
    slug: "paid-advertising",
    title: "Paid Advertising Management",
    subtitle: "Algorithmic Meta Ads & High-Intent Google Search Acquisition Engine.",
    shortDesc: "Meta & Google Ads Engine. Accelerate predictable customer acquisition and revenue generation.",
    metaDescription:
      "Performance marketing and paid advertising management by Infriva Solutions. Algorithmic Meta Ads and Google Search campaigns wired to CRM revenue attribution.",
    image: "/images/titanium-gears.jpg",
    imageAlt: "Precision titanium gears representing Infriva Solutions algorithmic Meta and Google Ads management",
    lastModified: "2026-10-12",
    pricing: "₹50,000 / month + 10% Ad Spend",
    priceAmount: 50000,
    priceCurrency: "INR",
    billingNote: "₹50,000 base monthly management retainer plus 10% of managed media spend",
    timeline: "Campaign Architecture & Launch in Week 1",
    sla: "90-day Algorithmic Learning & Bi-Weekly Attribution Reporting",
    fit: "Growth-focused businesses requiring immediate, scalable customer acquisition and measurable ROAS.",
    deliverables: [
      "Meta Ads Funnel Architecture",
      "Google Search & PMax Bidding",
      "Ad Creative & Copywriting Decks",
      "Server-Side CAPI & CRM Attribution",
    ],
    overview: [
      "Most paid media budgets are burned on broad, unsegmented targeting, weak creative hooks, and broken conversion tracking. When ad platforms only track top-of-funnel link clicks or low-quality form fills, their bidding algorithms optimize for cheap traffic that never closes—leaving your sales team frustrated and your Customer Acquisition Cost (CAC) underwater.",
      "Infriva Solutions engineers Paid Advertising as a closed-loop acquisition system across Meta (Instagram & Facebook) and Google Ads (High-Intent Search, Performance Max, and YouTube). We combine conversion-tested creative production with server-side Meta Conversions API (CAPI), enhanced Google Ads conversion tracking, and direct CRM pipeline feedback.",
      "By feeding real lead-qualification and closed-deal signals back into the ad auctions, our campaigns train Meta and Google's machine learning models to bid aggressively for your highest-LTV buyer profiles while cutting wasted spend on non-converting search terms and placements.",
    ],
    features: [
      {
        title: "Full-Funnel Meta Ads Architecture (Prospecting, Retargeting & Advantage+)",
        detail:
          "Structured campaign hierarchies separating cold creative testing, mid-funnel social proof retargeting, and high-intent lead generation with strict frequency and CPA guardrails.",
      },
      {
        title: "High-Intent Google Search, Exact-Match & Negative Keyword Engineering",
        detail:
          "Granular ad groups targeting bottom-of-funnel commercial queries, aggressive negative keyword pruning to eliminate informational waste, and high-relevance ad extensions.",
      },
      {
        title: "Ad Creative Direction, Copywriting Decks & Hook Testing",
        detail:
          "Complete static, carousel, and short-form video script decks engineered around buyer pain points, quantitative proof, and clear value propositions.",
      },
      {
        title: "Server-Side Conversion Tracking (Meta CAPI & Google Enhanced Conversions)",
        detail:
          "Bypasses browser ad-blockers and iOS privacy signal loss by streaming verified lead and purchase events directly from your server/CRM to Meta and Google.",
      },
      {
        title: "Bi-Weekly Performance Attribution & Budget Reallocation Sprints",
        detail:
          "Transparent reporting tying ad spend directly to qualified CRM leads, cost-per-qualified-lead (CPQL), and return on ad spend (ROAS).",
      },
    ],
    architectureSections: [
      {
        heading: "Signal Engineering: Why Server-Side Attribution Wins the Auction",
        paragraphs: [
          "Modern ad platforms rely on machine learning models that are only as smart as the conversion signals you feed them. Standard browser pixels lose 20–35% of conversion data due to cookie restrictions and ad blockers, blinding the algorithm.",
          "We deploy server-side event pipelines that capture every inquiry, WhatsApp trigger, and CRM stage progression, passing hashed first-party match keys back to Meta and Google. Better signal fidelity means faster learning phases and lower cost per acquisition.",
        ],
        bullets: [
          "Exact-match commercial intent capture on Google Search paired with demand-generation creative on Meta.",
          "Dedicated landing page alignment so ad copy, hero headlines, and intake forms share 100% message match.",
          "Automated negative keyword and placement exclusions updated weekly to protect media efficiency.",
        ],
      },
      {
        heading: "Creative Velocity as the Primary Targeting Lever",
        paragraphs: [
          "In algorithmic media buying, your creative is your targeting. Each month we systematically test distinct angles—problem agitation, architectural authority, case study proof, and direct offer comparisons—identifying winning ads and scaling budget behind proven performers.",
          "Rather than guessing which visual or headline will resonate, we run structured testing matrices that isolate hook retention rates, thumbstop ratios, and landing-page conversion velocity before committing major media spend.",
        ],
        bullets: [
          "Multi-format creative testing across static comparison cards, founder reels, and case study carousels.",
          "Hook-rate (3-second view) and hold-rate diagnostics to replace fatigued creatives before CPA rises.",
          "Direct copywriting alignment with buyer objections uncovered in your sales team's CRM call notes.",
        ],
      },
      {
        heading: "Landing Page Speed & Down-Funnel Revenue Governance",
        paragraphs: [
          "Sending paid traffic to a slow, generic homepage is the fastest way to destroy Return on Ad Spend (ROAS). Every 1-second delay in mobile page load drops paid conversion rates by up to 20%, inflating your effective Cost Per Lead even when your ads have high click-through rates.",
          "Because our media buyers work alongside our Next.js and CRM engineers, we optimize the entire post-click experience—ensuring sub-second landing page loads, instant WhatsApp lead follow-up, and bi-weekly budget reallocation toward highest-margin campaigns.",
        ],
        bullets: [
          "Sub-1.5s mobile landing page architecture to maximize Google Ads Quality Score and lower CPCs.",
          "Instant WhatsApp and CRM webhook routing so paid leads are contacted within 60 seconds of submission.",
          "Bi-weekly executive attribution reviews tracking Cost Per Qualified Lead (CPQL) and closed-deal ROAS.",
        ],
      },
    ],
    phases: [
      {
        step: "01",
        title: "Account Audit, Unit Economics & Tracking Setup",
        timeline: "Week 1",
        description:
          "Auditing historical ad accounts, defining target CAC/ROAS thresholds, configuring GA4, Meta CAPI, and CRM UTM capture, and preparing launch creative decks.",
      },
      {
        step: "02",
        title: "Campaign Launch & Creative Angle Testing",
        timeline: "Weeks 2–4",
        description:
          "Deploying segmented Google Search and Meta campaigns, testing initial creative hooks and landing page variants, and pruning wasted search terms.",
      },
      {
        step: "03",
        title: "Algorithmic Calibration & Down-Funnel Optimization",
        timeline: "Month 2",
        description:
          "Optimizing bidding strategies (tCPA / tROAS) around qualified CRM leads rather than raw clicks, and scaling winning ad sets.",
      },
      {
        step: "04",
        title: "Horizontal Scale & Retargeting Ecosystem",
        timeline: "Month 3+",
        description:
          "Expanding into lookalike audiences, YouTube/Reels video placements, and multi-touch retargeting sequences.",
      },
    ],
    techStack: ["Meta Ads Manager & CAPI", "Google Ads & Tag Manager", "Google Analytics 4", "PostHog Funnel Telemetry", "Custom CRM Offline Conversion Sync"],
    metrics: [
      { label: "Launch Velocity", value: "7 Days", context: "Strategy, tracking & campaign go-live in Week 1" },
      { label: "Reporting Cadence", value: "Bi-Weekly", context: "Full-funnel CPA, CPQL & ROAS attribution" },
      { label: "Incubation Window", value: "90 Days", context: "Algorithmic learning & creative compounding" },
    ],
    relatedCaseStudy: {
      slug: "starx",
      title: "StarX Hotel Direct Acquisition Engine",
      summary: "Paired high-intent Google Search campaigns with a luxury direct-booking web property to bypass OTA commissions.",
      metric: "+35% direct bookings & ~18% OTA commission saved",
    },
    relatedBlogSlugs: [
      "meta-conversions-api-nextjs-postgresql-server-side-tracking",
      "seo-vs-google-ads-which-is-better-for-your-business",
      "how-digital-marketing-helps-startups-build-their-brand",
      "why-your-website-is-not-getting-leads-and-how-to-fix-it",
    ],
    qa: [
      {
        question: "Should we start with Google Ads, Meta Ads, or both?",
        answer:
          "If prospects are actively searching for your exact service category with urgent buying intent, Google Search Ads capture that demand immediately. If your product requires visual demonstration or category education, Meta Ads generate demand and retarget site visitors. Under our management retainer, we orchestrate both channels so Meta builds awareness and retargeting while Google captures high-intent searchers.",
      },
      {
        question: "How is the ₹50,000/month + 10% spend pricing structured?",
        answer:
          "The ₹50,000 monthly base retainer covers full campaign strategy, ad copywriting, creative direction, server-side conversion tracking, and bi-weekly optimization across Meta and Google. The 10% variable fee applies directly to the media spend managed through your ad accounts, aligning our incentives with efficient scaling.",
      },
      {
        question: "Do we retain full ownership of our Meta and Google ad accounts?",
        answer:
          "Yes, 100%. All campaigns, pixels, audience lists, and historical conversion data live inside your own Business Manager and Google Ads accounts, billed directly to your corporate payment method.",
      },
      {
        question: "Why is a 90-day incubation period recommended for paid media?",
        answer:
          "Month 1 establishes clean conversion tracking and tests initial creative and keyword hypotheses; Month 2 eliminates underperforming segments and feeds qualified CRM lead data back into bidding algorithms; Month 3+ scales budget into statistically proven, profitable ad sets.",
      },
    ],
  },
  {
    slug: "retention-marketing",
    title: "Retention Marketing",
    subtitle: "WhatsApp Cloud API Automation & Customer Lifetime Value (LTV) Ecosystem.",
    shortDesc: "WhatsApp Add-On Ecosystem. Maximize LTV and repeat purchase rates through personalized messaging.",
    metaDescription:
      "WhatsApp Cloud API retention marketing and lifecycle automation by Infriva Solutions. Abandoned cart recovery, broadcast campaigns, and win-back flows.",
    image: "/images/champagne-sphere.jpg",
    imageAlt: "Golden sphere representing compounding Customer Lifetime Value through Infriva retention marketing",
    lastModified: "2026-10-12",
    pricing: "₹25,000 / month",
    priceAmount: 25000,
    priceCurrency: "INR",
    billingNote: "Monthly retention orchestration retainer (official WhatsApp API ecosystem)",
    timeline: "Automation Logic Maps & Live Flows by Week 2",
    sla: "90-day Incubation, < 8hr Operational Response SLA",
    fit: "E-commerce brands, hospitality properties, and high-volume service providers maximizing repeat revenue.",
    deliverables: [
      "4 Targeted Broadcasts / Month",
      "Abandoned Funnel / Cart Triggers",
      "Automated Welcome Series",
      "Lapsed Customer Win-Back Flows",
    ],
    overview: [
      "Acquiring a first-time prospect via paid ads or organic search is the most expensive part of your growth funnel—yet most businesses let 80% of their hard-won leads and past customers go cold after a single interaction. Traditional email newsletters suffer from 15% open rates and promotional inbox filtering, leaving massive repeat revenue on the table.",
      "Infriva Solutions engineers high-conversion Retention Marketing ecosystems powered by the official Meta WhatsApp Cloud API and CRM event triggers. With 90%+ message open rates and instant mobile visibility, WhatsApp is the highest-leverage retention channel in India and global growth markets when architected with precision rather than spam.",
      "We map your entire customer lifecycle—from instant welcome onboarding and abandoned booking/cart recovery to post-purchase review capture and 60-day win-back sequences—turning one-time inquiries into compounding Customer Lifetime Value (LTV).",
    ],
    features: [
      {
        title: "4 Segmented High-Conversion Broadcast Campaigns per Month",
        detail:
          "Audience-segmented WhatsApp campaigns (VIP buyers, warm inquiries, seasonal offers) with Meta-approved interactive button templates and UTM revenue tracking.",
      },
      {
        title: "Real-Time Abandoned Cart & Drop-Off Recovery Triggers",
        detail:
          "Event-driven webhooks that detect when a user abandons a booking step, checkout, or inquiry form and dispatch a contextual, helpful recovery message within 15–60 minutes.",
      },
      {
        title: "Multi-Step Welcome & Brand Onboarding Sequences",
        detail:
          "Automated first-touch sequences that deliver instant value—catalogs, case studies, booking confirmations, or consultation scheduling—while intent is at its peak.",
      },
      {
        title: "Post-Purchase Review, Referral & Win-Back Automation",
        detail:
          "Timed check-ins that capture 5-star Google/platform reviews from satisfied clients and reactivate dormant customers at 30, 60, and 90-day intervals.",
      },
      {
        title: "AI Concierge & Human Escalation Handoff",
        detail:
          "Optional integration with our Gemini-powered conversational AI webhook to answer common product/pricing questions 24/7 and route hot buyers to human sales reps.",
      },
    ],
    architectureSections: [
      {
        heading: "Event-Driven Lifecycle Engineering vs. Bulk Spam",
        paragraphs: [
          "Unsegmented bulk blasts get phone numbers banned and erode brand trust. Our retention architecture is strictly permission-based and behavior-triggered: messages fire in response to specific customer actions stored in your CRM or booking engine.",
          "By combining interactive quick-reply buttons, personalized dynamic variables, and strict frequency capping, your WhatsApp channel feels like a white-glove concierge rather than a broadcast megaphone.",
        ],
        bullets: [
          "Official Meta WhatsApp Cloud API configuration with verified business profile and template approval management.",
          "Direct webhook integration with Next.js forms, custom CRMs, Shopify, and booking engines.",
          "Granular cohort analytics tracking delivery rate, read rate, button click-through, and attributed repeat revenue.",
        ],
      },
      {
        heading: "Compounding Unit Economics Through Repeat Purchase Velocity",
        paragraphs: [
          "Increasing customer retention by just 15–20% can double net profitability because repeat bookings and referrals carry near-zero acquisition cost. On both FlyingLyte (12 automated WhatsApp flows) and StarX Hotel (+22% repeat guest rate), automated lifecycle messaging proved to be the fastest lever for margin expansion.",
          "By syncing customer transaction histories with automated 30, 60, and 90-day win-back triggers, we turn dormant accounts into predictable re-order cycles while collecting authentic 5-star Google and platform reviews at peak customer satisfaction moments.",
        ],
        bullets: [
          "Multi-touch win-back workflows that trigger personalized re-engagement incentives for lapsed buyers.",
          "Post-fulfillment review capture sequences with direct 1-tap Google Business Profile review deep links.",
          "Real-time revenue attribution linking WhatsApp button clicks directly to completed payment gateways.",
        ],
      },
      {
        heading: "Enterprise Compliance, Template Governance & Ban Prevention",
        paragraphs: [
          "Operating on Meta's official WhatsApp Business Platform requires strict adherence to template categories (Authentication, Utility, and Marketing) and quality score monitoring. A sudden drop in recipient sentiment can restrict messaging tier limits or trigger template rejections.",
          "We manage end-to-end Meta template submissions, opt-in consent verification, and variable payload sanitization—guaranteeing your business number maintains High Quality status while scaling to tens of thousands of conversations per day.",
        ],
        bullets: [
          "Official Meta Business Manager verification and green-tick official business account guidance.",
          "Strict opt-in compliance, automatic unsubscribe (`STOP`) keyword handling, and rate-limit buffering.",
          "Fail-safe fallback webhooks to email or SMS in the rare event of mobile network delivery failures.",
        ],
      },
    ],
    phases: [
      {
        step: "01",
        title: "Lifecycle Audit & WhatsApp Cloud API Provisioning",
        timeline: "Week 1",
        description:
          "Verifying your Meta Business Manager and WhatsApp Cloud API phone number, auditing customer cohorts, and identifying high-leakage drop-off points.",
      },
      {
        step: "02",
        title: "Automation Logic Maps & Template Approvals",
        timeline: "Week 2",
        description:
          "Designing decision-tree logic maps for Welcome, Abandoned Funnel, Post-Purchase, and Win-Back flows, and securing Meta template approvals.",
      },
      {
        step: "03",
        title: "Webhook Wiring & Broadcast Execution",
        timeline: "Weeks 3–8",
        description:
          "Connecting CRM/website event triggers to live WhatsApp dispatches and launching 4 monthly segmented broadcast campaigns.",
      },
      {
        step: "04",
        title: "Cohort Conversion Tuning & LTV Scaling",
        timeline: "Weeks 9–12+",
        description:
          "A/B testing message timing, interactive CTA buttons, and offer framing to maximize repeat conversion rates and review generation.",
      },
    ],
    techStack: ["Meta WhatsApp Cloud API", "HMAC-SHA256 Webhook Engine", "Google Gemini 2.5 Flash Concierge", "PostgreSQL / Supabase Cohort Store", "UTM Revenue Attribution"],
    metrics: [
      { label: "Message Open Rate", value: "90%+", context: "Compared to ~18% industry average on email" },
      { label: "Repeat Guest Lift", value: "+22%", context: "Proven on StarX Hotel post-stay WhatsApp flows" },
      { label: "Logic Map Delivery", value: "Week 2", context: "Full automation blueprint & template setup" },
    ],
    relatedCaseStudy: {
      slug: "starx",
      title: "StarX Hotel Automated Guest Lifecycle",
      summary: "Deployed automated WhatsApp booking confirmations, pre-arrival concierges, and post-stay review/repeat-booking sequences.",
      metric: "+22% repeat guest rate & +0.4★ review score lift",
    },
    relatedBlogSlugs: [
      "how-to-build-a-whatsapp-cloud-api-recovery-engine-nextjs-postgresql",
      "why-every-small-business-needs-crm-software",
      "why-your-social-media-gets-attention-but-not-customers",
      "why-customers-trust-some-websites-instantly",
    ],
    qa: [
      {
        question: "Do you use the official Meta WhatsApp Cloud API or unofficial third-party tools?",
        answer:
          "We build exclusively on the official Meta WhatsApp Cloud API. Unofficial scraping or browser-automation tools violate Meta's terms and result in permanent phone number bans. Official Cloud API ensures high throughput, verified green-tick eligibility, interactive buttons, and enterprise compliance.",
      },
      {
        question: "Can automated WhatsApp flows hand off a conversation to our human sales team?",
        answer:
          "Yes. When a customer replies with a custom question or clicks a high-intent 'Speak to Specialist' button, our webhook logs the transcript in your CRM and immediately alerts the assigned sales rep to take over the thread.",
      },
      {
        question: "How do abandoned booking or cart triggers work?",
        answer:
          "When a user enters their contact details on Step 1 of a booking or checkout form but does not complete final submission within a set window (e.g., 20 minutes), our backend triggers a helpful WhatsApp message offering to assist or restore their session with a single tap.",
      },
      {
        question: "Are Meta conversation charges included in the ₹25,000/month retainer?",
        answer:
          "The ₹25,000/month retainer covers strategy, copywriting, template management, webhook maintenance, and execution of all automated flows and 4 monthly broadcasts. Meta's per-conversation utility/marketing message fees are billed at cost directly to your Meta Business account.",
      },
    ],
  },
  {
    slug: "premium-content",
    title: "Premium Content Creation",
    subtitle: "Authority-Building Editorial Blog, Social & Short-Form Video Production.",
    shortDesc: "Blog, Social & Video Distribution. Enhance brand authority and drive high-intent organic traffic.",
    metaDescription:
      "B2B and luxury brand content creation by Infriva Solutions. Long-form editorial blogs, daily multi-platform social content, and short-form video production.",
    image: "/images/marketing-megaphone.jpg",
    imageAlt: "Editorial content strategy and multi-channel brand distribution by Infriva Solutions",
    lastModified: "2026-10-12",
    pricing: "₹60,000 / month",
    priceAmount: 60000,
    priceCurrency: "INR",
    billingNote: "Monthly all-in editorial, design & short-form video production retainer",
    timeline: "Content Strategy in Week 1, Ongoing Weekly Delivery",
    sla: "Response < 2hrs, Guaranteed > 99.9% Publishing Schedule Adherence",
    fit: "Brands looking to establish category authority, organic search visibility, and multi-channel buyer trust.",
    deliverables: [
      "Blog Production (2 Deep Posts/Mo)",
      "Daily Social Media (3 Platforms)",
      "Short-Form Video (2 Reels/Shorts/Mo)",
      "Competitor Content Gap Analysis",
    ],
    overview: [
      "In high-consideration B2B and premium consumer markets, buyers rarely convert on first contact. Before scheduling a consultation or submitting an RFx, decision-makers read your articles, inspect your LinkedIn and Instagram presence, and evaluate whether your team actually understands their operational problems. Generic AI-generated filler erodes that trust instantly.",
      "Infriva Solutions' Premium Content Creation practice functions as your dedicated editorial and multimedia newsroom. Every month, we conduct competitor content gap analysis to identify the exact questions your buyers are asking, then produce 2 authoritative 1,000+ word blog essays, daily visual and written posts across 3 social platforms, and 2 high-retention short-form vertical videos.",
      "Every piece of content is engineered around a unified narrative spine: one core strategic insight adapted natively for search engines, executive LinkedIn feeds, and visual social discovery—driving measurable traffic back to your conversion landing pages.",
    ],
    features: [
      {
        title: "Long-Form Editorial Blog Production (2 Posts/Month, 1,000+ Words Each)",
        detail:
          "Research-driven, SEO/AEO-structured articles written with domain authority, clear H2/H3 hierarchy, internal service links, and custom editorial graphics.",
      },
      {
        title: "Daily Multi-Platform Social Media Distribution (Across 3 Platforms)",
        detail:
          "Native copywriting, carousel design, and daily publishing across LinkedIn, Instagram, and X/Facebook tailored to each platform's algorithmic format.",
      },
      {
        title: "High-Retention Short-Form Video Production (2 Videos/Month)",
        detail:
          "Hook scripting, visual storyboarding, kinetic typography, colour grading, and sound design for Instagram Reels, YouTube Shorts, and LinkedIn Video.",
      },
      {
        title: "Quarterly & Monthly Competitor Content Gap Analysis",
        detail:
          "Systematic intelligence on competitor keywords, high-performing social formats, and unaddressed buyer objections in your category.",
      },
      {
        title: "Conversion Funnel & CTA Alignment",
        detail:
          "Every article, carousel, and video is mapped to a specific stage of awareness (Attention -> Interest -> Trust -> Action) with tracked links into your website and CRM.",
      },
    ],
    architectureSections: [
      {
        heading: "Content as a Compounding Trust Asset",
        paragraphs: [
          "Random social posts and disconnected blog articles fail because they treat content as a daily chore rather than an architectural system. We organize your brand around 3 to 4 core content pillars that directly reinforce your commercial services.",
          "When a prospect reads a deep-dive article on your website, sees a matching framework carousel on LinkedIn, and watches a concise breakdown reel on Instagram, cognitive fluency compounds—making your company the obvious, low-risk choice when they are ready to buy.",
        ],
        bullets: [
          "100% human-edited, brand-aligned voice guidelines—never unreviewed generic templates.",
          "Structured for both human executives and AI search summarization (AEO/GEO ready).",
          "Pre-scheduled monthly content calendars with clear review windows and zero missed publishing dates.",
        ],
      },
      {
        heading: "Bridging the Gap Between Engagement and Pipeline",
        paragraphs: [
          "Likes and views are vanity metrics unless they move prospects closer to a commercial conversation. We embed contextual Calls-to-Action, lead magnets, and direct consultation pathways into every content pillar so audience attention converts into tracked CRM inquiries.",
          "Every flagship article includes dedicated summary boxes, quantitative data tables, and internal links directing high-intent readers to your relevant engineering or growth service pages.",
        ],
        bullets: [
          "Conversion-focused anchor texts mapped directly to high-intent service inquiry funnels.",
          "Downloadable strategic briefs and comparison frameworks that capture executive contact details.",
          "UTM tracking parameters attached to all multi-channel social links for granular pipeline attribution.",
        ],
      },
      {
        heading: "Multimedia Adaptation & Algorithmic Hook Choreography",
        paragraphs: [
          "Producing high-depth content is only half the battle; packaging it for platform-native consumption dictates whether it gets seen. We transform complex engineering, legal, or financial concepts into engaging visual carousels and dynamic vertical video edits.",
          "Our video production workflow isolates the critical 3-second hook, removes dead air with kinetic jump cuts and typographic callouts, and closes with a clear action prompt—maximizing completion rates on Reels, YouTube Shorts, and LinkedIn.",
        ],
        bullets: [
          "3-second hook testing matrices tailored to Instagram Reels, YouTube Shorts, and LinkedIn video.",
          "Custom editorial infographics and carousel typography aligned with your brand guidelines.",
          "Rigorous multi-round QA ensuring zero typos, factual accuracy, and on-time weekly publishing.",
        ],
      },
    ],
    phases: [
      {
        step: "01",
        title: "Competitor Gap Audit & Editorial Pillar Architecture",
        timeline: "Week 1",
        description:
          "Auditing category competitors, defining your brand voice and visual kit, and locking in the Month 1 editorial and video calendar.",
      },
      {
        step: "02",
        title: "Long-Form Writing, Carousel Design & Video Scripting",
        timeline: "Weeks 2–3",
        description:
          "Drafting 1,000+ word SEO articles, designing daily social carousels/statics, and producing short-form video edits for client review.",
      },
      {
        step: "03",
        title: "Multi-Platform Publishing & Community Signal Monitoring",
        timeline: "Ongoing Daily",
        description:
          "Executing daily distribution across 3 platforms, publishing on-site blog essays with full schema markup, and monitoring audience engagement.",
      },
      {
        step: "04",
        title: "Monthly Attribution Review & Pillar Refinement",
        timeline: "Month-End",
        description:
          "Analyzing organic read time, saves, shares, profile visits, and website referral conversions to double down on top-performing topics.",
      },
    ],
    techStack: ["Figma Design Systems", "Adobe Premiere & After Effects", "Next.js MDX / CMS Publishing", "Search Console Keyword Intelligence", "UTM Funnel Tracking"],
    metrics: [
      { label: "Editorial Depth", value: "1,000+ wds", context: "2 flagship search-optimized articles per month" },
      { label: "Social Cadence", value: "Daily", context: "Consistent presence across 3 core platforms" },
      { label: "SLA Response", value: "< 2 hrs", context: "Dedicated editorial & account communication" },
    ],
    relatedCaseStudy: {
      slug: "flyinglyte",
      title: "FlyingLyte Brand & Content Authority",
      summary: "Aligned destination content, social proof, and booking UX to transform visitor trust into a 40% increase in leads.",
      metric: "+40% lead capture & -55% funnel drop-off",
    },
    relatedBlogSlugs: [
      "how-to-build-a-brand-from-scratch-start-with-strategy",
      "why-some-brands-feel-instantly-right-the-psychology-behind-great-branding",
      "why-your-social-media-gets-attention-but-not-customers",
    ],
    qa: [
      {
        question: "How is Premium Content Creation different from Social Media Management?",
        answer:
          "Premium Content Creation (₹60,000/mo) is a multi-channel authority engine that combines long-form website blog production (2x 1,000+ word SEO articles/month), competitor content gap analysis, daily social distribution across 3 platforms, and 2 short-form videos. Social Media Management (₹20,000/mo) focuses specifically on social channel execution (daily static posts, 3 reels/week, and 1 long-form video/month).",
      },
      {
        question: "Which 3 social platforms are included in the daily distribution?",
        answer:
          "We tailor the 3 platforms to your buyer demographics—typically LinkedIn, Instagram, and X (Twitter) or Facebook/YouTube Shorts. Each asset is formatted natively for the target platform's aspect ratio and copy conventions.",
      },
      {
        question: "How does the review and approval workflow operate?",
        answer:
          "We deliver content batches in advance via a shared editorial calendar. Your team has a clear approval window to request copy or visual adjustments before anything goes live, backed by our < 2-hour operational response SLA.",
      },
      {
        question: "Do the blog posts include on-page SEO and internal linking?",
        answer:
          "Yes. Every blog post includes keyword research, curated meta titles and descriptions, semantic H2/H3 structure, internal links to your core service pages, and BlogPosting JSON-LD schema.",
      },
    ],
  },
  {
    slug: "social-media-management",
    title: "Social Media Management",
    subtitle: "Human-Curated Multimedia Production & Algorithmic Brand Visibility.",
    shortDesc: "Human-Curated Standard Tier. Establish market visibility through high-fidelity multimedia production.",
    metaDescription:
      "Human-curated social media management by Infriva Solutions. Custom strategy, daily static posts, 3 Reels per week, and monthly long-form video production.",
    image: "/images/digital-marketing.jpg",
    imageAlt: "Human-curated social media management and multimedia production studio at Infriva Solutions",
    lastModified: "2026-10-12",
    pricing: "₹20,000 / month",
    priceAmount: 20000,
    priceCurrency: "INR",
    billingNote: "Monthly human-curated social media production & management retainer",
    timeline: "Monthly Content Calendar Delivered by the 20th",
    sla: "90-day Algorithmic Incubation, 48-hour Client Approval Window",
    fit: "Service businesses and growing consumer brands requiring consistent, high-craft social momentum.",
    deliverables: [
      "Custom Channel Strategy",
      "Daily Static & Carousel Posts",
      "3 Short-Form Reels / Week",
      "1 Long-Form Video / Month",
    ],
    overview: [
      "Inconsistent posting, mismatched visual templates, and generic stock graphics signal to prospective buyers that a business is inactive or amateur. Yet building an in-house team of strategists, graphic designers, and video editors costs upwards of ₹1.5L+ per month in payroll alone.",
      "Infriva Solutions' Social Media Management (Human-Curated Standard Tier) gives your brand a complete, disciplined multimedia studio for ₹20,000/month. Every asset is conceptualized, designed, and edited by human creatives who understand visual hierarchy, brand psychology, and platform-specific retention mechanics.",
      "With daily static/carousel publications, 3 high-velocity Reels per week (12/month), and 1 flagship long-form video every month, we transform your social profiles from dormant pages into authoritative digital storefronts that warm up prospects before they ever hit your website.",
    ],
    features: [
      {
        title: "Custom Monthly Strategy & Audience Sentiment Monitoring",
        detail:
          "Monthly strategic planning delivered by the 20th of the preceding month, aligning hooks, seasonal campaigns, and product spotlights with your commercial calendar.",
      },
      {
        title: "Daily Static & Multi-Slide Carousel Design",
        detail:
          "30 bespoke visual posts per month adheres strictly to your typography, color palette, and grid aesthetic—educating buyers and reinforcing brand recognition.",
      },
      {
        title: "High-Velocity Reel Production (3 Reels per Week / 12 per Month)",
        detail:
          "Vertical short-form videos engineered with 3-second visual hooks, dynamic pacing, on-brand captions, and trending audio calibration for organic reach.",
      },
      {
        title: "Flagship Long-Form Video Production (1 per Month)",
        detail:
          "Deep-dive founder story, client case study, or comprehensive service walkthrough formatted for YouTube, LinkedIn, or IGTV authority.",
      },
      {
        title: "Conversion Bio Optimization & Inquiry Funnel Routing",
        detail:
          "Profile architecture, highlight systems, and tracked link-in-bio/DM call-to-actions that route social traffic directly into your WhatsApp or website inquiry form.",
      },
    ],
    architectureSections: [
      {
        heading: "Why Human-Curated Craft Outperforms Automated Social Slop",
        paragraphs: [
          "Social algorithms and human buyers alike have developed instant fatigue for generic Canva templates and robotic AI captions. When every post looks like an advertisement, followers tune out; when posts entertain without connecting to your offer, views never convert into revenue.",
          "We structure your monthly calendar across four deliberate content modes: Authority Education (40%), Visual Proof & Case Studies (25%), Brand Personality & Behind-the-Scenes (20%), and Direct Commercial Offers (15%). This balance earns algorithmic reach while steadily building buyer conviction.",
        ],
        bullets: [
          "Predictable Planning: Complete next-month calendar delivered by the 20th with a structured 48-hour approval window.",
          "Visual Cohesion: Strict adherence to your brand guidelines across every static frame, carousel slide, and video lower-third.",
          "Metric Discipline: Tracking saves, shares, profile-to-website clicks, and inbound DM inquiries—not just vanity impressions.",
        ],
      },
      {
        heading: "Turning Social Attention Into Owned Pipeline",
        paragraphs: [
          "Social media is the top of your funnel, not the end of it. We pair every weekly content sprint with clear action triggers—prompting engaged viewers to download a guide, message your WhatsApp concierge, or book a consultation on your website.",
          "By auditing bio layouts, pinned posts, and story highlight categories, we transform profile visits into immediate conversion pathways that capture contact data before attention drifts away.",
        ],
        bullets: [
          "High-converting bio copy and tracked multi-link trees optimized for WhatsApp and website intake.",
          "Story highlight categorization designed around Social Proof, Pricing FAQs, and Service Showcases.",
          "Automated direct-message conversation starters that bridge social engagement into your CRM.",
        ],
      },
      {
        heading: "Iterative Hook Engineering & Multi-Format Longevity",
        paragraphs: [
          "Social algorithms favor accounts with sustained watch time and active share rates. We systematically test three hook variations for every concept—visual pattern interrupts, provocative questions, and counter-intuitive industry truths—before publishing at audience peak hours.",
          "Top-performing organic posts are tagged and prepared for paid amplification or cross-posting to secondary channels, maximizing the return on every visual asset our studio produces.",
        ],
        bullets: [
          "3-second hook retention analysis to continually calibrate visual and auditory editing styles.",
          "Evergreen asset tagging to identify organic winners ready for low-budget paid ad boosting.",
          "Quarterly competitor benchmark reporting to maintain your brand's visual edge in the market.",
        ],
      },
    ],
    phases: [
      {
        step: "01",
        title: "Brand Kit Audit & Profile Architecture Overhaul",
        timeline: "Days 1–7",
        description:
          "Auditing existing social handles, upgrading bio positioning, designing highlight covers, and establishing visual templates and voice rules.",
      },
      {
        step: "02",
        title: "Monthly Calendar Blueprint (By the 20th)",
        timeline: "Monthly Cycle",
        description:
          "Presenting topics, scripts, and visual directions for all daily statics, 12 monthly Reels, and 1 long-form video with a 48-hour approval window.",
      },
      {
        step: "03",
        title: "Multimedia Production, Scheduling & Daily Publishing",
        timeline: "Ongoing Weekly",
        description:
          "Executing graphic design, video editing, caption copywriting, hashtag/keyword indexing, and peak-hour publishing.",
      },
      {
        step: "04",
        title: "90-Day Algorithmic Review & Format Optimization",
        timeline: "Monthly & Quarterly",
        description:
          "Evaluating hook retention curves, save-to-impression ratios, and website click attribution to refine creative formats.",
      },
    ],
    techStack: ["Figma Brand Systems", "Adobe Creative Cloud (Premiere, After Effects, Photoshop)", "Meta Business Suite", "LinkedIn & YouTube Studio", "UTM Attribution Links"],
    metrics: [
      { label: "Reel Velocity", value: "12 / mo", context: "3 custom-edited vertical Reels published every week" },
      { label: "Static Cadence", value: "Daily", context: "Consistent visual authority on your feed" },
      { label: "Planning SLA", value: "By 20th", context: "Next month's calendar delivered ahead of schedule" },
    ],
    relatedCaseStudy: {
      slug: "starx",
      title: "StarX Hotel Visual Positioning & Showcase",
      summary: "Established a luxury visual identity and room showcase ecosystem that elevated brand perception against national hotel chains.",
      metric: "+35% direct bookings & +0.4★ guest review rating",
    },
    relatedBlogSlugs: [
      "why-your-social-media-gets-attention-but-not-customers",
      "why-some-brands-feel-instantly-right-the-psychology-behind-great-branding",
      "how-digital-marketing-helps-startups-build-their-brand",
    ],
    qa: [
      {
        question: "Who shoots the raw video footage for the 3 weekly Reels and monthly long-form video?",
        answer:
          "We provide exact shot lists, scripts, and framing guides that your team can capture easily on a modern iPhone, or we combine your brand assets, screen recordings, motion graphics, and curated B-roll in our studio to produce polished edits.",
      },
      {
        question: "How does the 48-hour approval window work?",
        answer:
          "We submit the upcoming content batch by the 20th of each month. Your team has 48 hours to review and request revisions, ensuring our production pipeline never misses a daily publishing slot.",
      },
      {
        question: "Why do you require a 90-day incubation period for social media?",
        answer:
          "Social algorithms reward consistency and audience retention signals accumulated over 60 to 90 days. A 90-day commitment allows us to test multiple video hooks, identify which content pillars drive the highest save and inquiry rates, and build compounding organic reach.",
      },
      {
        question: "Can we combine Social Media Management with Paid Advertising or WhatsApp Retention?",
        answer:
          "Yes—and that is where the highest ROI occurs. Top-performing organic Reels can be boosted directly as low-CPA Meta Ads, and engaged social followers can be routed into automated WhatsApp nurture sequences.",
      },
    ],
  },
];

export const SERVICES_BY_SLUG: Record<string, ServiceItem> = Object.fromEntries(
  SERVICES_LIST.map((s) => [s.slug, s])
);

export function buildServiceJsonLd(service: ServiceItem) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${SITE_URL}/services/${service.slug}#service`,
      name: service.title,
      serviceType: service.title,
      description: service.metaDescription,
      url: `${SITE_URL}/services/${service.slug}`,
      image: absoluteUrl(service.image),
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      areaServed: [
        { "@type": "Country", name: "India" },
        { "@type": "Country", name: "United States" },
        { "@type": "Country", name: "United Kingdom" },
        { "@type": "Country", name: "United Arab Emirates" },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: `${service.title} Deliverables`,
        itemListElement: service.features.map((f, idx) => ({
          "@type": "Offer",
          position: idx + 1,
          itemOffered: {
            "@type": "Service",
            name: f.title,
            description: f.detail,
          },
        })),
      },
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}/services/${service.slug}`,
        price: String(service.priceAmount),
        priceCurrency: service.priceCurrency,
        priceSpecification: {
          "@type": "PriceSpecification",
          price: service.priceAmount,
          priceCurrency: service.priceCurrency,
          description: `${service.pricing} (${service.billingNote})`,
        },
        availability: "https://schema.org/InStock",
        validFrom: "2026-01-01",
      },
    },
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
      { name: service.title, path: `/services/${service.slug}` },
    ]),
  ];
}
