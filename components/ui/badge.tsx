import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-rose-600 text-white shadow-sm",
        secondary:
          "border-[var(--color-hairline)] bg-[var(--color-surface-card)] text-[var(--color-charcoal)]",
        success:
          "border-transparent bg-emerald-600 text-white shadow-sm",
        warning:
          "border-transparent bg-amber-600 text-white shadow-sm",
        destructive:
          "border-transparent bg-red-600 text-white shadow-sm",
        outline:
          "border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-mute)]",
        soft_rose:
          "border-rose-100 bg-rose-50 text-rose-700",
        soft_green:
          "border-emerald-100 bg-emerald-50 text-emerald-700",
        soft_amber:
          "border-amber-100 bg-amber-50 text-amber-700",
        premium:
          "shimmer-pill border-transparent bg-[var(--color-canvas)] text-rose-700",
      },
      size: {
        sm: "px-2 py-0.5 text-[9px]",
        md: "px-2.5 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
