"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export type ExpressionState = "neutral" | "watching" | "shy" | "shocked";

export interface InteractiveCharactersProps {
  expression?: ExpressionState;
  isEmailFocused?: boolean;
  isPasswordFocused?: boolean;
  isPasswordVisible?: boolean;
  hasError?: boolean;
}

export function InteractiveCharacters({
  expression = "neutral",
  isEmailFocused = false,
  isPasswordFocused = false,
  isPasswordVisible = false,
  hasError = false,
}: InteractiveCharactersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const latestMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);

  // Computed pupil offset (dx, dy clamped to 3.5px radius)
  const [pupilOffset, setPupilOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Priority order resolution: shocked > shy > watching > neutral
  let activeExpression: ExpressionState = expression;
  if (hasError) {
    activeExpression = "shocked";
  } else if (expression === "neutral") {
    if (isPasswordVisible) activeExpression = "shocked";
    else if (isPasswordFocused) activeExpression = "shy";
    else if (isEmailFocused) activeExpression = "watching";
  }

  // Ref pattern to prevent stale closures inside un-keyed rAF loop
  const activeExpressionRef = useRef<ExpressionState>(activeExpression);
  useEffect(() => {
    activeExpressionRef.current = activeExpression;
  }, [activeExpression]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      latestMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    if (typeof window !== "undefined") {
      latestMouseRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }

    window.addEventListener("mousemove", handleMouseMove);

    // rAF loop to sample mouse position once per frame smoothly
    const updatePupils = () => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const currentExpr = activeExpressionRef.current;

      if (prefersReducedMotion) {
        setPupilOffset({ x: 0, y: 0 });
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let targetX = latestMouseRef.current.x;
        let targetY = latestMouseRef.current.y;

        if (currentExpr === "watching") {
          // Email focus: bias target toward right side (form area)
          targetX = rect.left + rect.width * 1.2;
          targetY = rect.top + rect.height * 0.45;
        } else if (currentExpr === "shy" || isPasswordFocused) {
          // Password focus / typing: characters look LEFT away from password field for privacy!
          targetX = rect.left - rect.width * 1.0;
          targetY = rect.top + rect.height * 0.45;
        }

        const deltaX = targetX - centerX;
        const deltaY = targetY - centerY;
        const angle = Math.atan2(deltaY, deltaX);
        const distance = Math.hypot(deltaX, deltaY);

        // Clamp maximum displacement to 3.5px
        const maxRadius = 3.5;
        const r = Math.min(maxRadius, distance * 0.02);

        const dx = r * Math.cos(angle);
        const dy = r * Math.sin(angle);

        setPupilOffset((prev) => ({
          x: prev.x + (dx - prev.x) * 0.2,
          y: prev.y + (dy - prev.y) * 0.2,
        }));
      }

      rafIdRef.current = requestAnimationFrame(updatePupils);
    };

    rafIdRef.current = requestAnimationFrame(updatePupils);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isPasswordFocused]);

  // Derived style parameters for expressions
  const isShocked = activeExpression === "shocked";
  const isWatching = activeExpression === "watching";
  const isShy = activeExpression === "shy";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[360px] md:min-h-[480px] bg-[#e5e5e5] flex items-end justify-center p-4 overflow-hidden select-none"
    >
      <svg
        viewBox="0 0 400 400"
        className="w-full max-w-[420px] h-auto overflow-visible"
        style={{ filter: "drop-shadow(0px 8px 24px rgba(0,0,0,0.04))" }}
      >
        {/* ─── 1. PURPLE CHARACTER (Index 0: Delay 0ms) ─── */}
        <motion.g
          id="purple-character"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0 }}
          style={{ transformOrigin: "150px 360px" }}
        >
          {/* Body */}
          <rect x="95" y="95" width="110" height="265" rx="6" className="fill-[#6c1cd3]" />

          {/* Eyes Group (Always round, no pupil flattening) */}
          <g
            style={{
              transform: isShocked ? "scale(1.15)" : "scale(1)",
              transformOrigin: "150px 125px",
              transition: "transform 200ms ease-out",
            }}
          >
            {/* Left Eye White */}
            <circle cx="132" cy="125" r="9" fill="#ffffff" />
            {/* Left Pupil (Always round open circle) */}
            <circle
              cx="132"
              cy="125"
              r="4"
              fill="#000000"
              style={{
                transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                transformOrigin: "132px 125px",
              }}
            />

            {/* Right Eye White */}
            <circle cx="168" cy="125" r="9" fill="#ffffff" />
            {/* Right Pupil (Always round open circle) */}
            <circle
              cx="168"
              cy="125"
              r="4"
              fill="#000000"
              style={{
                transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                transformOrigin: "168px 125px",
              }}
            />

            {/* Mouth */}
            {isShocked ? (
              <path d="M 141 148 Q 150 137 159 148" stroke="#000000" strokeWidth="4" fill="none" strokeLinecap="round" />
            ) : isWatching ? (
              <line x1="150" y1="122" x2="150" y2="148" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
            ) : (
              <path d="M 143 140 Q 150 148 157 140" stroke="#000000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            )}
          </g>
        </motion.g>

        {/* ─── 2. BLACK CHARACTER (Index 1: Delay 100ms) ─── */}
        <motion.g
          id="black-character"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          style={{ transformOrigin: "232.5px 360px" }}
        >
          {/* Body */}
          <rect x="195" y="170" width="75" height="190" rx="4" className="fill-[#1c1c1e]" />

          {/* Eyes Group (Always round, no pupil flattening) */}
          <g
            style={{
              transform: isShocked ? "scale(1.15)" : "scale(1)",
              transformOrigin: "245px 195px",
              transition: "transform 200ms ease-out",
            }}
          >
            <circle cx="236" cy="195" r="8" fill="#ffffff" />
            <circle
              cx="236"
              cy="195"
              r="3.5"
              fill="#000000"
              style={{
                transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                transformOrigin: "236px 195px",
              }}
            />

            <circle cx="255" cy="195" r="8" fill="#ffffff" />
            <circle
              cx="255"
              cy="195"
              r="3.5"
              fill="#000000"
              style={{
                transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                transformOrigin: "255px 195px",
              }}
            />
          </g>
        </motion.g>

        {/* ─── 3. ORANGE CHARACTER (Index 2: Delay 200ms) ─── */}
        <motion.g
          id="orange-character"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
          style={{ transformOrigin: "190px 360px" }}
        >
          {/* Body */}
          <path d="M 75 360 A 115 115 0 0 1 305 360 Z" className="fill-[#f75c2f]" />

          {/* Face Group with Amplified Left Gaze Displacement */}
          <g
            style={{
              transform: isShocked ? "scale(1.15)" : "scale(1)",
              transformOrigin: "190px 310px",
              transition: "transform 200ms ease-out",
            }}
          >
            {/* Amplified pupil translation for Orange character (always round open eyes) */}
            <g style={{ transform: `translate(${pupilOffset.x * 2.8}px, ${pupilOffset.y * 1.5}px)` }}>
              {/* Left Eye (Always round open circle) */}
              <circle cx="162" cy="305" r="6" fill="#000000" />

              {/* Mouth */}
              {isShocked ? (
                <path d="M 181 322 Q 190 311 199 322" fill="none" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
              ) : isWatching ? null : (
                <path d="M 181 315 Q 190 326 199 315" fill="none" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
              )}

              {/* Right Eye (Always round open circle) */}
              <circle cx="218" cy="305" r="6" fill="#000000" />
            </g>
          </g>
        </motion.g>

        {/* ─── 4. YELLOW CHARACTER (Index 3: Delay 300ms) ─── */}
        <motion.g
          id="yellow-character"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
          style={{ transformOrigin: "287.5px 360px" }}
        >
          {/* Body */}
          <path d="M 245 360 L 245 250 A 42.5 42.5 0 0 1 330 250 L 330 360 Z" className="fill-[#eed500]" />

          {/* Face Elements */}
          <g
            style={{
              transform: isShocked ? "scale(1.15)" : "scale(1)",
              transformOrigin: "287px 240px",
              transition: "transform 200ms ease-out",
            }}
          >
            {/* Eye (Always round open circle) */}
            <circle
              cx="268"
              cy="234"
              r="4.5"
              fill="#000000"
              style={{
                transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                transformOrigin: "268px 234px",
              }}
            />

            {/* Mouth/Beak */}
            {isShocked ? (
              <path
                d="M 285 248 Q 295 240 305 248 T 325 248"
                stroke="#1c1c1e"
                strokeWidth="4.5"
                fill="none"
                strokeLinecap="round"
              />
            ) : isShy || isPasswordFocused ? (
              /* Beak points LEFT when typing password */
              <line x1="205" y1="248" x2="268" y2="248" stroke="#1c1c1e" strokeWidth="6.5" strokeLinecap="square" />
            ) : (
              /* Beak points RIGHT otherwise */
              <line x1="282" y1="248" x2="345" y2="248" stroke="#1c1c1e" strokeWidth="6.5" strokeLinecap="square" />
            )}
          </g>
        </motion.g>
      </svg>
    </div>
  );
}
