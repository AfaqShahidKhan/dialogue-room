import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function Spinner({ size = 24, className, label = "Loading" }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center justify-center">
      <Loader2 className={cn("animate-spin text-brand-600", className)} width={size} height={size} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function FullPageSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Spinner size={32} label={label} />
    </div>
  );
}
