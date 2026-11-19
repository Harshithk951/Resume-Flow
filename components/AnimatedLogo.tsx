"use client";

import { useState } from "react";
import Link from "next/link";

export interface AnimatedLogoProps {
  /** Size preset of the logo mark */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  /** Whether to show the "ResumeFlow" text wordmark */
  showText?: boolean;
  /** Whether the continuous ambient breathing animation is active */
  animated?: boolean;
  /** Whether to render the ambient radiant glow aura around the mark */
  glow?: boolean;
  /** Color style: "currentColor" (matches text theme), "brand" (gradient), or "white" */
  colorScheme?: "currentColor" | "brand" | "white";
  /** Optional link destination (wraps the logo in Next.js Link) */
  href?: string;
  /** Extra CSS classes for the outer wrapper */
  className?: string;
  /** Optional custom text class for overriding wordmark styles */
  textClassName?: string;
}

const SIZE_MAP = {
  xs: { icon: 26, text: "text-base tracking-tight font-extrabold", gap: "gap-2" },
  sm: { icon: 34, text: "text-lg tracking-tight font-extrabold", gap: "gap-2.5" },
  md: { icon: 46, text: "text-2xl tracking-tight font-black", gap: "gap-3" },
  lg: { icon: 60, text: "text-3xl tracking-tight font-black", gap: "gap-3.5" },
  xl: { icon: 80, text: "text-4xl tracking-tight font-black", gap: "gap-4" },
  hero: { icon: 120, text: "text-6xl tracking-tight font-black", gap: "gap-5" },
};

