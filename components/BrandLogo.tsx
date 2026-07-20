"use client";

import Image from "next/image";
import Link from "next/link";
interface BrandLogoProps {
  href?: string;
  showText?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function BrandLogo({
  href,
  showText = true,
  size = "md",
  className = "",
}: BrandLogoProps) {
  // BrandLogo is always light on the landing page.
  // In the dashboard, the .dark class on the dashboard wrapper controls CSS variable inheritance.
  const isDark = false;
  const logoSrc = isDark ? "/logo-dark.png" : "/logo.png";

  // Light logo is 199×235 (portrait), dark logo is 256×256 (square).
  // We use conditional dimensions so each logo renders at its native aspect
  // ratio without distortion. A minor layout shift on theme toggle is
  // acceptable since it's user-initiated.
  const imgW = size === "sm" ? (isDark ? 32 : 26) : (isDark ? 52 : 48);
  const imgH = size === "sm" ? (isDark ? 32 : 30) : (isDark ? 52 : 56);

  const imageClass =
    size === "sm"
      ? "h-8 w-auto"
      : "h-[52px] w-auto transition-transform duration-300 group-hover:scale-105";

  const textClass =
    size === "sm"
      ? "font-extrabold tracking-tight text-[var(--color-ink)] text-lg"
      : "font-black text-2xl tracking-tight text-[var(--color-ink)]";

  const inner = (
    <>
      <Image
        src={logoSrc}
        alt="ResumeFlow"
        width={imgW}
        height={imgH}
        className={imageClass}
        priority={size === "md"}
      />
      {showText ? <span className={textClass}>ResumeFlow</span> : null}
    </>
  );

  const wrapperClass = `flex items-center gap-2 ${href ? "group" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={wrapperClass}>
        {inner}
      </Link>
    );
  }

  return <div className={wrapperClass}>{inner}</div>;
}
