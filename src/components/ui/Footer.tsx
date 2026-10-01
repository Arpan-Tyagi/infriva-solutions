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

export function Footer() {
  return (
    <footer className="w-full bg-brand-900 text-white pt-24 pb-8 px-6 md:px-12 mt-auto rounded-t-[2rem]">
      {/* Primary content grid: 2 columns on mobile, 4 columns on desktop */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
        {/* Brand identity & agency manifesto (spans 2 columns) */}
        <div className="col-span-2">
          <Link href="/" aria-label="Infriva Home" className="inline-block mb-8 transition-opacity hover:opacity-80">
            <LogoHorizontal className="h-10 w-auto text-white" />
          </Link>
          <p className="text-white/60 text-balance max-w-sm text-lg mb-8">
            Engineering digital architecture and business systems with spatial precision, conversion discipline, and structural craft.
          </p>
          <div className="flex flex-col gap-2 text-white/80">
            <a href="tel:+918505885515" className="hover:text-white transition-colors">+91 85058 85515</a>
            <a href="tel:+918796862021" className="hover:text-white transition-colors">+91 87968 62021</a>
            <a href="mailto:info@infrivasolutions.com" className="hover:text-white transition-colors">info@infrivasolutions.com</a>
          </div>
        </div>
        
        {/* Core agency navigation paths */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-6">Studio</h4>
          <ul className="space-y-4">
            <li><Link href="/services" className="text-white/80 hover:text-white transition-colors">Services</Link></li>
            <li><Link href="/projects" className="text-white/80 hover:text-white transition-colors">Projects</Link></li>
            <li><Link href="/about" className="text-white/80 hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="text-white/80 hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Live verified external social channels */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-6">Social</h4>
          <ul className="space-y-4">
            <li><a href="https://x.com/infrivasolutions" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">Twitter (X)</a></li>
            <li><a href="https://linkedin.com/company/infriva" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">LinkedIn</a></li>
            <li><a href="https://instagram.com/infrivasolutions" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">Instagram</a></li>
            <li><a href="https://medium.com/@infrivasolutions" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">Medium</a></li>
          </ul>
        </div>
      </div>

      {/* Sub-footer: Copyright & Legal Policies */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
        <p>&copy; {new Date().getFullYear()} Infriva. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
