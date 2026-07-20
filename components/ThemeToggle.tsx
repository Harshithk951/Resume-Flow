"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render after mount
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={`flex items-center gap-3 px-3 py-3 rounded-2xl w-full ${className}`}
        aria-hidden="true"
      >
        <div className="w-5 h-5 shrink-0" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`group/nav relative flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-300 text-[var(--color-mute)] hover:bg-white/60 hover:text-[var(--color-ink)] dark:hover:bg-white/10 w-full ${className}`}
      style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
    >
      <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
        {isDark ? (
          <Sun
            className="h-4 w-4 transition-all duration-300 group-hover/nav:scale-110 text-[var(--color-ash)] group-hover/nav:text-[var(--color-mute)]"
            style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
          />
        ) : (
          <Moon
            className="h-4 w-4 transition-all duration-300 group-hover/nav:scale-110 text-[var(--color-ash)] group-hover/nav:text-[var(--color-mute)]"
            style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
          />
        )}
      </div>
      <span
        className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-all duration-500 delay-100"
        style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
      >
        {isDark ? "Light mode" : "Dark mode"}
      </span>
    </button>
  );
}
