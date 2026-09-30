import Link from "next/link";
import { LogoHorizontal } from "@/components/ui/LogoHorizontal";

export function Footer() {
  return (
    <footer className="w-full bg-brand-900 text-white pt-24 pb-8 px-6 md:px-12 mt-auto rounded-t-[2rem]">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
        <div className="col-span-2">
          <Link href="/" aria-label="Infriva Home" className="inline-block mb-8 transition-opacity hover:opacity-80">
            <LogoHorizontal className="h-10 w-auto text-white" />
          </Link>
          <p className="text-white/60 text-balance max-w-sm text-lg mb-8">
            Engineering digital architecture and business systems with spatial precision, conversion discipline, and structural craft.
          </p>
          <div className="flex flex-col gap-2 text-white/80">
            <a href="tel:+918287628307" className="hover:text-white transition-colors">+91 82876 28307</a>
            <a href="mailto:info@infrivasolutions.com" className="hover:text-white transition-colors">info@infrivasolutions.com</a>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-6">Studio</h4>
          <ul className="space-y-4">
            <li><Link href="/services" className="text-white/80 hover:text-white transition-colors">Services</Link></li>
            <li><Link href="/projects" className="text-white/80 hover:text-white transition-colors">Projects</Link></li>
            <li><Link href="/about" className="text-white/80 hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="text-white/80 hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

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

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
        <p>&copy; {new Date().getFullYear()} Infriva. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

