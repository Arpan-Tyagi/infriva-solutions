import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import { ArrowUpRight, AppWindow, Database, ChartLineUp, WhatsappLogo, CheckCircle } from "@phosphor-icons/react/dist/ssr";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center justify-center pt-32 pb-8 md:pt-24 md:pb-0 px-4 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-100/40 via-background to-background pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
                <span className="w-2 h-2 rounded-full bg-brand-900" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-brand-900">Infriva Solutions</span>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] tracking-tighter leading-[1.05] font-medium text-balance mb-8">
                We Build Digital Systems That <span className="text-black/40">Generate & Convert</span> Leads.
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-lg md:text-xl text-black/60 max-w-2xl mb-12 text-pretty leading-relaxed">
                Modern websites, custom CRMs, SEO, Meta Ads, WhatsApp API and automation systems for growing businesses.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/contact"
                  className="group relative flex items-center gap-4 px-8 py-4 bg-brand-900 text-white rounded-full hover:bg-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] w-full sm:w-auto justify-center"
                >
                  <span className="font-medium tracking-wide text-sm">Get Free Consultation</span>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                    <ArrowUpRight weight="light" size={16} />
                  </div>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Paradigm Shift Section */}
      <section className="py-24 md:py-40 px-4 md:px-12 bg-brand-900 text-white w-full flex items-center justify-center text-center">
        <Reveal>
          <h2 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter font-medium max-w-4xl text-balance leading-[1.1]">
            We do not just build websites.<br />
            <span className="text-white/40">We build business systems.</span>
          </h2>
        </Reveal>
      </section>

      {/* Asymmetrical Bento Section */}
      <section className="py-24 md:py-40 px-4 md:px-12 bg-white w-full">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <h2 className="text-4xl md:text-6xl tracking-tighter font-medium mb-16">
              Core Expertise
            </h2>
          </Reveal>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[24rem]">
            {/* Cell 1: Web & App */}
            <div className="md:col-span-7 rounded-[2rem] bg-brand-50 border border-black/5 p-1.5 group">
              <Reveal className="w-full h-full" delay={0.1}>
                <div className="w-full h-full rounded-[calc(2rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)] p-8 md:p-12 flex flex-col justify-between transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[0.99]">
                  <AppWindow weight="light" size={32} className="text-black/40" />
                  <div>
                    <h3 className="text-2xl md:text-3xl tracking-tight font-medium mb-4">Web & App Development</h3>
                    <p className="text-black/60 max-w-md text-pretty">
                      React, Next.js, Node.js, MongoDB architectures built for speed and seamless user experience.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Cell 2: CRM */}
            <div className="md:col-span-5 rounded-[2rem] bg-brand-900 border border-black/5 p-1.5 group text-white">
              <Reveal className="w-full h-full" delay={0.2}>
                <div className="w-full h-full rounded-[calc(2rem-0.375rem)] bg-black/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-8 md:p-12 flex flex-col justify-between transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[0.99] relative overflow-hidden">
                  <Database weight="light" size={32} className="text-white/60" />
                  <div>
                    <h3 className="text-2xl md:text-3xl tracking-tight font-medium mb-4">CRM Systems</h3>
                    <p className="text-white/60 text-pretty">
                      Custom lead management dashboards to track and close effectively.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Cell 3: SEO & Ads */}
            <div className="md:col-span-5 rounded-[2rem] bg-brand-50 border border-black/5 p-1.5 group">
              <Reveal className="w-full h-full" delay={0.3}>
                <div className="w-full h-full rounded-[calc(2rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)] p-8 md:p-12 flex flex-col justify-between transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[0.99]">
                  <ChartLineUp weight="light" size={32} className="text-black/40" />
                  <div>
                    <h3 className="text-2xl md:text-3xl tracking-tight font-medium mb-4">SEO & Ads</h3>
                    <p className="text-black/60 text-pretty">
                      Targeted growth engines via Meta Ads and search optimization.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Cell 4: WhatsApp */}
            <div className="md:col-span-7 rounded-[2rem] bg-brand-50 border border-black/5 p-1.5 group">
              <Reveal className="w-full h-full" delay={0.4}>
                <div className="w-full h-full rounded-[calc(2rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)] p-8 md:p-12 flex flex-col justify-between transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[0.99]">
                  <WhatsappLogo weight="light" size={32} className="text-black/40" />
                  <div>
                    <h3 className="text-2xl md:text-3xl tracking-tight font-medium mb-4">Smart Operations</h3>
                    <p className="text-black/60 text-pretty">
                      WhatsApp API integrations and business process automation.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 md:py-40 px-4 md:px-12 bg-brand-50 w-full border-t border-black/5">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <h2 className="text-4xl md:text-6xl tracking-tighter font-medium mb-24">
              Our Process
            </h2>
          </Reveal>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8">
            {[
              "Consultation", 
              "Planning", 
              "Design", 
              "Development", 
              "Launch", 
              "Support"
            ].map((step, i) => (
              <Reveal key={step} delay={0.1 * i}>
                <div className="flex flex-col gap-4 relative">
                  <div className="w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center shadow-sm z-10 relative">
                    <span className="font-mono text-sm">{i + 1}</span>
                  </div>
                  {i !== 5 && (
                    <div className="hidden lg:block absolute top-6 left-12 w-full h-[1px] bg-black/10" />
                  )}
                  <h3 className="text-xl font-medium tracking-tight mt-4">{step}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
