"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { PointerEvent, ReactNode } from "react";

type MagneticProps = {
  children: ReactNode;
  /** Fraction of the pointer offset the element follows. */
  strength?: number;
  className?: string;
};

/**
 * Pulls its child toward a hovering mouse pointer. X and Y run on independent
 * springs so the path stays natural when the two axes move at different speeds.
 * Touch pointers are ignored: there is no hover to follow.
 */
export function Magnetic({ children, strength = 0.28, className }: MagneticProps) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.5 });

  function follow(event: PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (box.left + box.width / 2)) * strength);
    y.set((event.clientY - (box.top + box.height / 2)) * strength);
  }

  function release() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={follow}
      onPointerLeave={release}
    >
      {children}
    </motion.div>
  );
}
