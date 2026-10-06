/**
 * @file src/app/services/page.tsx
 * @description Agency Services Catalog & Architectural Capabilities
 *
 * This client component renders the master index of Infriva Solutions' 7 core engineering practices.
 *
 * UX & Interaction Architecture:
 * 1. Expandable Hover Rows:
 *    - Tracks `hoveredIdx` in React state.
 *    - On hover, an animated background layer expands vertically (`scaleY: 1`) using a luxury
 *      cubic bezier curve `[0.76, 0, 0.24, 1]`.
 *    - If the service has an associated architectural background image, it renders with `mix-blend-multiply`
 *      at 20% opacity for atmospheric depth.
 * 2. 12-Column Responsive Breakdown:
 *    - 4 columns: Service Title & Core Manifesto
 *    - 4 columns: Concrete Operational Deliverables with Phosphor checkmarks
 *    - 3 columns: Ideal Client Profile ("Best For")
 *    - 1 column: Directional Arrow Circle responding to parent hover
 * 3. Deep Linking:
 *    - Each row links directly to `/services/[slug]` for the full specification sheet.
 */

import { Reveal } from "@/components/ui/Reveal";
import { ServicesList } from "./ServicesList";

export default function Services() {
  return (
    <div className="w-full pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Animated Eyebrow Badge */}
        <Reveal className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-black/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-brand-900" />
          <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">Capabilities</span>
        </Reveal>
        
        {/* Headline */}
        <Reveal delay={0.1}>
          <h1 className="text-5xl md:text-7xl xl:text-8xl tracking-tight-display leading-[1.05] font-medium text-balance mb-8 max-w-5xl">
            Systems planned around your <br className="hidden md:block"/> business workflow.
          </h1>
        </Reveal>
        
        {/* Overview Narrative */}
        <Reveal delay={0.2}>
          <p className="text-lg text-black/60 max-w-2xl text-pretty mb-24">
            We don&apos;t build generic solutions. Every deliverable is mapped to your specific operational goals, ensuring clean architecture and reliable scaling.
          </p>
        </Reveal>

        {/* Services List Table Wrapper */}
        <ServicesList />
      </div>
    </div>
  );
}
