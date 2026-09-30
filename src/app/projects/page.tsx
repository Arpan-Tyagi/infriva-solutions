/**
 * @file src/app/projects/page.tsx
 * @description Agency Portfolio & Case Study Showcase Directory
 *
 * This client component renders Infriva Solutions' client project directory,
 * showcasing enterprise platform builds and high-converting booking systems.
 *
 * Physics & Performance Architecture:
 * 1. Hardware-Accelerated Parallax (`useScroll` + `useTransform`):
 *    - Each `ProjectCard` tracks its own viewport offset (`['start end', 'end start']`).
 *    - The inner image container is oversized (`140%` width/height with `-20%` inset) to provide
 *      bleed room as it translates vertically from `-15%` to `+15%` on scroll.
 * 2. Core Web Vitals (LCP Optimization):
 *    - The initial hero card (`index === 0`) has `priority={true}` to prioritize browser decoding.
 *    - Secondary cards use `loading="lazy"` to defer bandwidth until scrolled near.
 * 3. Kinematic Hover Choreography:
 *    - On hover, an obsidian scrim layer fades in (`opacity: 1`) while the project headline
 *      reveals with luxury spring scale (`group-hover:scale-110`) using `[0.76, 0, 0.24, 1]`.
 */

"use client";

import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * Portfolio Case Studies Registry
 */
const projects = [
  {
    id: "flyinglyte",
    title: "FlyingLyte",
    category: "Travel, Flight Booking, Hotel Booking, Packages",
    desc: "A high-performance booking engine that streamlined the customer experience and increased lead capture by 40%. Built on Next.js.",
    color: "bg-[#e5e7eb]",
  },
  {
    id: "starx",
    title: "StarX Hotel",
    category: "Hotel Website, Hospitality, Room Showcase, Responsive Design",
    desc: "Immersive hospitality web property built for direct reservations and automated guest routing, integrated with a custom CRM for real-time booking management.",
    color: "bg-[#d1d5db]",
  }
];

interface ProjectCardProps {
  project: typeof projects[0];
  index: number;
}

/**
 * Individual Interactive Case Study Card with Scroll Parallax
 */
function ProjectCard({ project, index }: ProjectCardProps) {
  // DOM reference to card container
  const ref = useRef<HTMLDivElement>(null);
  
  // Track scroll position of the individual card
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Vertical parallax translation: translates image -15% to +15% as it crosses viewport
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <Reveal delay={index * 0.1}>
      <Link href={`/projects/${project.id}`} className="group block mb-24 md:mb-32">
        {/* Parallax Image Canvas Frame */}
        <div ref={ref} className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-none overflow-hidden mb-8 border border-black/5 bg-brand-100">
          {/* Oversized Motion Container for Scroll Parallax */}
          <motion.div 
            style={{ y }} 
            className="absolute inset-[-20%] w-[140%] h-[140%] flex items-center justify-center"
          >
            {/* Next.js Optimized Responsive Image */}
            <Image 
              src={project.id === 'flyinglyte' ? '/images/flight-smartphone.jpg' : '/images/hotel-keycard.jpg'}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-105"
              priority={index === 0}
              loading={index === 0 ? undefined : "lazy"}
              sizes="(max-width: 768px) 100vw, 80vw"
            />
            {/* Obsidian Dark Scrim on Hover */}
            <div className="absolute inset-0 bg-brand-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]" />
            
            {/* Atmospheric Display Title on Hover */}
            <div className="relative z-10 text-4xl md:text-8xl tracking-tight-display font-medium text-white opacity-0 group-hover:opacity-100 group-hover:scale-110 translate-y-4 group-hover:translate-y-0 transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]">
              {project.title}
            </div>
          </motion.div>
        </div>
        
        {/* Case Study Metadata & Narrative Summary */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl tracking-tight-display font-medium mb-2">{project.title}</h2>
            <div className="text-sm font-mono text-black/40 mb-4">{project.category}</div>
            <p className="text-black/60 text-pretty">{project.desc}</p>
          </div>
          
          {/* Interactive Arrow Button */}
          <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-brand-900 group-hover:text-white group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-300">
            <ArrowUpRight size={20} weight="light" />
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default function Projects() {
  return (
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Eyebrow Badge */}
        <Reveal className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-brand-900" />
          <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">Portfolio</span>
        </Reveal>
        
        {/* Headline */}
        <Reveal delay={0.1}>
          <h1 className="text-5xl md:text-7xl xl:text-8xl tracking-tight-display leading-[1.05] font-medium text-balance mb-24 max-w-5xl">
            Digital architecture that builds trust and generates business.
          </h1>
        </Reveal>

        {/* Project Case Studies Stack */}
        <div className="flex flex-col">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
