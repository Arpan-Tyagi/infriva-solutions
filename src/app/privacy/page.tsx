import { Reveal } from "@/components/ui/Reveal";

export default function PrivacyPolicy() {
  return (
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-900" />
            <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">Legal</span>
          </div>
        </Reveal>
        
        <Reveal delay={0.1}>
          <h1 className="text-5xl md:text-7xl tracking-tight-display leading-[1.05] font-medium text-balance mb-16">
            Privacy Policy
          </h1>
        </Reveal>
        
        <Reveal delay={0.2}>
          <div className="prose prose-lg prose-neutral max-w-none text-black/80">
            <p className="mb-6">At Infriva Solutions, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, and safeguard the data you provide to us.</p>
            
            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mt-12 mb-4">Information Collection</h2>
            <p className="mb-6">We collect information that you voluntarily provide to us when expressing an interest in obtaining information about us or our products and services, when participating in activities on the website, or otherwise when contacting us. This includes your name, email address, phone number, and project details.</p>
            
            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mt-12 mb-4">How We Use Your Data</h2>
            <p className="mb-6">The information we collect is used to understand your needs, provide you with better service, and specifically to design and develop your custom digital architecture. We do not sell your personal information to third parties.</p>
            
            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mt-12 mb-4">Data Security</h2>
            <p className="mb-6">We implement robust security measures to protect your data. All captured leads are routed through secure, encrypted CRM channels. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.</p>
            
            <p className="mt-12 text-black/60 text-sm">Last updated: October 2026</p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
