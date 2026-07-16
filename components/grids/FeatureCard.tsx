"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedFeatureCardProps {
  index: string;
  tag: string;
  title: React.ReactNode;
  icon: React.ReactNode;
  color: "rose" | "purple" | "blue" | "amber" | "emerald";
  className?: string;
}

const colorVariants = {
  rose: {
    "--feature-color": "hsl(349, 89%, 60%)",
    "--feature-color-light": "hsl(349, 100%, 85%)",
    "--feature-color-dark": "hsl(349, 100%, 97%)",
    "--feature-color-border": "hsl(349, 100%, 92%)",
  } as React.CSSProperties,
  purple: {
    "--feature-color": "hsl(262, 85%, 60%)",
    "--feature-color-light": "hsl(261, 100%, 87%)",
    "--feature-color-dark": "hsl(264, 100%, 97%)",
    "--feature-color-border": "hsl(261, 100%, 90%)",
  } as React.CSSProperties,
  blue: {
    "--feature-color": "hsl(211, 100%, 60%)",
    "--feature-color-light": "hsl(210, 100%, 83%)",
    "--feature-color-dark": "hsl(216, 100%, 97%)",
    "--feature-color-border": "hsl(210, 100%, 90%)",
  } as React.CSSProperties,
  amber: {
    "--feature-color": "hsl(35, 91%, 55%)",
    "--feature-color-light": "hsl(41, 100%, 85%)",
    "--feature-color-dark": "hsl(41, 100%, 97%)",
    "--feature-color-border": "hsl(35, 100%, 88%)",
  } as React.CSSProperties,
  emerald: {
    "--feature-color": "hsl(160, 84%, 45%)",
    "--feature-color-light": "hsl(160, 80%, 80%)",
    "--feature-color-dark": "hsl(160, 100%, 97%)",
    "--feature-color-border": "hsl(160, 70%, 86%)",
  } as React.CSSProperties,
};

export const AnimatedFeatureCard = React.forwardRef<
  HTMLDivElement,
  AnimatedFeatureCardProps
>(({ className, index, tag, title, icon, color }, ref) => {
  const cardStyle = colorVariants[color];

  return (
    <motion.div
      ref={ref}
      style={cardStyle}
      className={cn(
        "relative flex h-[340px] w-full flex-col justify-end overflow-hidden rounded-2xl border-2 border-slate-900/20 bg-white shadow-sm transition-all duration-300",
        className
      )}
      whileHover="hover"
      initial="initial"
      variants={{
        initial: { y: 0 },
        hover: { y: -8 },
      }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      {/* Background Gradient */}
      <div
        className="absolute inset-0 z-0 opacity-25"
        style={{
          background: `radial-gradient(circle at 50% 20%, var(--feature-color-light) 0%, transparent 70%)`,
        }}
      />

      {/* Subtle bottom border highlight */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 z-10"
        style={{ backgroundColor: "var(--feature-color)" }}
      />

      {/* Icon - Centered, floats above on hover */}
      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
        variants={{
          initial: { scale: 1, y: 8 },
          hover: { scale: 1.35, y: -20 },
        }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
      >
        <div
          className="w-20 h-20 flex items-center justify-center rounded-2xl shadow-sm border"
          style={{
            color: "var(--feature-color)",
            backgroundColor: "var(--feature-color-dark)",
            borderColor: "var(--feature-color-border)",
          }}
        >
          {icon}
        </div>
      </motion.div>

      {/* Index Number - top-right, modern pill style */}
      <div className="absolute top-4 right-4 z-30">
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold font-mono"
          style={{
            backgroundColor: "var(--feature-color-dark)",
            color: "var(--feature-color)",
            border: "1px solid var(--feature-color-border)",
          }}
        >
          {index}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-40 rounded-xl border bg-white/95 p-3.5 mx-3 mb-3 backdrop-blur-sm shadow-sm"
        style={{ borderColor: "var(--feature-color-border)" }}
      >
        <span
          className="mb-1.5 inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
          style={{
            backgroundColor: "var(--feature-color-dark)",
            color: "var(--feature-color)",
          }}
        >
          {tag}
        </span>
        <p
          className="text-xs font-semibold leading-snug"
          style={{ color: "hsl(222, 20%, 18%)" }}
        >
          {title}
        </p>
      </div>
    </motion.div>
  );
});

AnimatedFeatureCard.displayName = "AnimatedFeatureCard";
