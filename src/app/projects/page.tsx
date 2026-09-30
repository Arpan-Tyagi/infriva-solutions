"use client"; // Opt-in to client-side React features, enabling hooks like useRef and Framer Motion

// Import custom Reveal component for scroll-based fade-up animations.
import { Reveal } from "@/components/ui/Reveal";
// Import phosphor-icons for scalable SVG iconography.
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
// Import Framer Motion components and hooks for scroll and transition animations.
import { motion, useScroll, useTransform } from "motion/react";
// Import core React hooks.
import { useRef } from "react";
// Import Next.js optimized routing and image components.
import Link from "next/link";
import Image from "next/image";

// Static data array for the projects portfolio. In a larger app, this might come from a CMS or API.
const projects = [
  {
    id: "flyinglyte",
    title: "FlyingLyte",
    category: "Travel, Flight Booking, Hotel Booking, Packages",
    desc: "A high-performance booking engine that streamlined the customer experience and increased lead capture by 40%. Built on Next.js.",
    color: "bg-[#e5e7eb]", // Theme color for this specific project
  },
  {
    id: "starx",
    title: "StarX Hotel",
    category: "Hotel Website, Hospitality, Room Showcase, Responsive Design",
    desc: "Immersive hospitality web property built for direct reservations and automated guest routing, integrated with a custom CRM for real-time booking management.",
    color: "bg-[#d1d5db]", // Theme color for this specific project
  }
];

// ProjectCard component renders individual portfolio items with scroll and hover animations.
function ProjectCard({ project, index }: { project: typeof projects[0], index: number }) {
  // Create a reference to the container div to track its position in the viewport.
  const ref = useRef<HTMLDivElement>(null);
  
  // useScroll tracks the scroll progress specifically for this component's bounding box.
  // "start end" means start tracking when the top of the element hits the bottom of the viewport.
  // "end start" means stop tracking when the bottom of the element hits the top of the viewport.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Create a parallax effect on the inner image based on the scroll progress.
  // As the user scrolls past the element, the image translates slightly vertically (-15% to 15%).
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    // Wrap the card in a Reveal component so it fades up as it enters the viewport.
    // Stagger the delay slightly based on the item index.
    <Reveal delay={index * 0.1}>
      {/* 
        The entire card is a Next.js Link navigating to the individual project's detail page.
        'group' class allows child elements to react to hover states triggered on this parent wrapper. 
      */}
      <Link href={`/projects/${project.id}`} className="group block mb-24 md:mb-32">
        {/* 
          Image container block determining the aspect ratio.
          It uses 'overflow-hidden' to clip the parallaxing image inside.
        */}
        <div ref={ref} className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-none overflow-hidden mb-8 border border-black/5 bg-brand-100">
          {/* 
            Motion div applying the scroll-based vertical translation (parallax).
            It's sized larger than its parent (140%) to ensure it covers the container entirely while translating.
          */}
          <motion.div 
            style={{ y }} 
            className="absolute inset-[-20%] w-[140%] h-[140%] flex items-center justify-center"
          >
            {/* 
              Next.js Image component handles automatic optimization (WebP/AVIF), responsive sizing, and lazy loading.
              'priority' is set to true only for the first item to improve LCP (Largest Contentful Paint).
            */}
            <Image 
              src={project.id === 'flyinglyte' ? '/images/flight-smartphone.jpg' : '/images/hotel-keycard.jpg'}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-105"
              priority={index === 0}
              loading={index === 0 ? undefined : "lazy"}
              sizes="(max-width: 768px) 100vw, 80vw"
            />
            {/* 
              Dark semi-transparent overlay that fades in when the parent link is hovered.
              Using opacity transitions on a separate layer is much more performant than animating background colors.
            */}
            <div className="absolute inset-0 bg-brand-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]" />
            
            {/* 
              Large hover title that appears and scales up slightly over the image when hovered.
              Initially hidden and translated down, it smoothly glides into place on hover.
            */}
            <div className="relative z-10 text-4xl md:text-8xl tracking-tight-display font-medium text-white opacity-0 group-hover:opacity-100 group-hover:scale-110 translate-y-4 group-hover:translate-y-0 transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]">
              {project.title}
            </div>
          </motion.div>
        </div>
        
        {/* Description section placed below the image block */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl tracking-tight-display font-medium mb-2">{project.title}</h2>
            <div className="text-sm font-mono text-black/40 mb-4">{project.category}</div>
            <p className="text-black/60 text-pretty">{project.desc}</p>
          </div>
          
          {/* 
            Call-to-action circular button with an animated arrow.
            Reacts to the 'group-hover' class on the parent Link to flip colors and nudge the arrow diagonally.
          */}
          <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-brand-900 group-hover:text-white group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-300">
            <ArrowUpRight size={20} weight="light" />
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

// The main Projects page component.
export default function Projects() {
  return (
    // Outer padding wrapper creating the layout shell.
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Page header tag using the custom Reveal animation component */}
        <Reveal className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-brand-900" />
          <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">Portfolio</span>
        </Reveal>
        
        {/* Page main title block */}
        <Reveal delay={0.1}>
          <h1 className="text-5xl md:text-7xl xl:text-8xl tracking-tight-display leading-[1.05] font-medium text-balance mb-24 max-w-5xl">
            Digital architecture that builds trust and generates business.
          </h1>
        </Reveal>

        {/* Iterate over the static projects array and render a ProjectCard for each */}
        <div className="flex flex-col">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
