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
import { CheckCircle, ArrowUpRight, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SERVICES_LIST, SERVICES_BY_SLUG, buildServiceJsonLd } from "@/lib/services";
import { BLOG_POSTS_BY_SLUG } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return SERVICES_LIST.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = SERVICES_BY_SLUG[slug];

  if (!data) {
    return {
      title: "Service Not Found",
    };
  }

  return {
    title: data.title,
    description: data.metaDescription,
    alternates: {
      canonical: `/services/${data.slug}`,
    },
    openGraph: {
      title: `${data.title} | Infriva Solutions`,
      description: data.metaDescription,
      url: `${SITE_URL}/services/${data.slug}`,
      type: "website",
      images: [
        {
          url: data.image,
          width: 1200,
          height: 630,
          alt: data.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.title} | Infriva Solutions`,
      description: data.metaDescription,
      images: [data.image],
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = SERVICES_BY_SLUG[slug];

  if (!data) {
    notFound();
  }

  const serviceJsonLd = buildServiceJsonLd(data);
  const relatedBlogs = data.relatedBlogSlugs
    .map((blogSlug) => BLOG_POSTS_BY_SLUG[blogSlug])
    .filter(Boolean);

  return (
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-xs tracking-widest-caps uppercase text-black/50 hover:text-brand-900 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to All Capabilities</span>
          </Link>
        </div>

        {/* Hero & Specification Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 mb-24">
          {/* Left Column: Narrative Details, Investment Specs & Booking CTA (7 Cols) */}
          <div className="lg:col-span-7">
            <Reveal priority>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
                <span className="w-2 h-2 rounded-full bg-brand-900" />
                <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">Deliverables Spec Sheet</span>
              </div>
            </Reveal>

            <Reveal priority>
              <h1 className="text-5xl md:text-7xl tracking-tight-display leading-[1.05] font-medium text-balance mb-6">
                {data.title}
              </h1>
            </Reveal>

            <Reveal priority>
              <p className="text-xl md:text-2xl leading-[1.4] tracking-tight-display text-black/60 mb-10 text-balance">
                {data.subtitle}
              </p>
            </Reveal>

            <Reveal priority>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl mb-10 bg-brand-100 border border-black/5">
                <Image
                  src={data.image}
                  alt={data.imageAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            <Reveal>
              <div className="prose prose-lg prose-neutral max-w-none text-black/80 mb-12 space-y-4">
                {data.overview.map((paragraph, pIdx) => (
                  <p key={pIdx} className="leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </Reveal>

            {/* Investment & Timeline Bento Grid */}
            <Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <div className="p-6 bg-brand-50 border border-black/5 rounded-xl">
                  <div className="text-[10px] tracking-widest-caps text-black/40 mb-2">Investment</div>
                  <div className="text-xl tracking-tight-display font-medium text-brand-900">{data.pricing}</div>
                </div>
                <div className="p-6 bg-brand-50 border border-black/5 rounded-xl">
                  <div className="text-[10px] tracking-widest-caps text-black/40 mb-2">Delivery Timeline</div>
                  <div className="text-xl tracking-tight-display font-medium text-brand-900">{data.timeline}</div>
                </div>
                <div className="sm:col-span-2 p-6 bg-brand-50 border border-black/5 rounded-xl">
                  <div className="text-[10px] tracking-widest-caps text-black/40 mb-2">SLA Terms &amp; Guarantee</div>
                  <div className="text-base tracking-tight-display font-medium text-brand-900">{data.sla}</div>
                </div>
              </div>
            </Reveal>

            {/* Benchmark Metrics */}
            <Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                {data.metrics.map((metric) => (
                  <div key={metric.label} className="p-5 bg-white border border-black/10 rounded-xl">
                    <div className="text-2xl font-medium tracking-tight-display text-brand-900 mb-1">
                      {metric.value}
                    </div>
                    <div className="text-xs font-medium text-black/80 mb-1">{metric.label}</div>
                    <div className="text-[11px] text-black/55">{metric.context}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-900 text-white rounded-xl hover:bg-black transition-colors font-medium tracking-tight text-sm"
                >
                  <span>Initiate {data.title} Project</span>
                  <ArrowUpRight size={16} />
                </Link>
                <Link
                  href={`/projects/${data.relatedCaseStudy.slug}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-brand-50 text-brand-900 border border-black/10 rounded-xl hover:border-black/30 transition-colors font-medium tracking-tight text-sm"
                >
                  <span>Read {data.relatedCaseStudy.title} Case Study</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Operational Inclusions, Tech Stack & Case Study Proof (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col pt-4 lg:pt-0">
            <Reveal>
              <h2 className="text-xs font-semibold uppercase tracking-widest-caps text-black/50 mb-6">
                Operational Inclusions
              </h2>
            </Reveal>

            <div className="flex flex-col gap-3 mb-12">
              {data.features.map((feature, i) => (
                <Reveal key={feature.title} delay={0.04 * i}>
                  <div className="flex gap-4 p-5 bg-white border border-black/10 rounded-xl hover:border-black/30 transition-all duration-300 group">
                    <div className="mt-0.5 shrink-0">
                      <CheckCircle size={20} className="text-brand-900" weight="fill" />
                    </div>
                    <div>
                      <h3 className="font-medium tracking-tight text-sm leading-[1.45] text-black/90 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-black/65 leading-relaxed">{feature.detail}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Technology & Platform Stack */}
            <Reveal>
              <div className="p-8 bg-brand-50 border border-black/10 rounded-xl mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-widest-caps text-black/50 mb-4">
                  Technology &amp; Platform Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 bg-white border border-black/10 rounded-lg text-xs font-medium text-brand-900"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Verified Client Case Study Card */}
            <Reveal>
              <Link
                href={`/projects/${data.relatedCaseStudy.slug}`}
                className="block p-8 bg-brand-900 text-white rounded-xl hover:bg-black transition-colors group"
              >
                <div className="text-[10px] tracking-widest-caps text-white/50 mb-2">
                  Verified Production Deployment &bull; {data.relatedCaseStudy.metric}
                </div>
                <h2 className="text-xl font-medium tracking-tight-display mb-2 group-hover:underline">
                  Case Study: {data.relatedCaseStudy.title}
                </h2>
                <p className="text-sm text-white/75 leading-relaxed mb-4">
                  {data.relatedCaseStudy.summary}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white">
                  Inspect Full Architecture <ArrowUpRight size={14} />
                </span>
              </Link>
            </Reveal>
          </div>
        </div>

        {/* Deep Architectural Breakdown Sections */}
        <section className="pt-20 border-t border-black/10 mb-24">
          <Reveal>
            <div className="text-[10px] tracking-widest-caps text-black/40 mb-3">System Architecture</div>
            <h2 className="text-3xl md:text-5xl tracking-tight-display font-medium mb-14 max-w-3xl">
              How We Engineer {data.title}
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {data.architectureSections.map((section, idx) => (
              <Reveal key={section.heading} delay={idx * 0.08}>
                <div className="h-full p-8 bg-brand-50 border border-black/10 rounded-xl flex flex-col">
                  <div className="text-xs font-mono text-black/40 mb-4">0{idx + 1}</div>
                  <h3 className="text-xl font-medium tracking-tight-display mb-4 text-brand-900">
                    {section.heading}
                  </h3>
                  <div className="space-y-4 text-sm text-black/75 leading-relaxed">
                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-6 pt-5 border-t border-black/10 space-y-2.5 text-xs text-black/70">
                      {section.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-900 mt-1.5 shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 4-Phase Delivery Roadmap */}
        <section className="pt-20 border-t border-black/10 mb-24">
          <Reveal>
            <div className="text-[10px] tracking-widest-caps text-black/40 mb-3">Execution Protocol</div>
            <h2 className="text-3xl md:text-5xl tracking-tight-display font-medium mb-14 max-w-3xl">
              Implementation Roadmap &amp; Milestones
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.phases.map((phase) => (
              <Reveal key={phase.step}>
                <div className="h-full p-6 bg-white border border-black/10 rounded-xl">
                  <div className="text-xs font-mono text-brand-900 font-semibold mb-1">
                    PHASE {phase.step} &bull; {phase.timeline}
                  </div>
                  <h3 className="text-lg font-medium tracking-tight-display mb-3">
                    {phase.title}
                  </h3>
                  <p className="text-sm text-black/65 leading-relaxed">
                    {phase.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Common Engineering & Procurement Questions */}
        <section className="pt-20 border-t border-black/10 mb-24">
          <Reveal>
            <div className="text-[10px] tracking-widest-caps text-black/40 mb-3">Technical Clarifications</div>
            <h2 className="text-3xl md:text-4xl tracking-tight-display font-medium mb-12">
              Architecture &amp; Engagement Specifications
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.qa.map((item) => (
              <Reveal key={item.question}>
                <div className="p-8 bg-brand-50 border border-black/10 rounded-xl h-full">
                  <h3 className="text-lg font-medium tracking-tight-display mb-3 text-brand-900">
                    {item.question}
                  </h3>
                  <p className="text-sm text-black/75 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Related Editorial Insights */}
        {relatedBlogs.length > 0 && (
          <section className="pt-20 border-t border-black/10">
            <Reveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div>
                  <div className="text-[10px] tracking-widest-caps text-black/40 mb-3">Editorial Research</div>
                  <h2 className="text-3xl md:text-4xl tracking-tight-display font-medium">
                    Related Engineering Insights
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand-900 hover:opacity-70 transition-opacity"
                >
                  <span>View All Insights</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedBlogs.map((post) => (
                <Reveal key={post.id}>
                  <Link
                    href={`/blog/${post.id}`}
                    className="group block p-8 bg-white border border-black/10 rounded-xl hover:border-black/30 transition-colors h-full"
                  >
                    <div className="text-xs uppercase tracking-widest text-black/45 mb-3">
                      {post.category} &bull; {post.date}
                    </div>
                    <h3 className="text-xl font-medium tracking-tight-display mb-3 group-hover:underline">
                      {post.title}
                    </h3>
                    <p className="text-sm text-black/65 leading-relaxed mb-4">
                      {post.desc}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-900">
                      Read Article <ArrowUpRight size={14} />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
