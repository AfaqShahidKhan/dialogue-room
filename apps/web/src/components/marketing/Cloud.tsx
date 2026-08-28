"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

interface CloudProps {
  className?: string;
  /** Loop duration in seconds for the floating oscillation. */
  duration?: number;
  /** Delay before the loop starts, for parallax variety between clouds. */
  delay?: number;
  /** Horizontal drift distance in px. */
  driftX?: number;
  /** Vertical drift distance in px. */
  driftY?: number;
}

/**
 * Hand-drawn-style outlined cloud, drawn as a simple original SVG path.
 * Purely decorative — floats gently via a slow, looping transform animation.
 */
export function Cloud({ className, duration = 8, delay = 0, driftX = 10, driftY = 14 }: CloudProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 120 78"
      fill="none"
      aria-hidden="true"
      className={cn("pointer-events-none text-sky-300/70", className)}
      animate={
        shouldReduceMotion
          ? undefined
          : {
              x: [0, driftX, 0, -driftX, 0],
              y: [0, -driftY, 0, driftY * 0.6, 0],
            }
      }
      transition={
        shouldReduceMotion
          ? undefined
          : { duration, delay, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <path
        d="M27 52C15.9543 52 7 43.0457 7 32C7 20.9543 15.9543 12 27 12C29.7307 12 32.3312 12.5486 34.6963 13.5406C38.0181 6.14762 45.4629 1 54.1 1C64.8757 1 73.8311 8.85486 75.5762 19.1338C76.7314 18.8879 77.9295 18.7581 79.1571 18.7581C88.6404 18.7581 96.3286 26.4463 96.3286 35.9297C96.3286 36.6427 96.2853 37.3455 96.201 38.0354C104.183 39.5764 110.2 46.5940 110.2 55C110.2 64.3888 102.589 72 93.2 72H27C15.9543 72 7 63.0457 7 52"
        fill="rgba(248, 250, 252, 0.95)"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}
