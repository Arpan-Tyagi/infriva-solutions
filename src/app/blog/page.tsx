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

 

import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Image from "next/image";

/**
 * Editorial Article Index Registry
 */
const posts = [
  {
    image: "/images/branding-uiux.jpg",
    id: "why-branding-and-ui-ux-matter-more-than-ever-for-your-website",
    title: "Why Branding and UI/UX Matter More Than Ever for Your Website",
    category: "Design",
    date: "Oct 6, 2026",
    desc: "Your website is often the first place where people experience your brand. Branding and UI/UX are not just about making a website look attractive. They directly influence how people see, trust and remember your brand."
  },

  {
    image: "/images/marketing-megaphone.jpg",
    id: "how-digital-marketing-helps-startups-build-their-brand",
    title: "How Digital Marketing Helps Startups Build Their Brand",
    category: "Marketing",
    date: "Sep 30, 2026",
    desc: "Starting a business is exciting, but building a brand people remember is the real challenge. Discover how digital marketing helps startups achieve visibility, trust, and growth."
  },
  {
    image: "/images/marketing-megaphone.jpg",
    id: "why-your-social-media-gets-attention-but-not-customers",
    title: "Why Your Social Media Gets Attention But Not Customers",
    category: "Marketing",
    date: "Sep 25, 2026",
    desc: "Likes and shares are vanity metrics. Discover why high engagement doesn't always translate into a packed CRM, and how to engineer a real conversion funnel."
  },
  {
    image: "/images/paper-receipts.jpg",
    id: "why-every-small-business-needs-crm-software",
    title: "Why Every Small Business Needs CRM Software",
    category: "Systems",
    date: "Sep 20, 2026",
    desc: "Spreadsheets leak revenue. Learn how a centralized Customer Relationship Management system acts as the backbone of scaling operations."
  },
  {
    image: "/images/broken-bridge.jpg",
    id: "why-your-website-is-not-getting-leads-and-how-to-fix-it",
    title: "Why Your Website Is Not Getting Leads (And How to Fix It)",
    category: "Engineering",
    date: "Sep 12, 2026",
    desc: "A beautiful website without lead-capture mechanics is just a digital brochure. We break down the structural flaws killing your conversion rate."
  },
  {
    image: "/images/stone-monolith.jpg",
    id: "seo-vs-google-ads-which-is-better-for-your-business",
    title: "SEO vs Google Ads: Which is Better For Your Business?",
    category: "Growth",
    date: "Aug 30, 2026",
    desc: "Immediate traction vs compounding returns. A critical analysis of when to deploy capital into paid search versus organic infrastructure."
  }
];

export default function Blog() {
  return (
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Animated Eyebrow Badge */}
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-900" />
            <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">Insights</span>
          </div>
        </Reveal>
        
        {/* Main Display Headline */}
        <Reveal delay={0.1}>
          <h1 className="text-5xl md:text-7xl xl:text-8xl tracking-tight-display leading-[1.05] font-medium text-balance mb-24 max-w-4xl">
            Engineering thoughts & technical strategy.
          </h1>
        </Reveal>

        {/* Editorial Articles Table */}
        <div className="flex flex-col border-t border-black/10">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.1}>
              <Link 
                href={`/blog/${post.id}`} 
                className="group block py-6 md:py-10 border-b border-black/10 transition-colors duration-500 hover:bg-brand-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-4 items-start">
                  
                  {/* Article Feature Image Thumbnail (2 Cols) */}
                  <div className="md:col-span-2">
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-brand-100 mb-4 md:mb-0">
                      {post.image && (
                        <Image 
                          src={post.image} 
                          alt={post.title} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]" 
                        />
                      )}
                    </div>
                  </div>

                  {/* Taxonomy Badge & Date (3 Cols) */}
                  <div className="md:col-span-3">
                    <div className="text-[10px] tracking-widest-caps text-black/40 mb-2">{post.category}</div>
                    <div className="text-sm font-mono text-black/60">{post.date}</div>
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
