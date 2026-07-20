"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface AppBackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

export function AppBackButton({
  fallbackHref = "/dashboard",
  label = "Back",
  className = "",
}: AppBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label}
      className={`inline-flex items-center gap-2 rounded-xl border border-[var(--color-hairline)]/80 bg-[var(--color-canvas)] px-3 py-2 text-sm font-semibold text-[var(--color-mute)] shadow-sm transition-colors hover:border-[var(--color-secondary-bg)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-ink)] ${className}`}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
