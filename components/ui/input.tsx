import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-stone)] focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
