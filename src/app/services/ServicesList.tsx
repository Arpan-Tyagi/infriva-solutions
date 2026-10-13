"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Check, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { SERVICES_LIST } from "@/lib/services";

export function ServicesList() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="flex flex-col border-t border-black/10">
      {SERVICES_LIST.map((service, i) => (
        <Reveal key={service.slug} delay={0.05 * i}>
          <Link 
            href={`/services/${service.slug}`}
            className="group relative border-b border-black/10 transition-colors duration-500 cursor-pointer block"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Expanding Background on Row Hover */}
            <motion.div 
              className="absolute inset-0 bg-brand-50 backdrop-blur-md -z-10 origin-bottom overflow-hidden"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: hoveredIdx === i ? 1 : 0, scaleY: hoveredIdx === i ? 1 : 0 }}
              transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
            >
              {service.image && (
                <Image 
                  src={service.image} 
                  fill 
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  className="object-cover opacity-20 mix-blend-multiply" 
                  alt={service.imageAlt} 
                />
              )}
            </motion.div>

            {/* 12-Column Row Layout */}
            <div className="py-6 md:py-10 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Service Title and Core Narrative (4 Cols) */}
              <div className="lg:col-span-4">
                <h2 className="text-3xl tracking-tight-display font-medium mb-3">{service.title}</h2>
                <p className="text-black/60 max-w-xs mb-3">{service.shortDesc}</p>
                <span className="inline-block text-xs font-medium text-brand-900 bg-brand-100 px-2.5 py-1 border border-black/5">
                  {service.pricing}
                </span>
              </div>
              
              {/* Concrete Deliverables Checklist (4 Cols) */}
              <div className="lg:col-span-4">
                <div className="text-[10px] tracking-widest-caps text-black/40 mb-4">Deliverables</div>
                <ul className="flex flex-col gap-3">
                  {service.deliverables.map((item, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <Check size={14} className="text-brand-900 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Target Audience Profile (3 Cols) */}
              <div className="lg:col-span-3">
                <div className="text-[10px] tracking-widest-caps text-black/40 mb-4">Best For</div>
                <p className="text-sm leading-[1.4]">{service.fit}</p>
              </div>

              {/* Directional Action CTA (1 Col) */}
              <div className="lg:col-span-1 flex justify-end">
                <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-brand-900 group-hover:text-white transition-colors">
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
