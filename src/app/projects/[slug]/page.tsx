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
import { PROJECTS_LIST, PROJECTS_BY_SLUG, buildProjectJsonLd } from "@/lib/projects";
import { SERVICES_BY_SLUG } from "@/lib/services";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return PROJECTS_LIST.map((project) => ({ slug: project.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS_BY_SLUG[slug];
  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.title} — Case Study`,
    description: project.metaDescription,
    alternates: {
      canonical: `/projects/${project.id}`,
    },
    openGraph: {
      title: `${project.title} — Case Study | Infriva Solutions`,
      description: project.metaDescription,
      url: `${SITE_URL}/projects/${project.id}`,
      type: "article",
      images: [
        {
          url: project.heroImage,
          width: 1200,
          height: 630,
          alt: project.heroImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — Case Study | Infriva Solutions`,
      description: project.metaDescription,
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
  const project = PROJECTS_BY_SLUG[slug];

  if (!project) notFound();

  const next = PROJECTS_BY_SLUG[project.nextProject];
  const projectJsonLd = buildProjectJsonLd(project);
  const relatedServices = project.relatedServices
    .map((rel) => SERVICES_BY_SLUG[rel.slug])
    .filter(Boolean);

  return (
    <div className="w-full bg-[#FBF8F3]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />

      {/* Back to Projects Navigation Anchor */}
      <div className="pt-32 px-4 md:px-12 max-w-7xl mx-auto">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black/90 transition-colors duration-300 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
          All Case Studies
        </Link>
      </div>

      {/* Case Study Header & Manifesto */}
      <section className="px-4 md:px-12 pt-12 pb-16 max-w-7xl mx-auto">
        <div className="mb-6">
          <span className="text-[10px] tracking-widest-caps font-medium text-black/50 uppercase font-mono">
            {project.category} &middot; {project.year}
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl xl:text-[6rem] tracking-tight-display leading-[1.0] font-medium mb-6 max-w-5xl">
          {project.title}
        </h1>
        <p className="text-xl md:text-2xl leading-[1.5] text-black/65 font-medium max-w-3xl">
          {project.tagline}
        </p>
      </section>

      {/* Hero Photography Banner */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden">
        <Image
          src={project.heroImage}
          alt={project.heroImageAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Case Study Narrative Body: Asymmetric 38.2% / 61.8% Golden Ratio Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-20 md:py-24 grid grid-cols-1 lg:grid-cols-[38.2fr_61.8fr] gap-16 lg:gap-24">
        {/* Sidebar: Deliverables, Tech Stack & Related Services */}
        <div className="space-y-12">
          <div>
            <h2 className="text-[10px] tracking-widest-caps font-medium text-black/50 uppercase font-mono mb-6">
              Deliverables
            </h2>
            <ul className="flex flex-col gap-3">
              {project.deliverables.map((d) => (
                <li key={d} className="flex items-center gap-3 text-sm font-medium text-black/75">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-900 shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[10px] tracking-widest-caps font-medium text-black/50 uppercase font-mono mb-4">
              Technology Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-white border border-black/10 text-xs font-medium text-brand-900"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {relatedServices.length > 0 && (
            <div>
              <h2 className="text-[10px] tracking-widest-caps font-medium text-black/50 uppercase font-mono mb-4">
                Capabilities Deployed
              </h2>
              <div className="flex flex-col gap-3">
                {relatedServices.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    className="group flex items-center justify-between p-4 bg-white border border-black/10 hover:border-black/30 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-brand-900 group-hover:underline">
                        {service.title}
                      </div>
                      <div className="text-xs text-black/50">{service.subtitle}</div>
                    </div>
                    <ArrowUpRight size={16} className="text-black/50 group-hover:text-brand-900" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Narrative Flow: Overview -> Challenge -> Solution -> Architectural Breakdown */}
        <div className="flex flex-col gap-12">
          <div>
            <h2 className="text-2xl font-medium tracking-tight-display text-brand-900 mb-4">
              Executive Overview
            </h2>
            <div className="space-y-4">
              {project.overview.map((p, idx) => (
                <p key={idx} className="text-lg leading-[1.65] text-black/80">{p}</p>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-medium tracking-tight-display text-brand-900 mb-4">
              The Operational Challenge
            </h2>
            <div className="space-y-4">
              {project.challenge.map((p, idx) => (
                <p key={idx} className="text-lg leading-[1.65] text-black/80">{p}</p>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-medium tracking-tight-display text-brand-900 mb-4">
              The Engineering Solution
            </h2>
            <div className="space-y-4">
              {project.solution.map((p, idx) => (
                <p key={idx} className="text-lg leading-[1.65] text-black/80">{p}</p>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-black/10 space-y-10">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight-display text-brand-900">
              Deep System Architecture
            </h2>
            {project.architectureSections.map((section, idx) => (
              <div key={section.heading} className="p-8 bg-white border border-black/10">
                <div className="text-xs font-mono text-black/40 mb-2">MODULE 0{idx + 1}</div>
                <h3 className="text-xl font-medium tracking-tight-display mb-3 text-brand-900">
                  {section.heading}
                </h3>
                <div className="space-y-4 text-base text-black/75 leading-relaxed">
                  {section.body.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-6 pt-5 border-t border-black/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-black/75">
                    {section.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-900 mt-2 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Measured Outcomes: Inverted Dark Metrics Matrix */}
      <div className="bg-[#0A0A0B] text-[#FBF8F3] py-16 md:py-24 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[10px] tracking-widest-caps font-medium text-white/50 uppercase font-mono mb-12">
            Measured Production Outcomes
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-white/10">
            {project.results.map((r) => (
              <div key={r.label} className="p-8 border border-white/5">
                <div className="text-4xl md:text-5xl tracking-tight-display font-medium mb-2">
                  {r.value}
                </div>
                <div className="text-sm font-medium text-white/80 mb-1">{r.label}</div>
                <div className="text-xs text-white/45">{r.detail}</div>
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
            className="relative w-full aspect-[16/9] overflow-hidden border border-black/5 bg-brand-100"
          >
            <Image
              src={img.src}
              alt={img.alt}
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
              Next Case Study
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
