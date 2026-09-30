/**
 * @file src/app/blog/[slug]/page.tsx
 * @description Dynamic Editorial Article Reader & Thought Leadership
 *
 * This Next.js Server Component dynamically renders agency editorial insights,
 * architectural essays, and growth strategies imported from Infriva's Medium publication.
 *
 * Architecture & SEO Patterns:
 * 1. Build-Time Static Generation (SSG):
 *    - `generateStaticParams()` pre-compiles all 4 articles into static HTML at build time.
 * 2. Automated Meta Description Extraction:
 *    - In `generateMetadata`, strips HTML tags from raw content strings to generate clean,
 *      160-character search engine snippets.
 * 3. Typography & Reading Experience:
 *    - Utilizes custom `.prose` rules from `globals.css` to provide generous line height (1.75),
 *      relaxed paragraph margins, and styled lists.
 * 4. Contextual Conversion Funnel:
 *    - Every article concludes with an architectural call-to-action module linking directly
 *      to `/contact` for strategic implementation consultations.
 */

import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

/**
 * Editorial Article Registry
 * Contains full markdown/HTML article copy, publication dates, and category tags.
 */
const blogPosts: Record<string, { title: string, category: string, date: string, content: string, image?: string }> = {
  "why-your-social-media-gets-attention-but-not-customers": {
    image: "/images/marketing-megaphone.jpg",
    title: "Why Your Social Media Gets Attention But Not Customers",
    category: "Marketing",
    date: "Sep 25, 2026",
    content: `
      <p>Your reel gets views. People visit your profile. Engagement looks good. But very few people actually buy.</p>
      <p>This usually means your content is generating attention, but not enough interest, trust, or buying intent. Good social media content should help people understand the product, imagine using it, trust the brand, and take the next step.</p>
      
      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">1. Show the Situation, Not Just the Product</h3>
      <p>People connect better when they can picture a product in their own life. Instead of saying “New linen shirt now available,” try: “An easy shirt for work mornings, café plans and relaxed weekends.” The goal is to give the product a place in the customer’s life.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">2. Different Brands Need Different Content</h3>
      <p>The same content strategy does not work for every business. A fashion brand can focus on styling; a perfume brand on mood and scent notes; a salon on transformations and expertise. Your content should reflect why your customer is interested.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">3. Viral Reach Is Not Always Valuable Reach</h3>
      <p>Thousands of views mean little if they come from people unlikely to become customers. Instead of asking only “How many people saw this?”, also ask “Did the right people see this?” Relevant reach is more valuable than viral reach.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">4. Give Customers a Reason to Choose You</h3>
      <p>Your content should answer “Why this?” Help customers understand the experience behind the product, not just the product itself.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">5. Build Trust Before Asking for a Sale</h3>
      <p>Interest does not always lead directly to a purchase. Use customer reviews, real photos, demonstrations, and FAQs. Trust-building content removes doubts that prevent action.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">6. Don’t Make Every Post an Advertisement</h3>
      <p>Mix promotional content with useful content. Give people a reason to follow your brand even when they are not ready to buy yet.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">7. Use the Right CTA</h3>
      <p>Your call-to-action should match the content. When someone is ready to buy, guide them toward exploring the collection, visiting the website, or messaging the brand.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">8. Measure More Than Views</h3>
      <p>Track Profile Visits, Website Clicks, Enquiries, and Purchases. A post with 5,000 relevant views and genuine enquiries is more valuable than a viral post with 100,000 views but no action.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Final Thoughts</h3>
      <p>Social media should move customers through a journey: Attention → Interest → Trust → Action. Don’t create content only to be seen. Create content that gives the right audience a reason to care, trust and act.</p>
    `
  },
  "why-every-small-business-needs-crm-software": {
    image: "/images/paper-receipts.jpg",
    title: "Why Every Small Business Needs CRM Software",
    category: "Systems",
    date: "Sep 20, 2026",
    content: `
      <p>Managing leads through spreadsheets, WhatsApp, emails and notes can become difficult as your business grows. CRM software helps you manage leads, customers, follow-ups and sales activities from one place.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">What Is CRM Software?</h3>
      <p>A CRM (Customer Relationship Management) system stores important customer information, enquiries, conversations, follow-ups and sales activity in a central dashboard. Instead of managing everything separately, your team can track the complete customer journey in one place.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Key Benefits of CRM for Small Businesses</h3>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li>Manage all leads and customer data in one place</li>
        <li>Assign leads to team members</li>
        <li>Track conversations across channels (calls, WhatsApp, email)</li>
        <li>Set reminders for follow-ups so inquiries don't get forgotten</li>
        <li>View deals at different stages of the sales process</li>
        <li>Monitor team performance and sales results</li>
      </ul>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Signs You Need a CRM</h3>
      <p>If you're missing follow-ups, losing lead details across chat apps, or struggling to see which sales reps are closing deals, your business has outgrown manual tracking.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Custom CRM vs Off-the-Shelf Tools</h3>
      <p>Popular tools like HubSpot or Zoho work well for many companies, but often come with high monthly costs and features you may never use. A custom CRM is designed specifically around your workflow, meaning you only pay for what you need with no per-user license fees.</p>
    `
  },
  "why-your-website-is-not-getting-leads-and-how-to-fix-it": {
    image: "/images/broken-bridge.jpg",
    title: "Why Your Website Is Not Getting Leads (And How to Fix It)",
    category: "Development",
    date: "Sep 15, 2026",
    content: `
      <p>Getting traffic to your website is only half the battle. If visitors aren't filling out forms or reaching out, your site has a conversion leak. Here is how to diagnose and fix it.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">1. Slow Page Speed Kills Conversions</h3>
      <p>Every second of load delay reduces conversions by up to 20%. Ensure your site uses modern frameworks like Next.js with optimized images and minimal third-party script bloat.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">2. Confusing Value Proposition</h3>
      <p>Visitors decide within 5 seconds whether to stay. If your hero section doesn't clearly explain what you do, who you do it for, and the outcome you deliver, they will bounce.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">3. Forms Have Too Much Friction</h3>
      <p>Asking for 10 fields on a contact form reduces submissions dramatically. Keep initial contact forms to essentials: Name, Email/Phone, and Project Scope.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">4. Lack of Social Proof</h3>
      <p>Without case studies, metrics, or client testimonials, visitors have no reason to trust an unfamiliar company. Display outcomes prominently.</p>
    `
  },
  "seo-vs-google-ads-which-is-better-for-your-business": {
    image: "/images/flight-smartphone.jpg",
    title: "SEO vs Google Ads: Which is Better For Your Business?",
    category: "Growth",
    date: "Sep 10, 2026",
    content: `
      <p>Both SEO and Google Ads are powerful ways to attract customers searching for your services. Understanding when to use each can save thousands in marketing spend.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Google Ads: Speed and Control</h3>
      <p>Google Ads delivers immediate visibility. The moment your campaign goes live, you can appear at the top of search results for high-intent keywords. Ideal for new offers, time-sensitive promotions, or rapid market validation.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">SEO: Compounding Long-Term ROI</h3>
      <p>SEO takes 3-6 months to build momentum, but once established, it provides consistent leads without paying for each individual click. It builds durable brand equity and trust.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">The Hybrid Approach</h3>
      <p>The most successful businesses run Google Ads for immediate revenue while investing in SEO and Generative Engine Optimization (GEO) to dominate search over the long term.</p>
    `
  }
};

