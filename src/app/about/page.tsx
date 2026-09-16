import { Reveal } from "@/components/ui/Reveal";

export default function About() {
  return (
    <div className="w-full pt-32 pb-8 md:pt-40 md:pb-24 px-4 md:px-12 min-h-[100dvh]">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-900" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-brand-900">Growth Partner</span>
          </div>
        </Reveal>
        
        <Reveal delay={0.1}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[1.05] font-medium text-balance mb-24 max-w-5xl">
            Turning business ideas into <span className="text-black/40">scalable</span> digital systems.
          </h1>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mt-12 border-t border-black/10 pt-24">
          <div className="md:col-span-5">
            <Reveal delay={0.2}>
              <h2 className="text-4xl tracking-tighter font-medium mb-8">
                The Infriva Advantage
              </h2>
            </Reveal>
          </div>
          
          <div className="md:col-span-7 flex flex-col gap-12">
            {[
              {
                title: "From Manual to Automated",
                desc: "We transition your business from chaotic, manual email enquiries to structured digital lead management.",
              },
              {
                title: "360° IT Solutions",
                desc: "We don't just hand off a website. We integrate CRM, configure analytics, and automate follow-ups.",
              },
              {
                title: "Scalable Architecture",
                desc: "Built on enterprise-grade frameworks ensuring your system grows alongside your revenue.",
              }
            ].map((item, i) => (
              <Reveal key={item.title} delay={0.3 + (i * 0.1)}>
                <div className="flex flex-col">
                  <h3 className="text-2xl tracking-tight font-medium mb-4">{item.title}</h3>
                  <p className="text-lg text-black/60 max-w-2xl text-pretty leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
