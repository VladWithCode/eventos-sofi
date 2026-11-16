"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { easeOut } from "./springs";

type CountUpProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

const format = new Intl.NumberFormat("es-MX");

/** Counts from zero to `value` the first time it enters the viewport. */
export function CountUp({ value, prefix = "", suffix = "", className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const finalText = `${prefix}${format.format(value)}${suffix}`;

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: easeOut,
      onUpdate: (latest) => {
        node.textContent = `${prefix}${format.format(Math.round(latest))}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, prefix, suffix]);

  // The final value is server-rendered so the number is correct without JavaScript.
  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "lining-nums tabular-nums" }}>
      {finalText}
    </span>
  );
}
