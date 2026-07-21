"use client";

import { useEffect, useState, useRef } from "react";

export function InteractiveCharacters() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Normalized mouse coordinates from -1 to 1
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalize between -1 and 1
      targetX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth / 2)));
      targetY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight / 2)));
    };

    // Smooth lerp update loop
    const updatePosition = () => {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      setMousePos({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationFrameId = requestAnimationFrame(updatePosition);

    // Periodic blinking effect
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      clearInterval(blinkInterval);
    };
  }, []);

  // Pupil offsets (constrained within eye limits)
  const pupilOffsetX = mousePos.x * 6;
  const pupilOffsetY = mousePos.y * 6;

  // Face shift for solid eyes (Orange & Yellow)
  const faceShiftX = mousePos.x * 5;
  const faceShiftY = mousePos.y * 5;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[360px] md:min-h-[480px] bg-[#e3e5e8] dark:bg-[#151a24] flex items-end justify-center p-4 overflow-hidden select-none"
    >
      <svg
        viewBox="0 0 400 400"
        className="w-full max-w-[420px] h-auto overflow-visible"
        style={{ filter: "drop-shadow(0px 8px 24px rgba(0,0,0,0.06))" }}
      >
        {/* ─── 1. PURPLE CHARACTER (Background Left) ─── */}
        <g id="purple-character">
          {/* Main Pillar */}
          <rect
            x="95"
            y="95"
            width="110"
            height="265"
            rx="6"
            className="fill-[#7c3aed] dark:fill-[#6d28d9]"
          />
          {/* Face Elements */}
          <g style={{ transform: `scaleY(${isBlinking ? 0.1 : 1})`, transformOrigin: "150px 125px" }}>
            {/* Left Eye White */}
            <circle cx="132" cy="125" r="9" fill="#ffffff" />
            {/* Left Pupil */}
            <circle cx={132 + pupilOffsetX} cy={125 + pupilOffsetY} r="4" fill="#000000" />

            {/* Vertical Nose Line */}
            <line
              x1="150"
              y1="122"
              x2="150"
              y2="148"
              stroke="#000000"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Right Eye White */}
            <circle cx="168" cy="125" r="9" fill="#ffffff" />
            {/* Right Pupil */}
            <circle cx={168 + pupilOffsetX} cy={125 + pupilOffsetY} r="4" fill="#000000" />
          </g>
        </g>

        {/* ─── 2. BLACK CHARACTER (Background Middle) ─── */}
        <g id="black-character">
          {/* Main Pillar */}
          <rect
            x="195"
            y="170"
            width="75"
            height="190"
            rx="4"
            className="fill-[#18181b] dark:fill-[#09090b]"
          />
          {/* Face Elements (Top Right) */}
          <g style={{ transform: `scaleY(${isBlinking ? 0.1 : 1})`, transformOrigin: "245px 195px" }}>
            {/* Left Eye White */}
            <circle cx="236" cy="195" r="8" fill="#ffffff" />
            {/* Left Pupil */}
            <circle cx={236 + pupilOffsetX * 0.8} cy={195 + pupilOffsetY * 0.8} r="3.5" fill="#000000" />

            {/* Right Eye White */}
            <circle cx="255" cy="195" r="8" fill="#ffffff" />
            {/* Right Pupil */}
            <circle cx={255 + pupilOffsetX * 0.8} cy={195 + pupilOffsetY * 0.8} r="3.5" fill="#000000" />
          </g>
        </g>

        {/* ─── 3. YELLOW CHARACTER (Right Foreground) ─── */}
        <g id="yellow-character">
          {/* Pillar with Arch Top */}
          <path
            d="M 245 360 L 245 250 A 42.5 42.5 0 0 1 330 250 L 330 360 Z"
            className="fill-[#eab308] dark:fill-[#ca8a04]"
          />
          {/* Face Elements */}
          <g transform={`translate(${faceShiftX * 0.6}, ${faceShiftY * 0.6})`}>
            {/* Single Black Eye */}
            <circle
              cx="268"
              cy="234"
              r="4.5"
              fill="#000000"
              style={{ transform: `scaleY(${isBlinking ? 0.1 : 1})`, transformOrigin: "268px 234px" }}
            />
            {/* Horizontal Beak/Nose Line extending to the right */}
            <line
              x1="282"
              y1="248"
              x2="345"
              y2="248"
              stroke="#18181b"
              strokeWidth="6.5"
              strokeLinecap="square"
            />
          </g>
        </g>

        {/* ─── 4. ORANGE CHARACTER (Front Foreground Semi-Circle) ─── */}
        <g id="orange-character">
          {/* Semi-circle Dome */}
          <path
            d="M 75 360 A 115 115 0 0 1 305 360 Z"
            className="fill-[#f97316] dark:fill-[#ea580c]"
          />
          {/* Face Elements (Centered) */}
          <g transform={`translate(${faceShiftX * 0.8}, ${faceShiftY * 0.8})`}>
            {/* Left Solid Eye */}
            <circle
              cx="162"
              cy="305"
              r="6"
              fill="#000000"
              style={{ transform: `scaleY(${isBlinking ? 0.1 : 1})`, transformOrigin: "162px 305px" }}
            />
            {/* Smiling Curve Mouth */}
            <path
              d="M 181 315 Q 190 326 199 315"
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Right Solid Eye */}
            <circle
              cx="218"
              cy="305"
              r="6"
              fill="#000000"
              style={{ transform: `scaleY(${isBlinking ? 0.1 : 1})`, transformOrigin: "218px 305px" }}
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
