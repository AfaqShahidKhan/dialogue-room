import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "default" | "success" | "warning" | "danger" | "brand" | "unread";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  danger: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  brand: "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200",
  /** Unread-count pills (chat list rows, sidebar Chat nav item) — amber, not brand blue. */
  unread: "bg-amber-500 text-slate-900 dark:bg-amber-400 dark:text-charcoal-950",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
