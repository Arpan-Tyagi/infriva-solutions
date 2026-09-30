"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { LogoVertical } from "@/components/ui/LogoVertical";
import { isInitialLoad, setInitialLoad } from "@/lib/store";

export function Preloader() {
  const [loading, setLoading] = useState(isInitialLoad);

  useEffect(() => {
    if (!isInitialLoad) return;
    
    // Lock scroll
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      setLoading(false);
      setInitialLoad(false);
      document.body.style.overflow = "";
    }, 2500);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: loading ? 1 : 0, pointerEvents: loading ? "auto" : "none" }}
      transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1], delay: loading ? 0 : 0.2 }}
    >
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: 2, duration: 0.5, ease: [0.77, 0, 0.175, 1] }}
        className="relative flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }}
        >
          <LogoVertical className="w-48 md:w-64 h-auto text-brand-900" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
