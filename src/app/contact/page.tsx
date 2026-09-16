import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export default function Contact() {
  return (
    <div className="w-full pt-32 pb-8 md:pt-40 md:pb-24 px-4 md:px-12 min-h-[calc(100vh-400px)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        
        {/* Left Column: Trust Indicators */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
                <span className="w-2 h-2 rounded-full bg-brand-900" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-brand-900">Initiate</span>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-5xl md:text-7xl tracking-tighter leading-[1.05] font-medium text-balance mb-8">
                Let&apos;s build <br className="hidden md:block" /> <span className="text-black/40">the</span> exceptional.
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-lg text-black/60 max-w-sm text-pretty mb-16">
                Frictionless lead capture. Tell us about your project requirements and we will orchestrate the digital architecture.
              </p>
            </Reveal>
          </div>
          
          <Reveal delay={0.3}>
            <div className="grid grid-cols-2 gap-8 border-t border-black/10 pt-8">
              <div>
                <div className="text-3xl tracking-tighter font-medium mb-1">100+</div>
                <div className="text-sm font-mono text-black/40">Happy Clients</div>
              </div>
              <div>
                <div className="text-3xl tracking-tighter font-medium mb-1">250+</div>
                <div className="text-sm font-mono text-black/40">Projects Delivered</div>
              </div>
              <div>
                <div className="text-3xl tracking-tighter font-medium mb-1">5+</div>
                <div className="text-sm font-mono text-black/40">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl tracking-tighter font-medium mb-1">4.9/5</div>
                <div className="text-sm font-mono text-black/40">Client Rating</div>
              </div>
            </div>
          </Reveal>
        </div>
        
        {/* Right Column: High-end Form */}
        <div className="lg:col-span-7">
          <Reveal delay={0.4}>
            <div className="bg-brand-50 rounded-[2rem] p-2 border border-black/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)]">
              <div className="bg-white rounded-[calc(2rem-0.5rem)] p-8 md:p-12 border border-black/5 shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)]">
                <form className="flex flex-col gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="text-sm font-medium tracking-wide">Full Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        className="w-full bg-brand-50 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all text-brand-900 placeholder:text-black/30"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="company" className="text-sm font-medium tracking-wide">Company</label>
                      <input 
                        type="text" 
                        id="company" 
                        className="w-full bg-brand-50 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all text-brand-900 placeholder:text-black/30"
                        placeholder="Acme Corp"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="service" className="text-sm font-medium tracking-wide">Service Required</label>
                    <div className="relative">
                      <select 
                        id="service" 
                        className="w-full bg-brand-50 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all text-brand-900 appearance-none"
                      >
                        <option>Web & App Development</option>
                        <option>CRM Systems</option>
                        <option>SEO & Ads</option>
                        <option>Smart Operations</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ArrowUpRight size={16} className="rotate-45 opacity-50" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="budget" className="text-sm font-medium tracking-wide">Budget Range</label>
                    <div className="relative">
                      <select 
                        id="budget" 
                        className="w-full bg-brand-50 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all text-brand-900 appearance-none"
                      >
                        <option>Below ₹15,000</option>
                        <option>₹15,000 - ₹50,000</option>
                        <option>₹50,000 - ₹1,00,000</option>
                        <option>Above ₹1,00,000</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ArrowUpRight size={16} className="rotate-45 opacity-50" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="details" className="text-sm font-medium tracking-wide">Project Details</label>
                    <textarea 
                      id="details" 
                      rows={4}
                      className="w-full bg-brand-50 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all text-brand-900 placeholder:text-black/30 resize-none"
                      placeholder="Tell us about your objectives..."
                    />
                  </div>
                  
                  <button
                    type="button"
                    className="group relative flex items-center justify-center gap-4 px-8 py-4 bg-brand-900 text-white rounded-xl hover:bg-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] w-full mt-4"
                  >
                    <span className="font-medium tracking-wide text-sm">Submit Inquiry</span>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                      <ArrowUpRight weight="light" size={16} />
                    </div>
                  </button>
                </form>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
