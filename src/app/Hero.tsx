"use client";

import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "motion/react";
import { useRef } from "react";
import Link from "next/link";
import { isInitialLoad } from "@/lib/store";

const headlineWords = "We Build Digital Systems That Generate & Convert Leads".split(" ");

export function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const btnX = useSpring(x, springConfig);
  const btnY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!buttonRef.current) return;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    x.set((e.clientX - left - width / 2) * 0.3);
    y.set((e.clientY - top - height / 2) * 0.3);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section ref={containerRef} className="relative w-full min-h-[100svh] flex flex-col items-center justify-center pb-12 md:pb-24 px-4 md:px-12 overflow-hidden">
      <motion.div style={{ y: bgY }} className="absolute inset-0 w-full h-full mix-blend-multiply opacity-55 md:opacity-65 z-0 pointer-events-none transition-opacity duration-1000">
        <video 
          autoPlay 
          muted 
          playsInline 
          loop
          preload="metadata"
          poster="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23FBF8F3'/%3E%3C/svg%3E"
          className="w-full h-full object-cover bg-[#FBF8F3]"
        >
          <source src="/hero-bg-v2.mp4" type="video/mp4" />
        </video>
      </motion.div>

      <div className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_80%_65%_at_50%_48%,rgba(251,248,243,0.72)_0%,rgba(251,248,243,0.3)_45%,transparent_75%)] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-32 z-[2] bg-gradient-to-b from-[#FBF8F3] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-32 z-[2] bg-gradient-to-t from-[#FBF8F3] to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center mt-auto md:mt-24">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: isInitialLoad ? 2.0 : 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FBF8F3]/85 backdrop-blur-md border border-black/10 shadow-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-brand-900" />
          <span className="text-[10px] tracking-widest-caps font-medium text-brand-900">Vanguard Architecture</span>
        </motion.div>
        
        <h1 className="text-[clamp(2.75rem,5.5vw+0.75rem,6.25rem)] tracking-tight-display leading-[1.0] font-medium text-balance mb-8 max-w-5xl flex flex-wrap justify-center gap-x-[0.25em] text-brand-900 drop-shadow-[0_2px_16px_rgba(251,248,243,0.95)]">
          {headlineWords.map((word, i) => (
            <span key={i} className="overflow-hidden inline-flex pb-4 -mb-4 pt-2 -mt-2">
              <motion.span
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{
                  type: "spring",
                  bounce: 0,
                  duration: 0.9,
                  delay: (isInitialLoad ? 2.2 : 0.4) + i * 0.04,
                }}
                className="inline-block"
              >
                {word}{" "}
              </motion.span>
            </span>
          ))}
        </h1>
        
        <Reveal delay={isInitialLoad ? 2.6 : 0.4}>
          <p className="text-xl md:text-2xl leading-[1.4] text-brand-900/90 font-medium max-w-2xl text-pretty mb-10 drop-shadow-[0_1px_12px_rgba(251,248,243,0.95)]">
            Modern websites, custom CRMs, SEO, Meta Ads, WhatsApp API and automation systems for growing businesses.
          </p>
        </Reveal>
        
        <Reveal delay={isInitialLoad ? 2.7 : 0.5}>
          <Link 
            href="/contact"
            ref={buttonRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="pressable group relative flex items-center justify-center gap-4 pl-8 pr-6 py-5 bg-brand-900 text-white rounded-none hover:bg-black transition-colors w-full sm:w-auto overflow-hidden shadow-2xl"
          >
            <motion.div 
              className="absolute inset-0 bg-white/10"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            />
            
            <motion.div style={{ x: btnX, y: btnY }} className="flex items-center gap-4 relative z-10 pointer-events-none">
              <span className="font-medium tracking-tight">Get Free Consultation</span>
              <div className="w-8 h-8 rounded-none bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ArrowUpRight weight="light" size={16} />
              </div>
            </motion.div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
