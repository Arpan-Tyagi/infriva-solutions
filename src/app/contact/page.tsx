import { Reveal } from "@/components/ui/Reveal"; // Custom component for scroll-based fade-up animations
import { Ticker } from "@/components/ui/Ticker"; // Custom number animation component
import { ContactForm } from "./ContactForm";

export default function Contact() {
  return (
    // Main page layout wrapper with padding and min-height
    <div className="w-full pt-32 pb-8 md:pt-40 md:pb-24 px-4 md:px-12 min-h-[calc(100vh-400px)]">
      {/* Responsive layout: column on mobile, row on large screens */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24">
        
        {/* Left Column: Headline and Trust Indicators */}
        <div className="w-full lg:w-[38.2%] flex flex-col justify-between">
          <div>
            {/* Animated Eyebrow tag */}
            <Reveal className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-900" />
              <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">Initiate</span>
            </Reveal>
            
            {/* Main Headline */}
            <Reveal delay={0.1}>
              <h1 className="text-5xl md:text-7xl tracking-tight-display leading-[1.05] font-medium text-balance mb-8">
                Let&apos;s build <br className="hidden md:block" /> <span className="text-black/40">the</span> exceptional.
              </h1>
            </Reveal>
            
            {/* Subtitle */}
            <Reveal delay={0.2}>
              <p className="text-lg text-black/60 max-w-sm text-pretty mb-16">
                Frictionless lead capture. Tell us about your project requirements and we will orchestrate the digital architecture.
              </p>
            </Reveal>
          </div>
          
          {/* Stats grid section with animated numbers */}
          <Reveal delay={0.3}>
            <div className="grid grid-cols-2 gap-8 border-t border-black/10 pt-8">
              {/* Stat 1 */}
              <div>
                <div className="text-3xl tracking-tight-display font-medium mb-1"><Ticker value={100} suffix="+" /></div>
                <div className="text-sm font-mono text-black/40">Enterprise Deployments</div>
              </div>
              {/* Stat 2 */}
              <div>
                <div className="text-3xl tracking-tight-display font-medium mb-1"><Ticker value={250} suffix="+" /></div>
                <div className="text-sm font-mono text-black/40">Projects Delivered</div>
              </div>
              {/* Stat 3 */}
              <div>
                <div className="text-3xl tracking-tight-display font-medium mb-1"><Ticker value={5} suffix="+" /></div>
                <div className="text-sm font-mono text-black/40">Years Experience</div>
              </div>
              {/* Stat 4 */}
              <div>
                <div className="text-3xl tracking-tight-display font-medium mb-1"><Ticker value={4.9} suffix="/5" /></div>
                <div className="text-sm font-mono text-black/40">Client Rating</div>
              </div>
            </div>
          </Reveal>
        </div>
        
        {/* Right Column: High-end Contact Form */}
        <div className="w-full lg:w-[61.8%] max-w-full overflow-hidden">
          <Reveal delay={0.4} className="bg-brand-50 rounded-none p-2 border border-black/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] w-full">
              <div className="bg-white rounded-none p-6 md:p-12 border border-black/5 shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)]">
                {/* Form wrapper */}
                <ContactForm />
              </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

