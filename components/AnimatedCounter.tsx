"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  from?: number;
  to: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  from = 0,
  to,
  suffix = "",
  prefix = "",
  decimals = 1,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const springValue = useSpring(from, {
    stiffness: 50,
    damping: 20,
  });
  const displayValue = useTransform(springValue, (v) => {
    if (decimals === 0) return Math.round(v).toLocaleString();
    return v.toFixed(decimals);
  });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      springValue.set(to);
    }
  }, [isInView, hasAnimated, springValue, to]);

  return (
    <span ref={ref}>
      <motion.span>{prefix}</motion.span>
      <motion.span>{displayValue}</motion.span>
      <motion.span>{suffix}</motion.span>
    </span>
  );
}
