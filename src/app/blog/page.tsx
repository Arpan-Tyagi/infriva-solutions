/**
 * @file src/app/blog/page.tsx
 * @description Editorial Insights & Thought Leadership Directory
 *
 * This client component renders the index of Infriva Solutions' engineering essays,
 * technical analyses, and digital strategy guides.
 *
 * Layout & Interaction Architecture:
 * 1. 12-Column Editorial Grid:
 *    - 2 columns: Aspect-ratio [4/3] photographic thumbnail with hover zoom.
 *    - 3 columns: Category taxonomy badge and monospace publication timestamp.
 *    - 6 columns: Headline title and executive takeaway summary.
 *    - 1 column: Directional arrow indicator reacting to row hover.
 * 2. Motion Choreography:
 *    - Rows are revealed with staggered scroll delays (`i * 0.1`).
 *    - Hover state transitions row background to Champagne Beige (`bg-brand-50`)
 *      and elevates the arrow icon with physical translations.
 */

 

import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Image from "next/image";
import { BLOG_POSTS_LIST } from "@/lib/blog";
import { SITE_URL, buildBreadcrumbJsonLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "B2B Engineering Insights, Technical SEO, GEO & CRM Strategy",
  description:
    "Read Infriva Solutions' engineering essays and B2B growth guides covering Next.js web architecture, SEO/AEO/GEO, custom CRM automation, and conversion strategy.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "B2B Engineering Insights, Technical SEO, GEO & CRM Strategy | Infriva Solutions",
    description:
      "Read Infriva Solutions' engineering essays and B2B growth guides covering Next.js web architecture, SEO/AEO/GEO, custom CRM automation, and conversion strategy.",
    url: `${SITE_URL}/blog`,
    type: "website",
    images: ["/images/seo-aeo-geo.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "B2B Engineering Insights, Technical SEO, GEO & CRM Strategy | Infriva Solutions",
    description:
      "Read Infriva Solutions' engineering essays and B2B growth guides covering Next.js web architecture, SEO/AEO/GEO, custom CRM automation, and conversion strategy.",
    images: ["/images/seo-aeo-geo.jpg"],
  },
};

export default function Blog() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Insights", path: "/blog" },
  ]);

  return (
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-7xl mx-auto">
        <Reveal priority>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-900" />
            <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">Insights</span>
          </div>
        </Reveal>

        <Reveal priority>
          <h1 className="text-5xl md:text-7xl xl:text-8xl tracking-tight-display leading-[1.05] font-medium text-balance mb-8 max-w-4xl">
            Engineering thoughts &amp; technical strategy.
          </h1>
        </Reveal>

        <Reveal priority>
          <p className="text-lg text-black/60 max-w-2xl text-pretty mb-24">
            Architectural analyses on high-conversion B2B web systems, Generative Engine Optimization (GEO), custom PostgreSQL CRMs, and full-funnel digital acquisition.
          </p>
        </Reveal>

        <div className="flex flex-col border-t border-black/10">
          {BLOG_POSTS_LIST.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.05}>
              <Link
                href={`/blog/${post.id}`}
                className="group block py-6 md:py-10 border-b border-black/10 transition-colors duration-500 hover:bg-brand-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-4 items-start">
                  {/* Article Feature Image Thumbnail (2 Cols) */}
                  <div className="md:col-span-2">
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-brand-100 mb-4 md:mb-0">
                      <Image
                        src={post.image}
                        alt={post.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 200px"
                        className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]"
                      />
                    </div>
                  </div>

                  {/* Taxonomy Badge, Date & Reading Time (3 Cols) */}
                  <div className="md:col-span-3">
                    <div className="text-[10px] tracking-widest-caps text-black/40 mb-2">
                      {post.category} &bull; {post.readTime}
                    </div>
                    <div className="text-sm font-mono text-black/60 mb-1">{post.date}</div>
                    <div className="text-xs text-black/45">By {post.author.name}</div>
                  </div>

                  {/* Headline & Executive Brief (6 Cols) */}
                  <div className="md:col-span-6">
                    <h2 className="text-2xl leading-[1.4] md:text-3xl tracking-tight-display font-medium mb-4 group-hover:text-black/80 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-black/60 max-w-2xl text-pretty leading-[1.4]">{post.desc}</p>
                  </div>

                  {/* Directional Action Icon (1 Col) */}
                  <div className="md:col-span-1 flex justify-end">
                    <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-brand-900 group-hover:text-white group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-300">
                      <ArrowUpRight size={20} weight="light" />
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
