"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, type ReactNode } from "react";

type ParallaxProps = {
  children: ReactNode;
  /** Total travel in px. Negative values move up as the page scrolls down. */
  distance?: number;
  /**
   * `through`: travel is spread over the element's whole pass through the
   * viewport, centered on zero. `exit`: starts at rest and travels while the
   * element scrolls out the top — for content that is on screen at page load.
   */
  anchor?: "through" | "exit";
  className?: string;
};

/** Shifts content at a different rate than the page scroll to suggest depth. */
export function Parallax({
  children,
  distance = -80,
  anchor = "through",
  className,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: anchor === "exit" ? ["start start", "end start"] : ["start end", "end start"],
  });
  const raw = useTransform(
    scrollYProgress,
    [0, 1],
    anchor === "exit" ? [0, distance] : [-distance / 2, distance / 2],
  );
  // A stiff spring removes wheel-step jitter without adding perceptible lag.
  const y = useSpring(raw, { stiffness: 400, damping: 60, mass: 0.4 });

  return (
    <div ref={ref} className={className}>
      <motion.div className="h-full" style={reduce ? undefined : { y, willChange: "transform" }}>
        {children}
      </motion.div>
    </div>
  );
}
