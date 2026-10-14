/**
 * @file src/app/blog/[slug]/page.tsx
 * @description Dynamic Editorial Article Reader & Thought Leadership
 *
 * Pre-renders all 11 editorial articles from `@/lib/blog` with:
 * - Curated 140-160 char meta descriptions (`post.desc`)
 * - Self-referencing canonical URLs and Twitter/OpenGraph cards
 * - Schema.org `BlogPosting` + `BreadcrumbList` JSON-LD
 * - Named E-E-A-T author attribution (`Disha Rajput — Head of Content & SEO Strategy`)
 * - Priority LCP hero image optimization with responsive `sizes`
 * - Contextual internal links to related services and client case studies
 */

import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BLOG_POSTS_LIST, BLOG_POSTS_BY_SLUG, buildBlogPostingJsonLd } from "@/lib/blog";
import { SERVICES_BY_SLUG } from "@/lib/services";
import { PROJECTS_BY_SLUG } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return BLOG_POSTS_LIST.map((post) => ({ slug: post.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS_BY_SLUG[slug];

  if (!post) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: post.title,
    description: post.desc,
    alternates: {
      canonical: `/blog/${post.id}`,
    },
    openGraph: {
      title: `${post.title} | Infriva Solutions`,
      description: post.desc,
      url: `${SITE_URL}/blog/${post.id}`,
      type: "article",
      publishedTime: post.isoDate,
      modifiedTime: post.lastModified,
      authors: [post.author.name],
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Infriva Solutions`,
      description: post.desc,
      images: [post.image],
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS_BY_SLUG[slug];

  if (!post) {
    notFound();
  }

  const blogJsonLd = buildBlogPostingJsonLd(post);
  const relatedServices = post.relatedServiceSlugs
    .map((serviceSlug) => SERVICES_BY_SLUG[serviceSlug])
    .filter(Boolean);
  const relatedProject = PROJECTS_BY_SLUG[post.relatedProjectSlug];

  return (
    <article className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      <div className="max-w-3xl mx-auto">
        <Reveal priority>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-black/50 hover:text-brand-900 transition-colors mb-12 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            <span>Back to Insights</span>
          </Link>
        </Reveal>

        <Reveal priority>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="text-[10px] tracking-widest-caps font-medium text-brand-900">
              {post.category}
            </div>
            <div className="w-1 h-1 rounded-full bg-black/20" />
            <time dateTime={post.isoDate} className="text-sm font-mono text-black/60">
              {post.date}
            </time>
            <div className="w-1 h-1 rounded-full bg-black/20" />
            <div className="text-xs font-mono text-black/50">{post.readTime}</div>
          </div>
        </Reveal>

        <Reveal priority>
          <h1 className="text-4xl md:text-6xl tracking-tight-display leading-[1.05] font-medium text-balance mb-8">
            {post.title}
          </h1>
        </Reveal>

        {/* E-E-A-T Author Attribution Bar */}
        <Reveal priority>
          <div className="flex items-center justify-between py-4 px-5 bg-brand-50 border border-black/5 rounded-xl mb-10">
            <div>
              <div className="text-sm font-medium text-brand-900">{post.author.name}</div>
              <div className="text-xs text-black/55">{post.author.role} &bull; Infriva Solutions</div>
            </div>
            <Link
              href="/about"
              className="text-xs font-medium text-brand-900 hover:underline shrink-0"
            >
              Editorial Profile &rarr;
            </Link>
          </div>
        </Reveal>

        <Reveal priority>
          <div className="w-full aspect-[16/9] relative mb-12 overflow-hidden bg-brand-100 rounded-xl border border-black/5">
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        </Reveal>

        <div className="w-full h-px bg-black/10 mb-12" />

        {/* Long-Form Prose Content (with proper H2 -> H3 hierarchy) */}
        <Reveal>
          <div
            className="prose prose-lg prose-neutral max-w-none text-black/80 font-sans"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Reveal>

        {/* E-E-A-T Author Bio Box */}
        <Reveal>
          <div className="mt-16 p-8 bg-white border border-black/10 rounded-2xl">
            <div className="text-[10px] tracking-widest-caps text-black/40 mb-2">
              Written &amp; Reviewed By
            </div>
            <h2 className="text-xl font-medium tracking-tight-display text-brand-900 mb-1">
              {post.author.name}
            </h2>
            <p className="text-xs text-black/55 mb-4">{post.author.role} &bull; {post.author.credentials}</p>
            <p className="text-sm text-black/75 leading-relaxed mb-4">
              {post.author.bio}
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-900 hover:underline"
            >
              Learn more about Infriva&apos;s engineering methodology <ArrowUpRight size={14} />
            </Link>
          </div>
        </Reveal>

        {/* Related Capabilities & Case Study Cross-Links */}
        <Reveal>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedServices.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group p-6 bg-brand-50 border border-black/10 rounded-xl hover:border-black/30 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="text-[10px] tracking-widest-caps text-black/45 mb-2">
                    Related Capability
                  </div>
                  <h2 className="text-lg font-medium tracking-tight-display mb-2 group-hover:underline">
                    {service.title}
                  </h2>
                  <p className="text-xs text-black/65 leading-relaxed mb-4">
                    {service.shortDesc}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-900">
                  Explore Spec Sheet ({service.pricing}) <ArrowUpRight size={14} />
                </span>
              </Link>
            ))}

            {relatedProject && (
              <Link
                href={`/projects/${relatedProject.id}`}
                className="group p-6 bg-brand-900 text-white rounded-xl hover:bg-black transition-colors flex flex-col justify-between md:col-span-2"
              >
                <div>
                  <div className="text-[10px] tracking-widest-caps text-white/50 mb-2">
                    Verified Case Study
                  </div>
                  <h2 className="text-xl font-medium tracking-tight-display mb-2 group-hover:underline">
                    {relatedProject.title}: {relatedProject.tagline}
                  </h2>
                  <p className="text-xs text-white/70 leading-relaxed mb-4">
                    {relatedProject.shortDesc}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-white">
                  Read Full Case Study <ArrowUpRight size={14} />
                </span>
              </Link>
            )}
          </div>
        </Reveal>

        {/* Post-Article Lead Conversion Anchor */}
        <Reveal>
          <div className="mt-16 p-8 bg-brand-50 rounded-2xl border border-black/5 text-center">
            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mb-4">
              Ready to upgrade your systems?
            </h2>
            <p className="text-black/60 mb-8 max-w-md mx-auto">
              Let&apos;s discuss how we can implement these strategies in your business.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-900 text-white rounded-xl hover:bg-black transition-colors font-medium tracking-tight text-sm"
            >
              Start a Conversation
            </Link>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
