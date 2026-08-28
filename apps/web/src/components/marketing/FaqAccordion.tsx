"use client";

import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

/**
 * Dark rounded accordion rows with an amber chevron chip. Uses native
 * <details>/<summary> for accessible, JS-free expand/collapse semantics;
 * motion only animates the chevron rotation and entrance stagger.
 */
export function FaqAccordion({ items }: FaqAccordionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <motion.details
          key={item.question}
          className="group rounded-2xl bg-charcoal-800 open:bg-charcoal-700"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" }}
        >
          <summary
            className={cn(
              "flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-base font-medium text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-900",
            )}
          >
            {item.question}
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-400 transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            >
              <ChevronDown className="size-4" strokeWidth={2} />
            </span>
          </summary>
          <p className="px-5 pb-4 text-sm leading-relaxed text-slate-300">{item.answer}</p>
        </motion.details>
      ))}
    </div>
  );
}
