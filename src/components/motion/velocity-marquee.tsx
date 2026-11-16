"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";
import { useRef, type ReactNode } from "react";

type VelocityMarqueeProps = {
  children: ReactNode;
  /** Percent of one copy's width travelled per second at rest. */
  baseVelocity?: number;
  className?: string;
};

const COPIES = 4;

/**
 * Endless ribbon that drifts on its own and borrows the page's scroll
 * velocity: scrolling faster speeds it up, reversing scroll reverses it.
 */
export function VelocityMarquee({
  children,
  baseVelocity = 2.2,
  className,
}: VelocityMarqueeProps) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], {
    clamp: false,
  });
  // Each copy is 100 / COPIES percent of the track, so wrapping by one copy is seamless.
  const x = useTransform(baseX, (value) => `${wrap(-100 / COPIES, 0, value)}%`);
  const skewX = useTransform(smoothVelocity, [-2000, 2000], [6, -6]);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;

    const step = direction.current * baseVelocity * (delta / 1000);
    baseX.set(baseX.get() - step - direction.current * step * Math.abs(factor));
  });

  return (
    <div className={`overflow-clip ${className ?? ""}`}>
      <motion.div
        className="flex w-max whitespace-nowrap will-change-transform"
        style={reduce ? undefined : { x, skewX }}
      >
        {Array.from({ length: COPIES }, (_, index) => (
          <div key={index} className="flex shrink-0" aria-hidden={index > 0}>
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
