import { Reveal } from "@/components/ui/Reveal";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

export default function Services() {
  return (
    <div className="w-full pt-32 pb-8 md:pt-40 md:pb-24 px-4 md:px-12 min-h-[100dvh]">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-900" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-brand-900">Expertise</span>
          </div>
        </Reveal>
        
        <Reveal delay={0.1}>
          <h1 className="text-5xl md:text-7xl tracking-tighter leading-[1.05] font-medium text-balance mb-8 max-w-4xl">
            CRM Development, Lead Generation <span className="text-black/40">&amp; Paid Ads</span>.
          </h1>
        </Reveal>
        
        <Reveal delay={0.2}>
          <p className="text-xl text-black/60 max-w-3xl mb-24 leading-relaxed">
            Every solution is meticulously planned around your business workflow and goals, ensuring reliable systems backed by clean architecture.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          <Reveal delay={0.3}>
            <div className="bg-brand-50 rounded-[2rem] p-8 md:p-12 border border-black/5 h-full">
              <h3 className="text-3xl tracking-tight font-medium mb-8 pb-8 border-b border-black/10">Deliverables</h3>
              <ul className="flex flex-col gap-6">
                {["Campaign Setup & Strategy", "Lead Form Integration", "CRM Database Connection", "WhatsApp Automation Workflows", "Analytics Dashboards"].map((item) => (
                  <li key={item} className="flex items-center gap-4 text-lg text-black/80">
                    <CheckCircle weight="fill" className="text-brand-900" size={24} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          
          <Reveal delay={0.4}>
            <div className="bg-brand-900 text-white rounded-[2rem] p-8 md:p-12 h-full">
              <h3 className="text-3xl tracking-tight font-medium mb-8 pb-8 border-b border-white/10">Best For</h3>
              <ul className="flex flex-col gap-6">
                {["Service Businesses", "Real Estate Agencies", "Digital Consultancies", "High-Ticket B2B", "Healthcare Providers"].map((item) => (
                  <li key={item} className="flex items-center gap-4 text-lg text-white/80">
                    <div className="w-2 h-2 rounded-full bg-brand-50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
