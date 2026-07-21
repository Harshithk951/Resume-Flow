"use client";

import { useEffect, useState, useRef } from "react";

interface InteractiveCharactersProps {
  isEmailFocused?: boolean;
  isPasswordFocused?: boolean;
  isPasswordVisible?: boolean;
  isTyping?: boolean;
  hasError?: boolean;
}

export function InteractiveCharacters({
  isEmailFocused = false,
  isPasswordFocused = false,
  isPasswordVisible = false,
  isTyping = false,
  hasError = false,
}: InteractiveCharactersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Normalized mouse coordinates from -1 to 1
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [breath, setBreath] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let startTime = Date.now();

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalize between -1 and 1
      targetX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth / 2)));
      targetY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight / 2)));
    };

    // Smooth lerp & breathing update loop
    const updateLoop = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      setMousePos({ x: currentX, y: currentY });

      const elapsed = Date.now() - startTime;
      setBreath(Math.sin(elapsed * 0.003) * 1.5);

      animationFrameId = requestAnimationFrame(updateLoop);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationFrameId = requestAnimationFrame(updateLoop);

    // Periodic blinking effect
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3500);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      clearInterval(blinkInterval);
    };
  }, []);

  // Determine active direction vector
  const isFormFocused = isEmailFocused || isPasswordFocused || isTyping;
  const dirX = isFormFocused && !hasError ? 0.6 : mousePos.x;
  const dirY = isFormFocused && !hasError ? 0.4 : mousePos.y;

  // Pupil offsets
  const activePupilX = dirX * 7;
  const activePupilY = dirY * 7;

  // Rotation angles with fixed ground pivot at y=360
  const purpleRotate = hasError ? -15 : isFormFocused ? 7 : mousePos.x * 12;
  const blackRotate = hasError ? -6 : isFormFocused ? 5 : mousePos.x * 8;
  const yellowRotate = hasError ? -4 : isFormFocused ? 6 : mousePos.x * 9;
  const orangeSkewX = hasError ? -6 : -mousePos.x * 5;

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
        {/* ─── 1. PURPLE CHARACTER (Background Left) ─── */}
        <g
          id="purple-character"
          style={{
            transform: isPasswordVisible
              ? `translateY(${10 + breath}px) scaleY(0.96)`
              : `translateY(${breath}px) rotate(${purpleRotate}deg)`,
            transformOrigin: "150px 360px",
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Main Pillar Base fixed at y=360 */}
          <rect
            x="95"
            y="95"
            width="110"
            height="265"
            rx="6"
            className="fill-[#6c1cd3]"
          />
          {/* Face Elements */}
          <g style={{ transform: `scaleY(${isBlinking ? 0.1 : 1})`, transformOrigin: "150px 125px" }}>
            {/* Left Eye White */}
            <circle cx="132" cy="125" r="9" fill="#ffffff" />
            {/* Left Pupil */}
            <circle cx={132 + activePupilX} cy={125 + activePupilY} r="4" fill="#000000" />

            {/* Mouth Expressions */}
            {hasError ? (
              /* Sad Frown Mouth (Error State) */
              <path
                d="M 141 148 Q 150 137 159 148"
                stroke="#000000"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            ) : isEmailFocused || isPasswordFocused || isTyping ? (
              /* Vertical Line Mouth/Nose (Email & Password Typing State) */
              <line
                x1="150"
                y1="122"
                x2="150"
                y2="148"
                stroke="#000000"
                strokeWidth="5"
                strokeLinecap="round"
              />
            ) : (
              /* Standard Happy Smile Mouth */
              <path
                d="M 143 140 Q 150 148 157 140"
                stroke="#000000"
                strokeWidth="3.5"
                fill="none"
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
        <g
          id="black-character"
          style={{
            transform: `translateY(${breath * 0.8}px) rotate(${blackRotate}deg)`,
            transformOrigin: "232.5px 360px",
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Main Pillar Base fixed at y=360 */}
          <rect
            x="195"
            y="170"
            width="75"
            height="190"
            rx="4"
            className="fill-[#1c1c1e]"
          />
          {/* Face Elements */}
          {hasError ? (
            /* Sad Droopy Tilted Eyes */
            <g style={{ transform: `scaleY(${isBlinking && !isPasswordVisible ? 0.1 : 1})`, transformOrigin: "245px 195px" }}>
              <g transform="rotate(-15 236 195)">
                <circle cx="236" cy="195" r="8" fill="#ffffff" />
                <circle cx="234" cy="192" r="3.5" fill="#000000" />
              </g>
              <g transform="rotate(-15 255 195)">
                <circle cx="255" cy="195" r="8" fill="#ffffff" />
                <circle cx="253" cy="192" r="3.5" fill="#000000" />
              </g>
            </g>
          ) : (
            /* Normal Tracking Eyes */
            <g style={{ transform: `scaleY(${isBlinking && !isPasswordVisible ? 0.1 : 1})`, transformOrigin: "245px 195px" }}>
              <circle cx="236" cy="195" r="8" fill="#ffffff" />
              <circle cx={236 + activePupilX * 0.8} cy={195 + activePupilY * 0.8} r="3.5" fill="#000000" />

              <circle cx="255" cy="195" r="8" fill="#ffffff" />
              <circle cx={255 + activePupilX * 0.8} cy={195 + activePupilY * 0.8} r="3.5" fill="#000000" />
            </g>
          )}

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
            <ellipse cx="235" cy="195" rx="10" ry="11" fill="#27272a" stroke="#1c1c1e" strokeWidth="2" />
            <ellipse cx="256" cy="195" rx="10" ry="11" fill="#27272a" stroke="#1c1c1e" strokeWidth="2" />
            <line x1="235" y1="187" x2="235" y2="198" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="256" y1="187" x2="256" y2="198" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </g>

        {/* ─── 3. YELLOW CHARACTER (Right Foreground) ─── */}
        <g
          id="yellow-character"
          style={{
            transform: `translateY(${breath * 0.5}px) rotate(${yellowRotate}deg)`,
            transformOrigin: "287.5px 360px",
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Base fixed at y=360 */}
          <path
            d="M 245 360 L 245 250 A 42.5 42.5 0 0 1 330 250 L 330 360 Z"
            className="fill-[#eed500]"
          />
          {/* Face Elements */}
          <g>
            {/* Single Black Eye */}
            <circle
              cx={268 + activePupilX * 0.7}
              cy={234 + activePupilY * 0.7}
              r="4.5"
              fill="#000000"
              style={{ transform: `scaleY(${isBlinking ? 0.1 : 1})`, transformOrigin: "268px 234px" }}
            />

            {/* Mouth Expressions */}
            {hasError ? (
              /* Wavy Squiggly Line Mouth (Error State) */
              <path
                d="M 285 248 Q 295 240 305 248 T 325 248"
                stroke="#1c1c1e"
                strokeWidth="4.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : mousePos.x < 0 && !isFormFocused ? (
              /* Horizontal Beak Line extending to the LEFT */
              <line
                x1="205"
                y1="248"
                x2="268"
                y2="248"
                stroke="#1c1c1e"
                strokeWidth="6.5"
                strokeLinecap="square"
              />
            ) : (
              /* Horizontal Beak Line extending to the RIGHT */
              <line
                x1="282"
                y1="248"
                x2="345"
                y2="248"
                stroke="#1c1c1e"
                strokeWidth="6.5"
                strokeLinecap="square"
              />
            )}
          </g>
        </g>

        {/* ─── 4. ORANGE CHARACTER (Front Foreground Semi-Circle) ─── */}
        <g
          id="orange-character"
          style={{
            transform: isPasswordVisible
              ? `translateY(${6 + breath}px) scaleY(0.97)`
              : `translateY(${breath * 1.2}px) skewX(${orangeSkewX}deg)`,
            transformOrigin: "190px 360px",
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Base fixed at y=360 */}
          <path
            d="M 75 360 A 115 115 0 0 1 305 360 Z"
            className="fill-[#f75c2f]"
          />
          {/* Face Elements */}
          {hasError ? (
            /* Sad Frown Mouth (Error State) */
            <g transform={`translate(${activePupilX * 0.8}px, ${activePupilY * 0.8}px)`}>
              <circle cx="162" cy="305" r="6" fill="#000000" />
              <path d="M 181 322 Q 190 311 199 322" fill="none" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
              <circle cx="218" cy="305" r="6" fill="#000000" />
            </g>
          ) : isPasswordVisible ? (
            /* Closed Curving Eyelash Eyes (Unmask Privacy Reaction State - Matching Screenshot) */
            <g transform={`translate(${activePupilX * 0.6}px, ${activePupilY * 0.6}px)`}>
              <path d="M 152 305 Q 162 313 172 305" fill="none" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="190" cy="308" r="2.5" fill="#000000" />
              <path d="M 208 305 Q 218 313 228 305" fill="none" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          ) : isEmailFocused ? (
            /* Eyes Only (No Mouth) (Email Typing State - Matching Screenshot) */
            <g transform={`translate(${activePupilX * 0.8}px, ${activePupilY * 0.8}px)`}>
              <circle cx="162" cy="305" r="6" fill="#000000" />
              <circle cx="218" cy="305" r="6" fill="#000000" />
            </g>
          ) : (
            /* Standard Smiling Face (Masked Password & Cursor Motion State) */
            <g transform={`translate(${activePupilX * 0.8}px, ${activePupilY * 0.8}px)`}>
              <circle
                cx="162"
                cy="305"
                r="6"
                fill="#000000"
                style={{ transform: `scaleY(${isBlinking ? 0.1 : 1})`, transformOrigin: "162px 305px" }}
              />
              <path d="M 181 315 Q 190 326 199 315" fill="none" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
              <circle
                cx="218"
                cy="305"
                r="6"
                fill="#000000"
                style={{ transform: `scaleY(${isBlinking ? 0.1 : 1})`, transformOrigin: "218px 305px" }}
              />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
