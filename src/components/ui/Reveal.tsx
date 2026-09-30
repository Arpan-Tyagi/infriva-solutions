"use client";

import { motion, useReducedMotion } from "motion/react";

export function Reveal({ 
  children, 
  delay = 0, 
  className = "" 
}: { 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        type: "spring",
        bounce: 0,
        duration: 0.8,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
