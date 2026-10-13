import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { Ticker } from "@/components/ui/Ticker";
import { ContactForm } from "./ContactForm";
import { AGENCY_NAP, SITE_URL, buildBreadcrumbJsonLd, buildContactPageJsonLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Infriva Solutions | Initiate Your B2B Digital System",
  description:
    "Schedule a technical consultation with Infriva Solutions in New Delhi. Discuss Next.js web development, custom PostgreSQL CRMs, SEO/GEO, and WhatsApp automation.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Infriva Solutions | Initiate Your B2B Digital System",
    description:
      "Schedule a technical consultation with Infriva Solutions in New Delhi. Discuss Next.js web development, custom PostgreSQL CRMs, SEO/GEO, and WhatsApp automation.",
    url: `${SITE_URL}/contact`,
    type: "website",
    images: ["/images/minimalist-office.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Infriva Solutions | Initiate Your B2B Digital System",
    description:
      "Schedule a technical consultation with Infriva Solutions in New Delhi. Discuss Next.js web development, custom PostgreSQL CRMs, SEO/GEO, and WhatsApp automation.",
    images: ["/images/minimalist-office.jpg"],
  },
};

export default function Contact() {
  const contactJsonLd = [
    buildContactPageJsonLd(),
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" },
    ]),
  ];

  return (
    <div className="w-full pt-32 pb-16 md:pt-40 md:pb-24 px-4 md:px-12 min-h-[calc(100vh-400px)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24">
        {/* Left Column: Headline, Direct NAP Details & Trust Indicators */}
        <div className="w-full lg:w-[38.2%] flex flex-col justify-between">
          <div>
            <Reveal priority className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-900" />
              <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">Initiate</span>
            </Reveal>

            <Reveal priority>
              <h1 className="text-5xl md:text-7xl tracking-tight-display leading-[1.05] font-medium text-balance mb-8">
                Let&apos;s build <br className="hidden md:block" /> <span className="text-black/40">the</span> exceptional.
              </h1>
            </Reveal>

            <Reveal priority>
              <p className="text-lg text-black/65 max-w-md text-pretty mb-10 leading-relaxed">
                Frictionless lead capture. Share your operational objectives, target timeline, and required capabilities—our systems architects respond within 2 business hours.
              </p>
            </Reveal>

            {/* Direct NAP Contact Registry */}
            <Reveal>
              <div className="p-6 bg-brand-50 border border-black/10 rounded-xl mb-12 space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest-caps text-black/45">
                  Direct Studio Channels (NAP)
                </h2>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-black/45 block text-xs">Electronic Mail</span>
                    <a href={`mailto:${AGENCY_NAP.email}`} className="font-medium text-brand-900 hover:underline">
                      {AGENCY_NAP.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-black/45 block text-xs">Direct Engineering Lines</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 font-medium text-brand-900">
                      <a href={AGENCY_NAP.phones[0].href} className="hover:underline">
                        {AGENCY_NAP.phones[0].display}
                      </a>
                      <a href={AGENCY_NAP.phones[1].href} className="hover:underline">
                        {AGENCY_NAP.phones[1].display}
                      </a>
                    </div>
                  </div>
                  <div>
                    <span className="text-black/45 block text-xs">Studio Location &amp; Hours</span>
                    <p className="font-medium text-brand-900">
                      {AGENCY_NAP.address.locality}, {AGENCY_NAP.address.region} {AGENCY_NAP.address.postalCode}, India
                    </p>
                    <p className="text-xs text-black/55">{AGENCY_NAP.hours}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Stats grid section with SSR-hydrated numbers */}
          <Reveal>
            <div className="grid grid-cols-2 gap-8 border-t border-black/10 pt-8">
              <div>
                <div className="text-3xl tracking-tight-display font-medium mb-1">
                  <Ticker value={100} suffix="+" />
                </div>
                <div className="text-sm font-mono text-black/50">Enterprise Deployments</div>
              </div>
              <div>
                <div className="text-3xl tracking-tight-display font-medium mb-1">
                  <Ticker value={250} suffix="+" />
                </div>
                <div className="text-sm font-mono text-black/50">Projects Delivered</div>
              </div>
              <div>
                <div className="text-3xl tracking-tight-display font-medium mb-1">
                  <Ticker value={5} suffix="+" />
                </div>
                <div className="text-sm font-mono text-black/50">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl tracking-tight-display font-medium mb-1">
                  <Ticker value={4.9} suffix="/5" />
                </div>
                <div className="text-sm font-mono text-black/50">Client Rating</div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right Column: High-end Contact Form */}
        <div className="w-full lg:w-[61.8%] max-w-full overflow-hidden">
          <Reveal className="bg-brand-50 rounded-none p-2 border border-black/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] w-full">
            <div className="bg-white rounded-none p-6 md:p-12 border border-black/5 shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)]">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

