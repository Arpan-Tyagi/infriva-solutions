"use client";

import { useInView, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function Ticker({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  // Use a heavy spring for the count-up (starts fast, agonizingly slows down at the end)
  const springValue = useSpring(0, {
    damping: 100,
    stiffness: 100,
    mass: 3,
  });

  const [displayValue, setDisplayValue] = useState<number | string>(0);

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, springValue, value]);

  useEffect(() => {
    const hasDecimals = value % 1 !== 0;
    return springValue.on("change", (latest) => {
      if (hasDecimals) {
        setDisplayValue(latest.toFixed(1));
      } else {
        setDisplayValue(Math.floor(latest));
      }
    });
  }, [springValue, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}{suffix}
    </span>
  );
}
