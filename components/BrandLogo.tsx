"use client";

import { AnimatedLogo } from "@/components/AnimatedLogo";

export interface BrandLogoProps {
  href?: string;
  showText?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  animated?: boolean;
  glow?: boolean;
  textClassName?: string;
}

/**
 * BrandLogo — The official brand mark and wordmark for ResumeFlow.
 * Powered by AnimatedLogo with pure vector rendering, responsive scaling,
 * ambient radiant glow, and interactive hover dynamics.
 */
export function BrandLogo({
  href,
  showText = true,
  size = "md",
  className = "",
  animated = true,
  glow = true,
  textClassName,
}: BrandLogoProps) {
  return (
    <AnimatedLogo
      href={href}
      showText={showText}
      size={size}
      className={className}
      animated={animated}
      glow={glow}
      textClassName={textClassName}
    />
  );
}

export default BrandLogo;
