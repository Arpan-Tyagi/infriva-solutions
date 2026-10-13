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

import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectsGrid } from "./ProjectsGrid";
import { SITE_URL, buildBreadcrumbJsonLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Client Case Studies & Digital Architecture Portfolio",
  description:
    "Explore Infriva Solutions' B2B engineering case studies: FlyingLyte travel booking engine (+40% leads) and StarX Hotel direct reservation system (+35% direct bookings).",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Client Case Studies & Digital Architecture Portfolio | Infriva Solutions",
    description:
      "Explore Infriva Solutions' B2B engineering case studies: FlyingLyte travel booking engine (+40% leads) and StarX Hotel direct reservation system (+35% direct bookings).",
    url: `${SITE_URL}/projects`,
    type: "website",
    images: ["/images/flight-smartphone.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Client Case Studies & Digital Architecture Portfolio | Infriva Solutions",
    description:
      "Explore Infriva Solutions' B2B engineering case studies: FlyingLyte travel booking engine (+40% leads) and StarX Hotel direct reservation system (+35% direct bookings).",
    images: ["/images/flight-smartphone.jpg"],
  },
};

export default function Projects() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Work", path: "/projects" },
  ]);

  return (
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-7xl mx-auto">
        <Reveal priority className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-brand-900" />
          <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">Portfolio</span>
        </Reveal>

        <Reveal priority>
          <h1 className="text-5xl md:text-7xl xl:text-8xl tracking-tight-display leading-[1.05] font-medium text-balance mb-8 max-w-5xl">
            Digital architecture that builds trust and generates business.
          </h1>
        </Reveal>

        <Reveal priority>
          <p className="text-lg text-black/60 max-w-2xl text-pretty mb-24">
            Every system in our portfolio combines high-speed Next.js web engineering, PostgreSQL CRM pipelines, and automated WhatsApp/Meta workflows to deliver measurable revenue outcomes.
          </p>
        </Reveal>

        <ProjectsGrid />
      </div>
    </div>
  );
}
