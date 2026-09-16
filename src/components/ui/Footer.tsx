import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-brand-900 text-white pt-24 pb-8 px-6 md:px-12 mt-auto rounded-t-[2rem]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
        <div className="md:col-span-2">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white" />
              <span className="font-medium text-2xl tracking-tight">Infriva</span>
            </div>
          </Link>
          <p className="text-white/60 text-balance max-w-sm text-lg">
            Engineering digital experiences with cinematic spatial rhythm. We elevate brands through precision and craft.
          </p>
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
            <li><a href="#" className="text-white/80 hover:text-white transition-colors">Twitter</a></li>
            <li><a href="#" className="text-white/80 hover:text-white transition-colors">LinkedIn</a></li>
            <li><a href="#" className="text-white/80 hover:text-white transition-colors">Instagram</a></li>
            <li><a href="#" className="text-white/80 hover:text-white transition-colors">Dribbble</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
        <p>&copy; {new Date().getFullYear()} Infriva. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
