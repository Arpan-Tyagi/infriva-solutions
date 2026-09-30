import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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
        <li>Track leads from enquiry to conversion</li>
        <li>Schedule follow-ups and avoid missed opportunities</li>
        <li>Monitor marketing sources and lead performance</li>
        <li>Automate repetitive tasks</li>
      </ul>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Never Miss a Follow-Up</h3>
      <p>Not every customer converts after the first enquiry. CRM software helps your team schedule follow-ups, add notes and track lead status so potential customers don’t get forgotten.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Custom CRM vs Generic CRM</h3>
      <p>Generic CRM tools offer standard features, but they may not match every business workflow. A custom CRM can be built around your specific requirements, including Lead Management, Follow-Ups, Quotations, and Automation.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">How Infriva Solutions Can Help</h3>
      <p>Infriva Solutions develops custom CRM systems designed around your business process. Our solutions can connect with websites, contact forms, Meta Lead Ads, email systems and other business tools to create one central system for managing your growth.</p>
    `
  },
  "why-your-website-is-not-getting-leads-and-how-to-fix-it": {
    image: "/images/broken-bridge.jpg",
    title: "Why Your Website Is Not Getting Leads (And How to Fix It)",
    category: "Engineering",
    date: "Sep 12, 2026",
    content: `
      <p>Your website looks professional. Visitors are coming. But enquiries or sales are still low? The problem may not be traffic. It could be your content, user experience, trust signals, SEO, or conversion strategy.</p>
      <p>A good website should quickly explain your value, build confidence, and guide visitors toward the next step.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">1. Make Your Message Clear</h3>
      <p>Visitors should understand within seconds: What do you offer? Who is it for? Why should they choose you? Clear messaging makes your brand easier to understand and remember.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">2. Sell the Benefit, Not Just the Product</h3>
      <p>Customers care about what a product does for them. Features provide information, but benefits create desire.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">3. Attract the Right Visitors</h3>
      <p>More website traffic does not automatically mean more customers. Focus on search intent and keywords your ideal customers actually use. Quality traffic matters more than traffic alone.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">4. Use Strong Calls-to-Action</h3>
      <p>Every important page should make the next step obvious. Use specific CTAs and avoid vague buttons such as “Click Here.”</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">5. Build Trust</h3>
      <p>Before buying or enquiring, visitors want reassurance. Add customer reviews, real product images, case studies, and clear contact details. Give people reasons to believe you.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">6. Improve the Mobile Experience</h3>
      <p>Many visitors arrive through Google, Instagram, or ads on their phones. Your website should be fast, mobile-friendly, easy to navigate, and simple to shop or enquire from.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Final Thoughts</h3>
      <p>Your website should do more than explain what you sell. If your website gets visitors but not leads, don’t immediately chase more traffic. First, make sure the traffic you already have has a clear reason to stay — and take the next step.</p>
    `
  },
  "seo-vs-google-ads-which-is-better-for-your-business": {
    image: "/images/stone-monolith.jpg",
    title: "SEO vs Google Ads: Which is Better For Your Business?",
    category: "Growth",
    date: "Aug 30, 2026",
    content: `
      <p>Want more customers to find your business on Google? Two popular options are SEO and Google Ads. Both can increase visibility and bring potential customers to your website — but they work differently.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">What Is SEO?</h3>
      <p>SEO helps your website appear in organic Google search results. It involves improving your content, keywords, website structure, speed, and relevance. It generally takes time to build visibility, but strong pages can continue attracting organic visitors over the longer term.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">What Are Google Ads?</h3>
      <p>Google Ads places your business in paid search results for selected searches. Ads can provide visibility quickly and are particularly useful when someone is already searching for a specific product or service. The key difference is that paid visibility generally depends on your campaign continuing to run.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">The Real Difference: Customer Intent</h3>
      <p>Instead of only asking “SEO or Google Ads?”, ask: “What is my customer searching for, and how close are they to taking action?” Someone searching for "best notes for summer" is researching (SEO), while someone searching "buy luxury perfume online" shows purchase intent (Ads).</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">SEO + Google Ads Can Work Together</h3>
      <p>You don’t necessarily have to choose only one. SEO builds long-term discovery and organic visibility, while Google Ads captures immediate, high-intent searches. Together, they cover more stages of the customer journey.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Final Thoughts</h3>
      <p>There is no universal winner. The better strategy starts with three questions: What is your customer searching for? Are they researching or ready to act? Do you need visibility now or want to build it over time? The goal isn’t simply to choose SEO or Ads, it’s to use the right channel for the right customer intent.</p>
    `
  }
};

export function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts[slug];
  if (!post) {
    return {
      title: "Post Not Found | Infriva",
    };
  }

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
  if (!post) {
    notFound();
  }

  return (
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <Link href="/blog" className="inline-flex items-center gap-2 text-black/40 hover:text-brand-900 transition-colors mb-12 text-sm font-medium">
            <ArrowLeft size={16} />
            <span>Back to Insights</span>
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-[10px] tracking-widest-caps font-medium text-brand-900">{post.category}</div>
            <div className="w-1 h-1 rounded-full bg-black/20" />
            <div className="text-sm font-mono text-black/60">{post.date}</div>
          </div>
        </Reveal>
        
        <Reveal delay={0.2}>
          <h1 className="text-4xl md:text-6xl tracking-tight-display leading-[1.05] font-medium text-balance mb-12">
            {post.title}
          </h1>
        </Reveal>

        
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
        
        <Reveal delay={0.4}>
          <div 
            className="prose prose-lg prose-neutral max-w-none text-black/80 font-sans"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Reveal>

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
