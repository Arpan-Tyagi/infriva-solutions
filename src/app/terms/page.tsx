import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { AGENCY_NAP, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review the Terms of Service governing digital engineering, custom CRM development, and marketing engagements with Infriva Solutions.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service | Infriva Solutions",
    description:
      "Review the Terms of Service governing digital engineering, custom CRM development, and marketing engagements with Infriva Solutions.",
    url: `${SITE_URL}/terms`,
    type: "website",
  },
};

export default function TermsOfService() {
  return (
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      <div className="max-w-4xl mx-auto">
        <Reveal priority>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-900" />
            <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">Legal</span>
          </div>
        </Reveal>

        <Reveal priority>
          <h1 className="text-5xl md:text-7xl tracking-tight-display leading-[1.05] font-medium text-balance mb-16">
            Terms of Service
          </h1>
        </Reveal>

        <Reveal>
          <div className="prose prose-lg prose-neutral max-w-none text-black/80">
            <p className="mb-6">
              Welcome to Infriva Solutions. By accessing our website and utilizing our services, you agree to be bound by the following Terms and Conditions.
            </p>

            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mt-12 mb-4">
              1. Service Engagement &amp; Scope
            </h2>
            <p className="mb-6">
              All software development, custom CRM architecture, UI/UX design, SEO/GEO, and performance marketing services provided by Infriva Solutions are governed by specific project statements of work (SOW) and master service agreements. The specifications published on this website serve as an architectural outline of our standard capabilities and SLA tiers.
            </p>

            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mt-12 mb-4">
              2. Intellectual Property &amp; Code Ownership
            </h2>
            <p className="mb-6">
              Unless otherwise stated in a signed client agreement, Infriva Solutions and/or its licensors own the intellectual property rights for all proprietary material on this website. Upon full settlement of project milestones under a client contract, custom application source code and database schemas developed specifically for the client are assigned in accordance with the executed contract terms.
            </p>

            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mt-12 mb-4">
              3. Service Level Agreements &amp; Warranties
            </h2>
            <p className="mb-6">
              Custom web and CRM deployments include a 90-day post-launch warranty covering functional defects against the approved specification. Ongoing retainer services (SEO &amp; GEO, Paid Advertising, Social Media, and Retention Marketing) operate under the incubation windows and response SLAs documented on their respective capability pages.
            </p>

            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mt-12 mb-4">
              4. Limitation of Liability
            </h2>
            <p className="mb-6">
              In no event shall Infriva Solutions, nor any of its officers, directors, and engineers, be held liable for indirect, consequential, or third-party platform disruptions arising out of or connected with your use of this website or external API providers.
            </p>

            <div className="bg-brand-50 border border-black/5 p-8 rounded-2xl mt-12">
              <h2 className="text-xl leading-[1.4] font-medium tracking-tight-display mb-3 text-brand-900">
                Legal &amp; Contractual Inquiries
              </h2>
              <p className="mb-1 text-sm">Email: {AGENCY_NAP.email}</p>
              <p className="mb-1 text-sm">Phone: {AGENCY_NAP.phones.map((p) => p.display).join(" / ")}</p>
              <p className="text-sm">Location: {AGENCY_NAP.address.locality}, {AGENCY_NAP.address.region} {AGENCY_NAP.address.postalCode}, India</p>
            </div>

            <p className="mt-12 text-black/60 text-sm">Last updated: April 2026</p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
