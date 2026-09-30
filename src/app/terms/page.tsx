import { Reveal } from "@/components/ui/Reveal";

export default function TermsOfService() {
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
            Terms of Service
          </h1>
        </Reveal>
        
        <Reveal delay={0.2}>
          <div className="prose prose-lg prose-neutral max-w-none text-black/80">
            <p className="mb-6">Welcome to Infriva Solutions. By accessing our website and utilizing our services, you agree to be bound by the following Terms and Conditions.</p>
            
            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mt-12 mb-4">Service Engagement</h2>
            <p className="mb-6">All development, design, and marketing services provided by Infriva Solutions are subject to specific project contracts. The content on this website serves as a general outline of our capabilities and does not constitute a binding operational agreement.</p>
            
            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mt-12 mb-4">Intellectual Property</h2>
            <p className="mb-6">Unless otherwise stated, Infriva Solutions and/or its licensors own the intellectual property rights for all material on this website. You may access this from Infriva Solutions for your own personal use subjected to restrictions set in these terms and conditions.</p>
            
            <h2 className="text-2xl leading-[1.4] font-medium tracking-tight-display mt-12 mb-4">Limitation of Liability</h2>
            <p className="mb-6">In no event shall Infriva Solutions, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this website.</p>
            
            <p className="mt-12 text-black/60 text-sm">Last updated: October 2026</p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
