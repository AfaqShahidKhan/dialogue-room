"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/cn";

interface CornerCloudProps {
  /** Which corner of the (relative, overflow-hidden) parent to hug. */
  corner?: "tr" | "bl";
  className?: string;
}

/**
 * Solid soft-white cloud cluster sitting in a card corner, partially clipped
 * by the parent — the signature corner detail. Scales gently with scroll
 * position (bigger as the card enters the viewport, smaller as it leaves),
 * pinned to the corner via transform-origin. Static for reduced-motion users.
 */
export function CornerCloud({ corner = "tr", className }: CornerCloudProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  // Concentrate the effect while the card is actually in view: the cloud is
  // large as the card enters from the bottom and shrinks to rest by the time
  // it reaches the upper third — a clearly visible grow/shrink per scroll.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.3"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [2.4, 0.6]);
  const isTr = corner === "tr";

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      style={shouldReduceMotion ? undefined : { scale }}
      className={cn(
        "pointer-events-none absolute z-10",
        isTr ? "-right-4 -top-4 origin-top-right" : "-bottom-4 -left-4 origin-bottom-left",
        className,
      )}
    >
      <svg
        viewBox="0 0 84 68"
        fill="none"
        className={cn("h-16 w-20 sm:h-[72px] sm:w-[88px]", !isTr && "rotate-180")}
      >
        <circle cx="56" cy="22" r="24" fill="#f8fafc" fillOpacity="0.97" />
        <circle cx="28" cy="14" r="15" fill="#f8fafc" fillOpacity="0.97" />
        <circle cx="72" cy="46" r="13" fill="#f8fafc" fillOpacity="0.97" />
        <circle cx="40" cy="34" r="12" fill="#f8fafc" fillOpacity="0.97" />
      </svg>
    </motion.div>
  );
}
