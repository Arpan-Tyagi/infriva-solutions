import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

const projects = [
  {
    client: "FlyingLyte",
    role: "Travel / Flight Booking",
    year: "2026",
    desc: "A high-conversion booking platform built to improve brand presence and streamline customer experience.",
  },
  {
    client: "StarX Hotel",
    role: "Hospitality / Room Showcase",
    year: "2025",
    desc: "A luxury digital showcase engineered for direct lead capture and seamless room reservations.",
  }
];

export default function Projects() {
  return (
    <div className="w-full pt-32 pb-8 md:pt-40 md:pb-24 px-4 md:px-12 min-h-[100dvh]">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-900" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-brand-900">Selected Work</span>
          </div>
        </Reveal>
        
        <Reveal delay={0.1}>
          <h1 className="text-5xl md:text-7xl tracking-tighter leading-[1.05] font-medium text-balance mb-8 max-w-4xl">
            Systems built for <span className="text-black/40">growth</span>.
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-xl text-black/60 max-w-2xl mb-24 leading-relaxed">
            Our projects are explicitly designed to elevate brand presence, refine customer experience, and maximize lead capture.
          </p>
        </Reveal>

        <div className="flex flex-col gap-12">
          {projects.map((project, i) => (
            <Reveal key={project.client} delay={0.3 + (i * 0.1)}>
              <div className="group block cursor-pointer">
                <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-brand-50 rounded-[2rem] border border-black/5 mb-8 overflow-hidden relative flex items-center justify-center p-8">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                  <div className="w-full h-full bg-white rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-black/5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[0.98] flex items-center justify-center">
                    <span className="text-4xl font-medium text-black/10">{project.client} Platform</span>
                  </div>
                  <div className="absolute top-8 right-8 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 -translate-y-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-100 group-hover:translate-y-0">
                    <ArrowUpRight size={20} className="text-brand-900" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-8">
                    <h3 className="text-3xl tracking-tight font-medium mb-4">{project.client}</h3>
                    <p className="text-lg text-black/60 max-w-xl text-pretty leading-relaxed">
                      {project.desc}
                    </p>
                  </div>
                  <div className="md:col-span-4 flex flex-col md:text-right text-sm font-mono text-black/40 pt-2">
                    <span>{project.role}</span>
                    <span>{project.year}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