// Exact SVG Vector Paths for the Official ResumeFlow Emblem
const PATH_HEAD_COMPOUND = "M 48.05 8.0 L 47.83 8.23 L 46.22 8.46 L 43.25 10.06 L 40.73 12.81 L 40.04 14.41 L 39.59 14.87 L 39.36 15.78 L 38.9 16.24 L 38.21 17.61 L 38.21 18.07 L 37.53 18.99 L 37.53 19.44 L 37.07 19.9 L 36.38 21.28 L 36.38 21.73 L 35.69 22.65 L 35.69 23.11 L 35.24 23.56 L 34.55 24.94 L 34.55 25.4 L 33.86 26.31 L 33.86 26.77 L 33.18 27.68 L 33.18 28.14 L 32.49 29.06 L 32.49 29.51 L 32.03 30.43 L 32.03 31.12 L 31.8 31.35 L 31.8 35.24 L 32.03 35.47 L 32.03 36.15 L 32.26 36.38 L 32.49 37.53 L 33.86 39.81 L 44.39 50.34 L 46.22 51.49 L 46.68 51.49 L 48.28 52.17 L 51.72 52.17 L 51.95 51.95 L 53.78 51.49 L 54.69 50.8 L 55.38 50.57 L 66.14 39.81 L 67.51 37.53 L 67.51 37.07 L 67.97 36.15 L 67.97 35.47 L 68.2 35.24 L 68.2 31.35 L 67.97 31.12 L 67.97 30.43 L 67.28 29.06 L 67.28 28.6 L 59.73 13.49 L 58.81 12.12 L 56.75 10.06 L 53.78 8.46 L 52.17 8.23 L 51.95 8.0 Z M 49.43 16.24 L 50.57 16.24 L 51.49 16.7 L 52.63 18.07 L 59.96 32.95 L 59.96 33.86 L 59.5 34.55 L 50.11 43.93 L 49.89 43.93 L 40.5 34.55 L 40.04 33.86 L 40.27 32.26 L 47.37 18.07 L 48.51 16.7 Z";
const PATH_BODY_MAIN = "M 89.94 75.98 L 89.71 75.75 L 89.71 74.6 L 89.48 74.38 L 89.48 73.69 L 89.25 73.46 L 88.8 71.63 L 88.11 70.71 L 88.11 70.26 L 87.19 68.88 L 87.19 68.43 L 86.28 67.05 L 86.05 66.14 L 81.24 56.52 L 79.41 53.78 L 76.66 51.26 L 73.69 49.66 L 73.23 49.66 L 72.32 49.2 L 71.63 49.2 L 71.4 48.97 L 70.26 48.97 L 70.03 48.74 L 66.14 48.74 L 65.91 48.97 L 64.99 48.97 L 64.76 49.2 L 64.08 49.2 L 62.7 49.89 L 62.25 49.89 L 59.5 51.49 L 27.91 82.84 L 26.54 83.53 L 26.08 83.99 L 25.62 83.99 L 24.48 84.68 L 24.02 84.68 L 23.11 85.13 L 22.42 85.13 L 22.19 85.36 L 21.28 85.36 L 21.05 85.59 L 19.67 85.59 L 19.44 85.82 L 15.32 85.82 L 15.1 85.59 L 13.72 85.59 L 13.49 85.36 L 12.58 85.36 L 12.35 85.13 L 12.35 85.36 L 13.26 86.74 L 16.47 89.71 L 18.99 91.08 L 19.44 91.08 L 20.36 91.54 L 21.05 91.54 L 21.28 91.77 L 21.96 91.77 L 22.19 92.0 L 26.77 92.0 L 27.0 91.77 L 28.14 91.77 L 28.37 91.54 L 30.2 91.08 L 32.03 90.17 L 34.55 88.34 L 64.76 58.13 L 65.91 57.44 L 66.37 57.44 L 66.59 57.21 L 67.74 57.21 L 67.97 56.98 L 70.49 57.44 L 72.09 58.35 L 73.0 59.27 L 73.92 60.64 L 79.18 71.17 L 79.18 71.63 L 79.64 72.09 L 81.01 74.83 L 81.01 75.29 L 81.47 76.21 L 81.47 78.95 L 81.24 79.18 L 81.24 79.64 L 80.56 81.01 L 78.95 82.62 L 77.81 83.3 L 78.27 83.53 L 79.18 83.53 L 79.41 83.76 L 81.01 83.76 L 81.24 83.99 L 83.76 83.99 L 83.99 83.76 L 85.82 83.76 L 86.05 83.53 L 86.96 83.53 L 87.19 83.3 L 88.8 83.07 L 89.48 81.47 L 89.71 79.41 L 89.94 79.18 Z";
const PATH_BODY_LEFT = "M 48.51 59.5 L 40.5 51.49 L 39.13 50.57 L 36.61 49.43 L 35.24 49.2 L 35.01 48.97 L 34.09 48.97 L 33.86 48.74 L 29.97 48.74 L 29.74 48.97 L 28.6 48.97 L 28.37 49.2 L 27.68 49.2 L 27.46 49.43 L 26.31 49.66 L 24.02 50.8 L 22.42 51.95 L 20.59 53.78 L 19.44 55.38 L 18.07 57.9 L 18.07 58.35 L 17.38 59.27 L 17.38 59.73 L 16.47 61.1 L 16.24 62.02 L 15.78 62.47 L 15.55 63.39 L 14.64 64.76 L 14.64 65.22 L 13.95 66.14 L 13.72 67.05 L 12.81 68.43 L 12.81 68.88 L 11.89 70.26 L 11.89 70.71 L 11.2 71.63 L 11.2 72.09 L 10.52 73.69 L 10.52 74.38 L 10.29 74.6 L 10.29 75.75 L 10.06 75.98 L 10.06 79.18 L 10.29 79.41 L 10.29 80.56 L 10.52 80.78 L 10.52 81.47 L 10.75 81.7 L 10.98 82.84 L 11.89 83.3 L 12.81 83.3 L 13.04 83.53 L 13.95 83.53 L 14.18 83.76 L 16.01 83.76 L 16.24 83.99 L 18.76 83.99 L 18.99 83.76 L 20.59 83.76 L 20.82 83.53 L 21.73 83.53 L 22.19 83.3 L 21.05 82.62 L 19.44 81.01 L 18.53 78.95 L 18.53 76.21 L 18.76 75.98 L 18.99 74.83 L 20.36 72.09 L 20.82 71.63 L 20.82 71.17 L 26.08 60.64 L 27.0 59.27 L 28.6 57.9 L 30.2 57.21 L 31.35 57.21 L 31.57 56.98 L 32.03 56.98 L 32.26 57.21 L 33.41 57.21 L 34.55 57.67 L 35.24 58.13 L 42.56 65.45 L 42.79 65.45 L 48.51 59.73 Z";
const PATH_BODY_RIGHT = "M 51.49 73.92 L 51.49 74.38 L 65.45 88.34 L 67.97 90.17 L 69.8 91.08 L 70.26 91.08 L 71.86 91.77 L 73.0 91.77 L 73.23 92.0 L 77.81 92.0 L 78.04 91.77 L 78.72 91.77 L 78.95 91.54 L 79.64 91.54 L 79.87 91.31 L 81.01 91.08 L 84.45 89.02 L 86.74 86.74 L 87.65 85.36 L 84.9 85.59 L 84.68 85.82 L 80.56 85.82 L 80.33 85.59 L 78.95 85.59 L 78.72 85.36 L 76.89 85.13 L 76.66 84.9 L 75.52 84.68 L 74.38 83.99 L 73.92 83.99 L 73.46 83.53 L 72.09 82.84 L 57.21 68.2 Z";

/**
 * AnimatedLogo — The official brand emblem of ResumeFlow.
 *
 * Design Architecture:
 * - Symbol: Kinetic diamond crest & interlocking infinity ribbon loop.
 * - Represents: Mindfulness, continuous learning, and perpetual career flow.
 * - Animation: Organic ambient breathing, soft elevation, and interactive hover dynamics.
 */
