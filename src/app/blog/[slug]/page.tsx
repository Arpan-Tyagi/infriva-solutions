/**
 * @file src/app/blog/[slug]/page.tsx
 * @description Dynamic Editorial Article Reader & Thought Leadership
 *
 * This Next.js Server Component dynamically renders agency editorial insights,
 * architectural essays, and growth strategies imported from Infriva's Medium publication.
 *
 * Architecture & SEO Patterns:
 * 1. Build-Time Static Generation (SSG):
 *    - `generateStaticParams()` pre-compiles all 5 articles into static HTML at build time.
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
      <p>Your reel gets views. People visit your profile. Engagement looks good.</p>
      <p>But very few people actually buy.</p>
      <p>This usually means your content is generating attention, but not enough interest, trust, or buying intent.</p>
      <p>Good social media content should help people understand the product, imagine using it, trust the brand, and take the next step.</p>
      
      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">1. Show the Situation, Not Just the Product</h3>
      <p>People connect better when they can picture a product in their own life.</p>
      <p>Instead of: "New linen shirt now available."</p>
      <p>Try: "An easy shirt for work mornings, café plans and relaxed weekends."</p>
      <p>For a perfume brand, instead of simply saying "Premium woody fragrance," describe the experience: "A warm scent made for evenings and moments when you want to leave an impression."</p>
      <p>The goal is to give the product a place in the customer's life.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">2. Different Brands Need Different Content</h3>
      <p>The same content strategy does not work for every business.</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li>A fashion brand can focus on styling, fit, comfort and occasions.</li>
        <li>A perfume brand can talk about mood, scent notes, personality and different occasions.</li>
        <li>A salon can highlight transformations, common hair or skin concerns, care tips and expertise.</li>
      </ul>
      <p>Your content should reflect why your customer is interested in your product or service.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">3. Viral Reach Is Not Always Valuable Reach</h3>
      <p>Thousands of views mean little if they come from people unlikely to become customers.</p>
      <p>A local salon needs relevant people nearby. A premium fashion brand needs an audience interested in its style and price range.</p>
      <p>Instead of asking only: "How many people saw this?"</p>
      <p>Also ask: "Did the right people see this?"</p>
      <p>Relevant reach can be more valuable than viral reach.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">4. Give Customers a Reason to Choose You</h3>
      <p>Customers see similar products every day. Your content should answer "Why this?"</p>
      <p>Show how an outfit fits and can be styled. Explain what kind of mood or occasion suits a fragrance. Show the atmosphere and experience around a restaurant meal.</p>
      <p>Help customers understand the experience behind the product, not just the product itself.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">5. Build Trust Before Asking for a Sale</h3>
      <p>Interest does not always lead directly to a purchase. Customers may need proof first.</p>
      <p>Use customer reviews, real photos, demonstrations, before-and-after results, product details, FAQs and genuine customer experiences.</p>
      <p>Trust-building content removes doubts that can prevent someone from taking action.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">6. Don't Make Every Post an Advertisement</h3>
      <p>If every post says "Buy Now," "Shop Today," or "Book Now," people may stop paying attention.</p>
      <p>Mix promotional content with useful content.</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li>Fashion: "3 ways to style one black shirt."</li>
        <li>Perfume: "Fresh, sweet or woody — which fragrance family suits you?"</li>
        <li>Salon: "Why does your hair still feel dry after conditioning?"</li>
      </ul>
      <p>Give people a reason to follow your brand even when they are not ready to buy yet.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">7. Use the Right CTA</h3>
      <p>Your call-to-action should match the content.</p>
      <p>A styling reel might end with "Save this look for later."</p>
      <p>An educational perfume post could ask "Fresh, sweet or woody — which do you prefer?"</p>
      <p>When someone is ready to buy, you can guide them toward exploring the collection, visiting the website, messaging the brand, or booking.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">8. Measure More Than Views</h3>
      <p>Views tell you how much attention your content received — not necessarily how much business it created.</p>
      <p>Also track: Profile Visits • Saves • Shares • Website Clicks • Messages • Enquiries • Product Clicks • Purchases</p>
      <p>A post with 5,000 relevant views and genuine enquiries may be more valuable than a viral post with 100,000 views but no action.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Final Thoughts</h3>
      <p>Social media should move customers through a journey: <strong>Attention → Interest → Trust → Action</strong></p>
      <p>A fashion brand is not just showing clothes — it is helping someone imagine a look.<br />
      A perfume brand is not just showing a bottle — it is creating a mood or feeling.<br />
      A salon is not just showing a service — it is showing the result someone wants.</p>
      <p>Don't create content only to be seen. Create content that gives the right audience a reason to care, trust and act.</p>
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
      <p>A CRM (Customer Relationship Management) system stores important customer information, enquiries, conversations, follow-ups and sales activity in a central dashboard.</p>
      <p>Instead of managing everything separately, your team can track the complete customer journey in one place.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Key Benefits of CRM for Small Businesses</h3>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li>Manage all leads and customer data in one place</li>
        <li>Assign leads to team members</li>
        <li>Track leads from enquiry to conversion</li>
        <li>Schedule follow-ups and avoid missed opportunities</li>
        <li>Monitor marketing sources and lead performance</li>
        <li>Improve team collaboration</li>
        <li>Automate repetitive tasks</li>
      </ul>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Never Miss a Follow-Up</h3>
      <p>Not every customer converts after the first enquiry. CRM software helps your team schedule follow-ups, add notes and track lead status so potential customers don't get forgotten.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Know Where Your Leads Come From</h3>
      <p>A CRM can track leads from Google Ads, Meta Ads, websites, referrals and social media. This helps businesses understand which marketing channels are generating enquiries and conversions.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Custom CRM vs Generic CRM</h3>
      <p>Generic CRM tools offer standard features, but they may not match every business workflow.</p>
      <p>A custom CRM can be built around your specific requirements, including: Lead Management | Follow-Ups | Quotations | Projects | Employee Roles | Reports | Automation.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">How Infriva Solutions Can Help</h3>
      <p>Infriva Solutions develops custom CRM systems designed around your business process. Our solutions can connect with websites, contact forms, Meta Lead Ads, email systems and other business tools.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Conclusion</h3>
      <p>CRM software can help small businesses organise leads, improve follow-ups, increase team productivity and make better decisions using real business data.</p>
      <p>A CRM built around your workflow can become one central system for managing your leads, customers and business operations.</p>
    `
  },
  "why-your-website-is-not-getting-leads-and-how-to-fix-it": {
    image: "/images/broken-bridge.jpg",
    title: "Why Your Website Is Not Getting Leads (And How to Fix It)",
    category: "Development",
    date: "Sep 15, 2026",
    content: `
      <p>Your website looks professional. Visitors are coming. But enquiries or sales are still low?</p>
      <p>The problem may not be traffic. It could be your content, user experience, trust signals, SEO, or conversion strategy.</p>
      <p>A good website should quickly explain your value, build confidence, and guide visitors toward the next step.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">1. Make Your Message Clear</h3>
      <p>Visitors should understand within seconds: What do you offer? Who is it for? Why should they choose you?</p>
      <p>Instead of "Premium fragrances," try: "Find a fragrance people remember long after you leave the room."</p>
      <p>Clear messaging makes your brand easier to understand and remember.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">2. Sell the Benefit, Not Just the Product</h3>
      <p>Customers care about what a product does for them.</p>
      <p>Instead of: "Made with premium cotton."</p>
      <p>Try: "Soft, breathable cotton designed for all-day comfort."</p>
      <p>Features provide information. Benefits create desire.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">3. Attract the Right Visitors</h3>
      <p>More website traffic does not automatically mean more customers.</p>
      <p>Focus on search intent and keywords your ideal customers actually use. A fashion brand might target terms such as <em>women's co-ord sets</em> or <em>office wear for women</em>, while a perfume brand could focus on <em>long-lasting perfume</em> or <em>perfume for office wear</em>.</p>
      <p>Quality traffic matters more than traffic alone.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">4. Use Strong Calls-to-Action</h3>
      <p>Every important page should make the next step obvious.</p>
      <p>Use specific CTAs such as: Shop the Collection • Find Your Signature Scent • Request a Quote.</p>
      <p>Avoid vague buttons such as "Click Here."</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">5. Build Trust</h3>
      <p>Before buying or enquiring, visitors want reassurance.</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li>Customer reviews and testimonials</li>
        <li>Real product images</li>
        <li>Delivery and return information</li>
        <li>Contact details</li>
        <li>Case studies or results</li>
      </ul>
      <p>Don't just tell people your brand is trustworthy. Give them reasons to believe it.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">6. Improve the Mobile Experience</h3>
      <p>Many visitors arrive through Google, Instagram, or ads on their phones.</p>
      <p>Your website should be fast, mobile-friendly, easy to navigate, and simple to shop or enquire from.</p>
      <p>The journey should feel effortless: Search/Social Media → Website → Product or Service → Action.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">7. Don't Ignore SEO</h3>
      <p>A beautiful website has limited value if potential customers cannot find it.</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li>Relevant keywords</li>
        <li>SEO-friendly titles and headings</li>
        <li>Internal linking</li>
        <li>Optimized images</li>
        <li>Website speed</li>
        <li>Helpful content</li>
      </ul>
      <p>For example, a fashion brand could publish "How to Style a Co-ord Set for Different Occasions," while a perfume brand could cover "How to Choose the Right Perfume for Your Personality."</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Final Thoughts</h3>
      <p>Your website should do more than explain what you sell. It should help visitors understand the brand, connect with the offer, trust the business, and take action.</p>
      <p>The formula is simple: <strong>Clear Message → Right Audience → Trust → Easy Experience → Strong CTA</strong></p>
      <p>If your website gets visitors but not leads, don't immediately chase more traffic. First, make sure the traffic you already have has a clear reason to stay — and take the next step.</p>
    `
  },
  "seo-vs-google-ads-which-is-better-for-your-business": {
    image: "/images/flight-smartphone.jpg",
    title: "SEO vs Google Ads: Which is Better For Your Business?",
    category: "Growth",
    date: "Sep 10, 2026",
    content: `
      <p>Want more customers to find your business on Google?</p>
      <p>Two popular options are SEO and Google Ads. Both can increase visibility and bring potential customers to your website — but they work differently.</p>
      <p>The right approach depends on customer intent, your goals, and how quickly you need visibility.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">What Is SEO?</h3>
      <p>SEO helps your website appear in organic Google search results.</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li>Fashion: "women's co-ord sets online"</li>
        <li>Perfume: "long-lasting perfume for women"</li>
        <li>Salon: "hair salon near me"</li>
      </ul>
      <p>SEO involves improving your content, keywords, website structure, speed, user experience, and relevance. It generally takes time to build visibility, but strong pages can continue attracting organic visitors over the longer term.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">What Are Google Ads?</h3>
      <p>Google Ads places your business in paid search results for selected searches.</p>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li>Fashion: "buy party dresses online"</li>
        <li>Perfume: "buy luxury perfume online"</li>
        <li>Salon: "bridal makeup artist near me"</li>
      </ul>
      <p>Ads can provide visibility quickly and are particularly useful when someone is already searching for a specific product or service. The key difference is that paid visibility generally depends on your campaign continuing to run.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">The Real Difference: Customer Intent</h3>
      <p>Instead of only asking "SEO or Google Ads?", ask: <strong>"What is my customer searching for, and how close are they to taking action?"</strong></p>
      <p>Consider a perfume brand. Someone searching "best perfume notes for summer" may still be researching. Helpful SEO content can introduce the brand at this stage.</p>
      <p>Someone searching "buy long-lasting perfume for men" shows stronger purchase intent. A relevant search ad can reach them at that moment.</p>
      <p>Both searches are valuable — they simply represent different stages of the customer journey.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">When SEO Makes Sense</h3>
      <p>SEO can be valuable when customers regularly search for information related to your products or services.</p>
      <p>A fashion brand could publish: "How to Style a Co-ord Set for Work and Weekends"</p>
      <p>A perfume brand: "How to Find the Right Perfume for Your Personality"</p>
      <p>A salon: "How Often Should You Get a Hair Spa?"</p>
      <p>Useful content can answer customer questions while gradually building your brand's organic search visibility and authority.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">When Google Ads Makes Sense</h3>
      <p>Google Ads can help when you want to reach people searching for something specific right now.</p>
      <p>For example: "Keratin treatment near me" or "Buy summer dresses online."</p>
      <p>These searches often indicate clearer intent, making them useful for targeted campaigns, launches, offers, or services.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">SEO + Google Ads Can Work Together</h3>
      <p>You don't necessarily have to choose only one. Think of it this way:</p>
      <p><strong>SEO → Build long-term discovery and organic visibility</strong></p>
      <p><strong>Google Ads → Capture immediate, high-intent searches</strong></p>
      <p>Ads can help reach customers actively searching today, while SEO can build visibility across informational and commercial searches over time.</p>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Quick Comparison</h3>
      <ul class="list-disc pl-6 space-y-2 mb-8">
        <li><strong>SEO:</strong> Organic search visibility, usually takes longer, supports long-term discovery, strong for helpful content, traffic doesn't depend on paying per click.</li>
        <li><strong>Google Ads:</strong> Paid search visibility, can provide faster visibility, useful for immediate campaigns, strong for high-intent searches, traffic depends on active ad spend.</li>
      </ul>

      <h3 class="text-2xl font-medium tracking-tight mt-12 mb-4 text-black">Final Thoughts</h3>
      <p>There is no universal winner between SEO and Google Ads. The better strategy starts with three questions:</p>
      <ol class="list-decimal pl-6 space-y-2 mb-8">
        <li>What is your customer searching for?</li>
        <li>Are they researching or ready to act?</li>
        <li>Do you need visibility now or want to build it over time?</li>
      </ol>
      <p>The goal isn't simply to choose SEO or Ads. It's to use the right channel for the right customer intent and business objective.</p>
    `
  },
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
      <p>A new startup usually has one major challenge: <strong>Very few people know it exists.</strong></p>
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
      <p>Customers usually research before choosing a new business. Useful content such as:</p>
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
      <p>Strong brands are not built overnight. They grow through <strong>consistent visibility, useful content, customer trust and a strong digital presence.</strong></p>
      <p>Digital marketing gives startups the tools to reach the right audience, build credibility and compete more effectively online.</p>
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
    title: \`\${post.title} | Infriva Insights\`,
    description: cleanDescription,
    openGraph: {
      title: \`\${post.title} | Infriva Insights\`,
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
