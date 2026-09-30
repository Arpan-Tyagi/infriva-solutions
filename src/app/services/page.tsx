/**
 * @file src/app/services/page.tsx
 * @description Agency Services Catalog & Architectural Capabilities
 *
 * This client component renders the master index of Infriva Solutions' 7 core engineering practices.
 *
 * UX & Interaction Architecture:
 * 1. Expandable Hover Rows:
 *    - Tracks `hoveredIdx` in React state.
 *    - On hover, an animated background layer expands vertically (`scaleY: 1`) using a luxury
 *      cubic bezier curve `[0.76, 0, 0.24, 1]`.
 *    - If the service has an associated architectural background image, it renders with `mix-blend-multiply`
 *      at 20% opacity for atmospheric depth.
 * 2. 12-Column Responsive Breakdown:
 *    - 4 columns: Service Title & Core Manifesto
 *    - 4 columns: Concrete Operational Deliverables with Phosphor checkmarks
 *    - 3 columns: Ideal Client Profile ("Best For")
 *    - 1 column: Directional Arrow Circle responding to parent hover
 * 3. Deep Linking:
 *    - Each row links directly to `/services/[slug]` for the full specification sheet.
 */

"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Check, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";

/**
 * Registry of core agency services and operational deliverables.
 */
const services = [
  {
    slug: "premium-content",
    title: "Premium Content Creation",
    desc: "Blog, Social & Video Distribution. Enhance brand authority and drive high-intent organic traffic.",
    deliverables: ["Blog Production", "Daily Social Media", "Short-Form Video Production"],
    fit: "Brands looking to establish organic authority and deep customer engagement."
  },
  {
    slug: "social-media-management",
    title: "Social Media Management",
    desc: "Human-Curated Standard Tier. Establish market visibility through high-fidelity multimedia production.",
    deliverables: ["Custom Strategy", "Daily Static Posts", "3 Reels/Week", "1 Long-form/Month"],
    fit: "Service businesses requiring consistent algorithmic momentum."
  },
  {
    image: "/images/stone-staircase.jpg",
    slug: "seo-and-geo",
    title: "Full-Stack SEO & GEO",
    desc: "Generative Engine Optimization. Dominate search rankings and AI generative engine citations.",
    deliverables: ["Social Syndication", "Content Marketing", "Technical SEO", "Backlink Building"],
    fit: "Established companies looking to build long-term organic acquisition moats."
  },
  {
    image: "/images/champagne-sphere.jpg",
    slug: "retention-marketing",
    title: "Retention Marketing",
    desc: "WhatsApp Add-On Ecosystem. Maximize LTV and repeat purchase rates through personalized messaging.",
    deliverables: ["Broadcast Campaigns", "Abandoned Cart Triggers", "Welcome Series", "Win-Back Sequences"],
    fit: "E-commerce and high-volume service providers."
  },
  {
    image: "/images/glass-panels.jpg",
    slug: "web-development",
    title: "Web Dev & UI/UX Design",
    desc: "High-Performance Digital Properties. Architect a conversion-optimized scalable technical foundation.",
    deliverables: ["UI/UX Strategy & Wireframing", "High-Fidelity Design", "React/Next.js Dev", "Technical SEO QA"],
    fit: "Startups and enterprises needing robust digital platforms."
  },
  {
    image: "/images/titanium-gears.jpg",
    slug: "paid-advertising",
    title: "Paid Advertising Management",
    desc: "Meta & Google Ads Engine. Accelerate predictable customer acquisition and revenue generation.",
    deliverables: ["Meta Ads Architecture", "Google Ads Bidding", "Creative Copywriting", "Performance Attribution"],
    fit: "Businesses requiring immediate, scalable revenue generation."
  },
  {
    image: "/images/glass-panels.jpg",
    slug: "crm-systems",
    title: "Custom CRM Systems",
    desc: "Bespoke customer relationship management architecture designed around your sales workflow.",
    deliverables: ["Database Architecture", "Automated Routing", "API Integrations", "Custom Dashboards"],
    fit: "Sales-driven organizations requiring bespoke tracking and automation."
  }
];

export default function Services() {
  // Track hovered row index for dynamic backdrop animations
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Animated Eyebrow Badge */}
        <Reveal className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-brand-900" />
          <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">Capabilities</span>
        </Reveal>
        
        {/* Headline */}
        <Reveal delay={0.1}>
          <h1 className="text-5xl md:text-7xl xl:text-8xl tracking-tight-display leading-[1.05] font-medium text-balance mb-8 max-w-5xl">
            Systems planned around your <br className="hidden md:block"/> business workflow.
          </h1>
        </Reveal>
        
        {/* Overview Narrative */}
        <Reveal delay={0.2}>
          <p className="text-lg text-black/60 max-w-2xl text-pretty mb-24">
            We don&apos;t build generic solutions. Every deliverable is mapped to your specific operational goals, ensuring clean architecture and reliable scaling.
          </p>
        </Reveal>

        {/* Services List Table Wrapper */}
        <div className="flex flex-col border-t border-black/10">
          {services.map((service, i) => (
            <Reveal key={i} delay={0.1 * i}>
              <Link 
                href={`/services/${service.slug}`}
                className="group relative border-b border-black/10 transition-colors duration-500 cursor-pointer block"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Expanding Background on Row Hover */}
                <motion.div 
                  className="absolute inset-0 bg-brand-50 backdrop-blur-md -z-10 origin-bottom overflow-hidden"
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: hoveredIdx === i ? 1 : 0, scaleY: hoveredIdx === i ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                >
                  {service.image && (
                    <Image 
                      src={service.image} 
                      fill 
                      className="object-cover opacity-20 mix-blend-multiply" 
                      alt="" 
                    />
                  )}
                </motion.div>

                {/* 12-Column Row Layout */}
                <div className="py-6 md:py-10 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Service Title and Core Narrative (4 Cols) */}
                  <div className="lg:col-span-4">
                    <h2 className="text-3xl tracking-tight-display font-medium mb-4">{service.title}</h2>
                    <p className="text-black/60 max-w-xs">{service.desc}</p>
                  </div>
                  
                  {/* Concrete Deliverables Checklist (4 Cols) */}
                  <div className="lg:col-span-4">
                    <div className="text-[10px] tracking-widest-caps text-black/40 mb-4">Deliverables</div>
                    <ul className="flex flex-col gap-3">
                      {service.deliverables.map((item, j) => (
                        <li key={j} className="flex items-center gap-3 text-sm">
                          <Check size={14} className="text-brand-900" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Target Audience Profile (3 Cols) */}
                  <div className="lg:col-span-3">
                    <div className="text-[10px] tracking-widest-caps text-black/40 mb-4">Best For</div>
                    <p className="text-sm leading-[1.4]">{service.fit}</p>
                  </div>

                  {/* Directional Action CTA (1 Col) */}
                  <div className="lg:col-span-1 flex justify-end">
                    <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-brand-900 group-hover:text-white transition-colors">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
