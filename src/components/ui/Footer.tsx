/**
 * @file src/components/ui/Footer.tsx
 * @description Global Agency Footer Component
 *
 * This server component renders the authoritative brand footer anchored at the bottom
 * of all application pages.
 *
 * Design & Architectural Patterns:
 * 1. Geometry & Contrast:
 *    - Rendered in Jet Black (`bg-brand-900` / `#0A0A0B`) with an inverted rounded top boundary
 *      (`rounded-t-[2rem]`) to frame the page as a structured physical envelope.
 * 2. Mobile Responsive Grid:
 *    - Utilizes a 2-column grid on mobile (`grid-cols-2`) and 4-column layout on desktop (`md:grid-cols-4`).
 *    - The studio narrative spans 2 columns (`col-span-2`), keeping typography comfortably readable.
 * 3. Accessibility & Security:
 *    - Outbound social links feature `target="_blank" rel="noopener noreferrer"` to eliminate tabnabbing vulnerabilities.
 *    - Logo link includes explicit `aria-label="Infriva Home"` for screen reader compliance.
 */

import Link from "next/link";
import { LogoHorizontal } from "@/components/ui/LogoHorizontal";
import { AGENCY_NAP } from "@/lib/site";

export function Footer() {
  return (
    <footer className="w-full bg-brand-900 text-white pt-24 pb-8 px-6 md:px-12 mt-auto rounded-t-[2rem]">
      {/* Primary content grid: 2 columns on mobile, 5 columns on desktop */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-12 mb-24">
        {/* Brand identity & agency manifesto (spans 2 columns) */}
        <div className="col-span-2">
          <Link href="/" aria-label="Infriva Home" className="inline-block mb-8 transition-opacity hover:opacity-80">
            <LogoHorizontal className="h-10 w-auto text-white" />
          </Link>
          <p className="text-white/65 text-balance max-w-sm text-base leading-relaxed mb-6">
            Engineering B2B digital architecture, custom PostgreSQL CRMs, and full-stack SEO &amp; GEO acquisition systems with structural craft.
          </p>
          <div className="flex flex-col gap-1.5 text-sm text-white/80">
            <a href={AGENCY_NAP.phones[0].href} className="hover:text-white transition-colors">{AGENCY_NAP.phones[0].display}</a>
            <a href={AGENCY_NAP.phones[1].href} className="hover:text-white transition-colors">{AGENCY_NAP.phones[1].display}</a>
            <a href={`mailto:${AGENCY_NAP.email}`} className="hover:text-white transition-colors">{AGENCY_NAP.email}</a>
            <p className="text-white/50 text-xs mt-2">
              {AGENCY_NAP.address.locality}, {AGENCY_NAP.address.region} {AGENCY_NAP.address.postalCode}, India &bull; {AGENCY_NAP.hours}
            </p>
          </div>
        </div>

        {/* Core agency navigation paths */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white/45 mb-6">Studio</h2>
          <ul className="space-y-3 text-sm">
            <li><Link href="/services" className="text-white/80 hover:text-white transition-colors">Services</Link></li>
            <li><Link href="/projects" className="text-white/80 hover:text-white transition-colors">Case Studies</Link></li>
            <li><Link href="/about" className="text-white/80 hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/blog" className="text-white/80 hover:text-white transition-colors">Insights (Blog)</Link></li>
            <li><Link href="/contact" className="text-white/80 hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Core Service Capabilities */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white/45 mb-6">Capabilities</h2>
          <ul className="space-y-3 text-sm">
            <li><Link href="/services/web-development" className="text-white/80 hover:text-white transition-colors">Web Dev &amp; UI/UX</Link></li>
            <li><Link href="/services/crm-systems" className="text-white/80 hover:text-white transition-colors">Custom CRM Systems</Link></li>
            <li><Link href="/services/seo-and-geo" className="text-white/80 hover:text-white transition-colors">Full-Stack SEO &amp; GEO</Link></li>
            <li><Link href="/services/paid-advertising" className="text-white/80 hover:text-white transition-colors">Paid Advertising</Link></li>
            <li><Link href="/services/retention-marketing" className="text-white/80 hover:text-white transition-colors">WhatsApp Retention</Link></li>
            <li><Link href="/services/premium-content" className="text-white/80 hover:text-white transition-colors">Premium Content</Link></li>
            <li><Link href="/services/social-media-management" className="text-white/80 hover:text-white transition-colors">Social Media Mgmt</Link></li>
          </ul>
        </div>

        {/* Live verified external social channels */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white/45 mb-6">Social</h2>
          <ul className="space-y-3 text-sm">
            <li><a href="https://x.com/infrivasolutions" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">Twitter (X)</a></li>
            <li><a href="https://linkedin.com/company/infriva" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">LinkedIn</a></li>
            <li><a href="https://instagram.com/infrivasolutions" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">Instagram</a></li>
            <li><a href="https://medium.com/@infrivasolutions" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">Medium</a></li>
          </ul>
        </div>
      </div>

      {/* Sub-footer: Copyright & Legal Policies */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/45">
        <p>&copy; {new Date().getFullYear()} Infriva Solutions. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
