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
  const imageClass =
    size === "sm"
      ? "h-8 w-auto"
      : "h-[52px] w-auto transition-transform duration-300 group-hover:scale-105";

  const textClass =
    size === "sm"
      ? "font-extrabold tracking-tight text-slate-800 text-lg"
      : "font-black text-2xl tracking-tight text-slate-900";

  const inner = (
    <>
      <Image
        src="/logo.png"
        alt="ResumeFlow"
        width={199}
        height={235}
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