/**
 * Pre-computes all blog post routes for static build generation.
 */
export function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({ slug }));
}

/**
 * Derives document metadata and OpenGraph preview tags.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts[slug];
  if (!post) {
    return {
      title: "Article Not Found | Infriva",
    };
  }

  // Strip HTML tags from article body to generate a clean 160-character description snippet
  const cleanDescription = post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);

  return {
    title: `${post.title} | Infriva Insights`,
    description: cleanDescription,
    openGraph: {
      title: `${post.title} | Infriva Insights`,
      description: cleanDescription,
      images: post.image ? [post.image] : undefined,
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts[slug];
  
  // Render 404 boundary if article slug is invalid
  if (!post) {
    notFound();
  }

  return (
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Back Link to Editorial Directory */}
        <Reveal>
          <Link href="/blog" className="inline-flex items-center gap-2 text-black/40 hover:text-brand-900 transition-colors mb-12 text-sm font-medium">
            <ArrowLeft size={16} />
            <span>Back to Insights</span>
          </Link>
        </Reveal>

        {/* Category & Date Metadata Badges */}
        <Reveal delay={0.1}>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-[10px] tracking-widest-caps font-medium text-brand-900">{post.category}</div>
            <div className="w-1 h-1 rounded-full bg-black/20" />
            <div className="text-sm font-mono text-black/60">{post.date}</div>
          </div>
        </Reveal>
        
        {/* Article Headline */}
        <Reveal delay={0.2}>
          <h1 className="text-4xl md:text-6xl tracking-tight-display leading-[1.05] font-medium text-balance mb-12">
            {post.title}
          </h1>
        </Reveal>

        {/* Editorial Feature Image Banner */}
        <Reveal delay={0.25}>
          {post.image && (
            <div className="w-full h-[40vh] md:h-[60vh] relative mb-12 overflow-hidden bg-brand-100 rounded-xl border border-black/5">
              <Image src={post.image} alt={post.title} fill className="object-cover" />
            </div>
          )}
        </Reveal>

        <Reveal delay={0.3}>
          <div className="w-full h-px bg-black/10 mb-12" />
        </Reveal>
        
        {/* Long-Form Prose Typography Content */}
        <Reveal delay={0.4}>
          <div 
            className="prose prose-lg prose-neutral max-w-none text-black/80 font-sans"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Reveal>

        {/* Post-Article Lead Conversion Anchor */}
        <Reveal delay={0.5}>
          <div className="mt-24 p-8 bg-brand-50 rounded-2xl border border-black/5 text-center">
            <h3 className="text-2xl leading-[1.4] font-medium tracking-tight-display mb-4">Ready to upgrade your systems?</h3>
            <p className="text-black/60 mb-8 max-w-md mx-auto">Let&apos;s discuss how we can implement these strategies in your business.</p>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 bg-brand-900 text-white rounded-xl hover:bg-black transition-colors font-medium tracking-tight text-sm">
              Start a Conversation
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
