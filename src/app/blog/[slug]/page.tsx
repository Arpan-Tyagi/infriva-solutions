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
  "how-digital-marketing-helps-startups-build-their-brand": {
    image: "/images/marketing-megaphone.jpg",
    title: "How Digital Marketing Helps Startups Build Their Brand",
    category: "Marketing",
    date: "Sep 30, 2026",
    content: `
      <p>Starting a business is exciting, but building a brand people remember is the real challenge.</p>
      <p>For startups, having a good product or service is not enough. People first need to <strong>discover your brand, understand what you offer, and trust you enough to choose you.</strong></p>
      <p>That is where digital marketing becomes important.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">1. It Helps People Discover Your Brand</h3>
      <p>A new startup usually has one major challenge:</p>
      <p><strong>Very few people know it exists.</strong></p>
      <p>Digital marketing helps your business reach potential customers through:</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li>Google Search</li>
        <li>Social Media</li>
        <li>SEO</li>
        <li>Google Ads</li>
        <li>Meta Ads</li>
        <li>Content Marketing</li>
      </ul>
      <p>The more consistently your brand appears in the right places, the more familiar it becomes to your audience.</p>
      <p><strong>Visibility is the first step toward brand growth.</strong></p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">2. It Builds a Strong Brand Identity</h3>
      <p>Your brand is more than just a logo. It includes your:</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li>website design</li>
        <li>colours</li>
        <li>messaging</li>
        <li>social media style</li>
        <li>content</li>
        <li>customer experience</li>
      </ul>
      <p>A consistent identity makes your startup look more professional and easier to remember.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">3. Social Media Builds Connection</h3>
      <p>Social media is not only for promotions. Startups can use it to:</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li>share useful tips</li>
        <li>show behind-the-scenes content</li>
        <li>explain products or services</li>
        <li>answer customer questions</li>
        <li>share results</li>
        <li>showcase customer feedback</li>
      </ul>
      <p>This helps your business feel more genuine and approachable.</p>
      <p><strong>Good social media does not just build followers. It builds relationships.</strong></p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">4. SEO Helps Customers Find You</h3>
      <p>If people are already searching for the service you offer, your business should be visible when they search online.</p>
      <p>SEO can help your startup improve visibility on search engines through:</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li>relevant keywords</li>
        <li>useful website content</li>
        <li>optimized service pages</li>
        <li>local SEO</li>
        <li>internal linking</li>
        <li>fast website performance</li>
      </ul>
      <p>SEO can support long-term organic growth and bring visitors who are already interested in your services.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">5. Paid Ads Can Give Faster Reach</h3>
      <p>Organic growth takes time. Google Ads and social media ads can help startups reach targeted audiences faster.</p>
      <p>You can target users based on:</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li>location</li>
        <li>interests</li>
        <li>behaviour</li>
        <li>search intent</li>
        <li>demographics</li>
      </ul>
      <p>This helps businesses spend their marketing budget more efficiently.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">6. Content Builds Trust</h3>
      <p>Customers usually research before choosing a new business.</p>
      <p>Useful content such as:</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li>blogs</li>
        <li>videos</li>
        <li>guides</li>
        <li>FAQs</li>
        <li>case studies</li>
        <li>social posts</li>
      </ul>
      <p>can answer questions and help your brand appear more knowledgeable.</p>
      <p><strong>Helpful content builds confidence before the customer even contacts you.</strong></p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">7. A Professional Website Strengthens Your Brand</h3>
      <p>Your website is often the first serious impression of your business. It should clearly explain:</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>What you offer</strong></li>
        <li><strong>Who you help</strong></li>
        <li><strong>Why customers should trust you</strong></li>
        <li><strong>What they should do next</strong></li>
      </ul>
      <p>A fast, mobile-friendly and professional website can make your startup look more credible.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Quick Startup Digital Marketing Checklist</h3>
      <p>Make sure your startup has:</p>
      <ul class="list-none pl-0 space-y-2 mb-8">
        <li>✓ Professional website</li>
        <li>✓ Clear brand messaging</li>
        <li>✓ Active social media presence</li>
        <li>✓ SEO-friendly content</li>
        <li>✓ Strong call-to-action</li>
        <li>✓ Customer reviews or testimonials</li>
        <li>✓ Analytics and conversion tracking</li>
      </ul>
      <p>These elements help turn a new business into a more recognizable brand.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Final Thoughts</h3>
      <p>Strong brands are not built overnight.</p>
      <p>They grow through <strong>consistent visibility, useful content, customer trust and a strong digital presence.</strong></p>
      <p>Digital marketing gives startups the tools to reach the right audience, build credibility and compete more effectively online.</p>
      <p>At <strong>Infriva Solutions</strong>, we help businesses strengthen their digital presence through website development, SEO, social media marketing and digital marketing strategies.</p>
      <p><strong>Want to build a brand people recognize and trust?</strong></p>
      <p>Connect with <strong>Infriva Solutions</strong> and start building a stronger digital presence.</p>
    `
  },
  "why-your-social-media-gets-attention-but-not-customers": {
    image: "/images/marketing-megaphone.jpg",
    title: "Why Your Social Media Gets Attention But Not Customers",
    category: "Marketing",
    date: "Sep 25, 2026",
    content: `
      <p>Your reel gets views. People visit your profile. Engagement looks good. But very few people actually buy.</p>
      <p>This usually means your content is generating attention, but not enough interest, trust, or buying intent. Good social media content should help people understand the product, imagine using it, trust the brand, and take the next step.</p>
      
      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">1. Show the Situation, Not Just the Product</h3>
      <p>People connect better when they can picture a product in their own life. Instead of saying "New linen shirt now available," try: "An easy shirt for work mornings, café plans and relaxed weekends." For a perfume brand, instead of simply saying "Premium woody fragrance," describe the experience: "A warm scent made for evenings and moments when you want to leave an impression." The goal is to give the product a place in the customer's life.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">2. Different Brands Need Different Content</h3>
      <p>The same content strategy does not work for every business.</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li>A fashion brand can focus on styling, fit, comfort and occasions.</li>
        <li>A perfume brand can talk about mood, scent notes, personality and different occasions.</li>
        <li>A salon can highlight transformations, common hair or skin concerns, care tips and expertise.</li>
      </ul>
      <p>Your content should reflect exactly why your customer is interested in your product or service.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">3. Viral Reach Is Not Always Valuable Reach</h3>
      <p>Thousands of views mean little if they come from people unlikely to become customers. A local salon needs relevant people nearby. A premium fashion brand needs an audience interested in its style and price range. Instead of asking only "How many people saw this?", also ask "Did the right people see this?" Relevant reach can be infinitely more valuable than viral reach.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">4. Give Customers a Reason to Choose You</h3>
      <p>Your content should answer "Why this?" Help customers understand the experience, the craftsmanship, or the unique problem-solving capabilities behind the product, not just the product itself.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">5. Build Trust Before Asking for a Sale</h3>
      <p>Interest does not always lead directly to a purchase. Use customer reviews, real photos, demonstrations, and FAQs. Trust-building content removes the friction and doubts that prevent action.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">6. Don't Make Every Post an Advertisement</h3>
      <p>Mix promotional content with useful, educational, or aesthetic content. Give people a reason to follow your brand even when they are not ready to buy yet. If every post is a hard sell, they will unfollow.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">7. Use the Right Call-to-Action (CTA)</h3>
      <p>Your CTA should match the content. When someone is ready to buy, guide them toward exploring the collection, visiting the website, or messaging the brand. Make the next step frictionless.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Final Thoughts</h3>
      <p>Social media should move customers through a journey: Attention → Interest → Trust → Action. Don't create content only to be seen. Create content that gives the right audience a reason to care, trust and act.</p>
    `
  },
  "why-every-small-business-needs-crm-software": {
    image: "/images/paper-receipts.jpg",
    title: "Why Every Small Business Needs CRM Software",
    category: "Systems",
    date: "Sep 20, 2026",
    content: `
      <p>Managing leads through spreadsheets, WhatsApp, emails and sticky notes works when you have ten clients. But as your business scales, it becomes a chaotic liability. Leads fall through the cracks, follow-ups are forgotten, and sales data is siloed. Enter CRM software.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">What Is CRM Software?</h3>
      <p>A CRM (Customer Relationship Management) system stores important customer information, enquiries, conversations, follow-ups and sales activity in a central dashboard. Instead of managing everything separately across five different apps, your team can track the complete customer journey in one unified interface.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Key Benefits of CRM for Small Businesses</h3>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>Centralized Data Hub:</strong> Manage all leads, client history, and customer data in one secure place.</li>
        <li><strong>Automated Distribution:</strong> Automatically assign incoming leads to the right team members.</li>
        <li><strong>Omnichannel Tracking:</strong> Track conversations across WhatsApp, Meta, email, and SMS.</li>
        <li><strong>Zero Dropped Leads:</strong> Set automated reminders for follow-ups so inquiries never get forgotten.</li>
        <li><strong>Visual Pipelines:</strong> View deals at different stages of the sales process using Kanban boards.</li>
        <li><strong>Data-Driven Analytics:</strong> Monitor team performance, conversion rates, and sales results in real-time.</li>
      </ul>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Signs You Have Outgrown Manual Tracking</h3>
      <p>If you're missing follow-ups, losing lead details when an employee leaves, or struggling to figure out which marketing channel actually drove the most sales, your business has officially outgrown manual tracking. Operating without a CRM at scale is equivalent to driving blindfolded.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Custom CRM vs Off-the-Shelf Tools</h3>
      <p>Popular tools like HubSpot, Salesforce, or Zoho work well for many companies. However, they often come with steep learning curves, high monthly per-user licensing costs, and bloated features you may never use.</p>
      <p>At Infriva Solutions, we advocate for and build <strong>Custom CRM Systems</strong>. A custom CRM is designed specifically around your unique workflow. It means you own the software, you own the data, and you eliminate recurring per-user license fees forever. It adapts to your business, rather than forcing your business to adapt to the software.</p>
    `
  },
  "why-your-website-is-not-getting-leads-and-how-to-fix-it": {
    image: "/images/broken-bridge.jpg",
    title: "Why Your Website Is Not Getting Leads (And How to Fix It)",
    category: "Development",
    date: "Sep 15, 2026",
    content: `
      <p>Getting traffic to your website is only half the battle. If thousands of visitors are arriving but nobody is filling out forms or reaching out, your site has a fundamental conversion leak. A website should be your best 24/7 salesperson. Here is how to diagnose and fix a site that isn't converting.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">1. Slow Page Speed Kills Conversions</h3>
      <p>Every second of load delay reduces conversions by up to 20%. If your site takes more than 3 seconds to load, visitors will hit the back button and go to your competitor. Ensure your site uses modern, server-rendered frameworks like Next.js, utilizes optimized Next/Image components, and eliminates bloated third-party scripts. Speed is a feature.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">2. A Confusing Value Proposition</h3>
      <p>Visitors decide within 5 seconds whether to stay. If your hero section doesn't clearly explain what you do, who you do it for, and the outcome you deliver, they will bounce. Stop using vague corporate jargon like "Synergistic Solutions for Tomorrow." Instead, be clear: "We Build Custom CRM Systems for Real Estate Agencies."</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">3. Forms Have Too Much Friction</h3>
      <p>Asking for 10 fields on a contact form reduces submissions dramatically. Keep initial contact forms strictly to the essentials: Name, Email or Phone, and Project Scope. You can gather the rest of the information during the discovery call. Reduce the barrier to entry.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">4. Lack of Social Proof and Trust Indicators</h3>
      <p>Without case studies, metrics, or client testimonials, visitors have no reason to trust an unfamiliar company. Display your outcomes prominently. Use real logos, real names, and quantifiable results (e.g., "Increased lead volume by 150% in 3 months").</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">5. Mobile Responsiveness Failures</h3>
      <p>Over 60% of web traffic is mobile. If your website requires zooming in to read text, has overlapping buttons, or features a form that doesn't trigger the proper mobile keyboard (like a number pad for phone fields), you are losing the majority of your leads. Mobile-first design is no longer optional.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">The Fix</h3>
      <p>Audit your site objectively. Fix the performance bottlenecks, clarify your copy, simplify your forms, and inject trust. A beautiful website that doesn't convert is just digital art; a beautiful website optimized for UI/UX is an engine for growth.</p>
    `
  },
  "seo-vs-google-ads-which-is-better-for-your-business": {
    image: "/images/flight-smartphone.jpg",
    title: "SEO vs Google Ads: Which is Better For Your Business?",
    category: "Growth",
    date: "Sep 10, 2026",
    content: `
      <p>The classic digital marketing dilemma: Should you invest your budget into Search Engine Optimization (SEO) or pay for immediate clicks via Google Ads? Both are incredibly powerful ways to attract customers searching for your services, but understanding when to use each can save you thousands in misallocated marketing spend.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Google Ads: Speed, Precision, and Control</h3>
      <p>Google Ads (PPC) delivers immediate visibility. The moment your campaign goes live, you can appear at the very top of search results for high-intent keywords.</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>Pros:</strong> Instant traffic, highly measurable ROI, precise geographic and demographic targeting, and the ability to turn it off instantly.</li>
        <li><strong>Cons:</strong> You pay for every single click. The moment you stop paying, your traffic drops to zero. It can become expensive in highly competitive industries (like law or insurance).</li>
      </ul>
      <p><em>Best For:</em> New businesses needing immediate cash flow, time-sensitive promotions, rapid market validation, or highly transactional services (e.g., "Emergency plumber near me").</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">SEO: The Compounding Long-Term ROI</h3>
      <p>SEO is the process of optimizing your website to rank organically. It takes 3-6 months to build momentum, but once established, it provides a massive competitive moat.</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>Pros:</strong> You don't pay for individual clicks. It builds durable brand equity, establishes authority, and generally yields a much higher ROI over a multi-year horizon.</li>
        <li><strong>Cons:</strong> It requires patience, upfront investment in technical architecture and content, and continuous maintenance against Google's algorithm updates.</li>
      </ul>
      <p><em>Best For:</em> Long-term market dominance, educational content, B2B services with long sales cycles, and businesses looking to reduce their customer acquisition cost (CAC) over time.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">The Omnichannel Hybrid Approach</h3>
      <p>The most successful businesses do not choose one or the other. They run <strong>Google Ads for immediate revenue</strong> and keyword testing, while simultaneously investing in <strong>SEO and Generative Engine Optimization (GEO)</strong> to dominate search over the long term.</p>
      <p>Use Ads to capture the low-hanging fruit today, and use SEO to plant the orchard for tomorrow.</p>
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
