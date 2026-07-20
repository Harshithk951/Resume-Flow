"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  color?: "rose" | "amber" | "emerald" | "slate";
}

const colorMap = {
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  slate: "bg-[var(--color-mute)]",
};

function Progress({ className, value = 0, color = "rose", ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn("w-full h-2 rounded-full bg-[var(--color-surface-card)] overflow-hidden", className)}
      {...props}
    >
      <div
        className={cn("h-full transition-all duration-500 rounded-full", colorMap[color])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export { Progress };
