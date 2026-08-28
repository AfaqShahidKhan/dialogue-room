import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "base" | "raised" | "sunken";

const toneClasses: Record<Tone, string> = {
  base: "bg-charcoal-900",
  raised: "bg-charcoal-800",
  sunken: "bg-charcoal-700",
};

interface PanelProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
}

/**
 * Signature structural move of the marketing surface: a full-width rounded-3xl
 * panel in a slightly different charcoal tone, with the page canvas showing
 * between panels like a stack of cards.
 */
export function Panel({ children, tone = "base", className, id }: PanelProps) {
  return (
    <section id={id} className="px-4 sm:px-6">
      <div
        className={cn(
          "mx-auto max-w-7xl overflow-hidden rounded-3xl",
          toneClasses[tone],
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}
