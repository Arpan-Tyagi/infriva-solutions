import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center bg-[#FBF8F3] text-[#0A0A0B] px-4 md:px-12 pt-32 pb-24">
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#0A0A0B]" />
          <span className="text-[10px] tracking-widest-caps font-medium uppercase font-mono text-[#0A0A0B]">
            404 // Coordinate Missing
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl tracking-tight-display leading-[1.05] font-medium mb-6 text-balance">
          System route <br />
          <span className="text-black/40">not found.</span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-black/60 font-medium max-w-lg mb-12 text-pretty">
          The requested coordinate or document does not exist within the digital system architecture.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0A0A0B] text-[#FBF8F3] rounded-xl hover:bg-black/80 transition-colors text-sm font-medium tracking-tight"
          >
            <ArrowLeft size={16} />
            <span>Return to Overview</span>
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-black/10 text-[#0A0A0B] rounded-xl hover:border-black/30 hover:bg-black/5 transition-all text-sm font-medium tracking-tight"
          >
            <span>Explore Services</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
