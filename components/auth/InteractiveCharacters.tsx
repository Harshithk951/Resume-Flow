"use client";

import { useEffect, useState, useRef } from "react";

interface InteractiveCharactersProps {
  isPasswordFocused?: boolean;
  isPasswordVisible?: boolean;
  hasError?: boolean;
}

export function InteractiveCharacters({
  isPasswordFocused = false,
  isPasswordVisible = false,
  hasError = false,
}: InteractiveCharactersProps) {
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

  // Pupil offsets (locked downward if password input is focused)
  const activePupilX = isPasswordFocused && !isPasswordVisible ? 4 : mousePos.x * 6;
  const activePupilY = isPasswordFocused && !isPasswordVisible ? 5 : mousePos.y * 6;

  // Face shift for solid eyes (Orange & Yellow)
  const faceShiftX = isPasswordFocused && !isPasswordVisible ? 3 : mousePos.x * 5;
  const faceShiftY = isPasswordFocused && !isPasswordVisible ? 4 : mousePos.y * 5;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[360px] md:min-h-[480px] bg-[#e5e5e5] dark:bg-[#151a24] flex items-end justify-center p-4 overflow-hidden select-none"
    >
      <svg
        viewBox="0 0 400 400"
        className="w-full max-w-[420px] h-auto overflow-visible"
        style={{ filter: "drop-shadow(0px 8px 24px rgba(0,0,0,0.06))" }}
      >
        {/* ─── 1. PURPLE CHARACTER (Background Left) ─── */}
        <g
          id="purple-character"
          style={{
            transform: isPasswordVisible ? "translateY(10px) scaleY(0.96)" : "none",
            transformOrigin: "150px 360px",
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Main Pillar */}
          <rect
            x="95"
            y="95"
            width="110"
            height="265"
            rx="6"
            className="fill-[#6c1cd3] dark:fill-[#5a16b3]"
          />
          {/* Face Elements */}
          <g style={{ transform: `scaleY(${isBlinking ? 0.1 : 1})`, transformOrigin: "150px 125px" }}>
            {/* Left Eye White */}
            <circle cx="132" cy="125" r="9" fill="#ffffff" />
            {/* Left Pupil */}
            <circle cx={132 + activePupilX} cy={125 + activePupilY} r="4" fill="#000000" />

            {/* Nose / Mouth / Expression */}
            {hasError ? (
              <>
                {/* Concerned Angled Eyebrows */}
                <line x1="124" y1="110" x2="138" y2="114" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
                <line x1="162" y1="114" x2="176" y2="110" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
                {/* Frown Mouth */}
                <path d="M 144 146 Q 150 136 156 146" stroke="#000000" strokeWidth="4" fill="none" strokeLinecap="round" />
              </>
            ) : (
              /* Standard Vertical Line Nose/Mouth */
              <line
                x1="150"
                y1="122"
                x2="150"
                y2="148"
                stroke="#000000"
                strokeWidth="5"
                strokeLinecap="round"
              />
            )}

            {/* Right Eye White */}
            <circle cx="168" cy="125" r="9" fill="#ffffff" />
            {/* Right Pupil */}
            <circle cx={168 + activePupilX} cy={125 + activePupilY} r="4" fill="#000000" />
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
            className="fill-[#1c1c1e] dark:fill-[#0e0e10]"
          />
          {/* Face Elements (Top Right) */}
          <g style={{ transform: `scaleY(${isBlinking && !isPasswordVisible ? 0.1 : 1})`, transformOrigin: "245px 195px" }}>
            {/* Left Eye White */}
            <circle cx="236" cy="195" r="8" fill="#ffffff" />
            {/* Left Pupil */}
            <circle cx={236 + activePupilX * 0.8} cy={195 + activePupilY * 0.8} r="3.5" fill="#000000" />

            {/* Right Eye White */}
            <circle cx="255" cy="195" r="8" fill="#ffffff" />
            {/* Right Pupil */}
            <circle cx={255 + activePupilX * 0.8} cy={195 + activePupilY * 0.8} r="3.5" fill="#000000" />
          </g>

          {/* ─── PRIVACY REACTION: HANDS OVER EYES ─── */}
          <g
            id="black-character-hands"
            style={{
              transform: isPasswordVisible
                ? "translateY(0px) scale(1)"
                : "translateY(32px) scale(0)",
              transformOrigin: "245px 195px",
              opacity: isPasswordVisible ? 1 : 0,
              transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease",
            }}
          >
            {/* Left Hand covering left eye */}
            <ellipse cx="235" cy="195" rx="10" ry="11" fill="#27272a" stroke="#1c1c1e" strokeWidth="2" />
            {/* Right Hand covering right eye */}
            <ellipse cx="256" cy="195" rx="10" ry="11" fill="#27272a" stroke="#1c1c1e" strokeWidth="2" />
            {/* Finger details */}
            <line x1="235" y1="187" x2="235" y2="198" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="256" y1="187" x2="256" y2="198" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </g>

        {/* ─── 3. YELLOW CHARACTER (Right Foreground) ─── */}
        <g id="yellow-character">
          {/* Pillar with Arch Top */}
          <path
            d="M 245 360 L 245 250 A 42.5 42.5 0 0 1 330 250 L 330 360 Z"
            className="fill-[#eed500] dark:fill-[#c4af00]"
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
              stroke="#1c1c1e"
              strokeWidth="6.5"
              strokeLinecap="square"
            />
          </g>
        </g>

        {/* ─── 4. ORANGE CHARACTER (Front Foreground Semi-Circle) ─── */}
        <g
          id="orange-character"
          style={{
            transform: isPasswordVisible ? "translateY(6px) scaleY(0.97)" : "none",
            transformOrigin: "190px 360px",
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Semi-circle Dome */}
          <path
            d="M 75 360 A 115 115 0 0 1 305 360 Z"
            className="fill-[#f75c2f] dark:fill-[#d6471e]"
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