export function AnimatedLogo({
  size = "md",
  showText = true,
  animated = true,
  glow = true,
  colorScheme = "currentColor",
  href,
  className = "",
  textClassName,
}: AnimatedLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = SIZE_MAP[size] || SIZE_MAP.md;
  const iconPx = config.icon;

  const logoMark = (
    <div
      className="relative shrink-0 flex items-center justify-center select-none"
      style={{
        width: iconPx,
        height: iconPx,
        transform:
          isHovered && animated ? "translateY(-2px) scale(1.08)" : "translateY(0) scale(1)",
        transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient Glow Aura */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none transition-all duration-700 ease-out"
          style={{
            background:
              colorScheme === "brand"
                ? "radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(14,165,233,0.18) 45%, transparent 72%)"
                : "radial-gradient(circle, rgba(0,0,0,0.08) 0%, transparent 70%)",
            filter: "blur(10px)",
            transform: isHovered && animated ? "scale(1.4)" : "scale(1.0)",
            opacity: isHovered ? 0.9 : animated ? 0.6 : 0.3,
            animation: animated ? "rfEmblemAura 4s ease-in-out infinite" : "none",
          }}
        />
      )}

      {/* Core SVG Vector Emblem */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full overflow-visible text-black dark:text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
        style={{
          color: colorScheme === "white" ? "#FFFFFF" : "var(--color-ink, #000000)",
        }}
      >
        <defs>
          <linearGradient id={`rf-brand-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D2FF" />
            <stop offset="45%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>

          <filter id={`rf-emblem-glow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <style>{`
          @keyframes rfEmblemBreathe {
            0%, 100% {
              transform: translateY(0px) scale(1);
            }
            50% {
              transform: translateY(-1.5px) scale(1.025);
            }
          }
          @keyframes rfEmblemAura {
            0%, 100% {
              opacity: 0.35;
              transform: scale(1);
            }
            50% {
              opacity: 0.75;
              transform: scale(1.15);
            }
          }
          .rf-emblem-body {
            transform-origin: 50% 50%;
            animation: ${animated ? "rfEmblemBreathe 4.2s ease-in-out infinite" : "none"};
          }
        `}</style>

        <g className="rf-emblem-body">
          {/* Head Diamond Loop (Hollow) */}
          <path
            d={PATH_HEAD_COMPOUND}
            fill={
              colorScheme === "brand"
                ? `url(#rf-brand-grad-${size})`
                : colorScheme === "white"
                ? "#FFFFFF"
                : "currentColor"
            }
            style={{
              fill:
                colorScheme === "brand"
                  ? undefined
                  : colorScheme === "white"
                  ? "#FFFFFF"
                  : "var(--color-ink, #000000)",
            }}
            fillRule="evenodd"
          />

          {/* Ribbon Interlocking Infinity Body */}
          <path
            d={PATH_BODY_MAIN}
            fill={
              colorScheme === "brand"
                ? `url(#rf-brand-grad-${size})`
                : colorScheme === "white"
                ? "#FFFFFF"
                : "currentColor"
            }
            style={{
              fill:
                colorScheme === "brand"
                  ? undefined
                  : colorScheme === "white"
                  ? "#FFFFFF"
                  : "var(--color-ink, #000000)",
            }}
          />
          <path
            d={PATH_BODY_LEFT}
            fill={
              colorScheme === "brand"
                ? `url(#rf-brand-grad-${size})`
                : colorScheme === "white"
                ? "#FFFFFF"
                : "currentColor"
            }
            style={{
              fill:
                colorScheme === "brand"
                  ? undefined
                  : colorScheme === "white"
                  ? "#FFFFFF"
                  : "var(--color-ink, #000000)",
            }}
          />
          <path
            d={PATH_BODY_RIGHT}
            fill={
              colorScheme === "brand"
                ? `url(#rf-brand-grad-${size})`
                : colorScheme === "white"
                ? "#FFFFFF"
                : "currentColor"
            }
            style={{
              fill:
                colorScheme === "brand"
                  ? undefined
                  : colorScheme === "white"
                  ? "#FFFFFF"
                  : "var(--color-ink, #000000)",
            }}
          />
        </g>
      </svg>
    </div>
  );

  const wordmark = showText ? (
    <span
      className={`font-sans tracking-tight transition-colors duration-300 ${config.text} ${
        textClassName || "text-[var(--color-ink)]"
      }`}
      style={{
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <span className="font-extrabold text-[var(--color-ink)] transition-colors duration-300 group-hover:text-cyan-500">
        Resume
      </span>
      <span className="font-black bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 bg-clip-text text-transparent ml-0.5">
        Flow
      </span>
    </span>
  ) : null;

  const wrapperClass = `inline-flex items-center ${config.gap} ${
    href ? "group cursor-pointer" : ""
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={wrapperClass}>
        {logoMark}
        {wordmark}
      </Link>
    );
  }

  return (
    <div className={wrapperClass}>
      {logoMark}
      {wordmark}
    </div>
  );
}

export default AnimatedLogo;
