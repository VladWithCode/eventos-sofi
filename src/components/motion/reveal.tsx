"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { easeOut } from "./springs";

type RevealProps = {
  children: ReactNode;
  /** Seconds to wait after entering the viewport. */
  delay?: number;
  /** Rise distance in px. */
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "figure" | "span";
} & Pick<ComponentProps<typeof motion.div>, "style" | "id">;

/** Fades and rises content the first time it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduce ? 0.3 : 0.9, ease: easeOut, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

type RevealTextProps = {
  text: string;
  className?: string;
  delay?: number;
  /** Seconds between words. */
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
};

/**
 * Word-by-word masked rise. Screen readers get the plain sentence; the split
 * words are presentation only.
 */
export function RevealText({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  as = "h2",
}: RevealTextProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.h2;
  const words = text.split(" ");

  return (
    <Tag
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ staggerChildren: reduce ? 0 : stagger, delayChildren: delay }}
    >
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          aria-hidden
          className="inline-block overflow-clip pb-[0.14em] -mb-[0.14em] align-bottom"
        >
          <motion.span
            className="inline-block will-change-transform"
            variants={{
              hidden: { y: reduce ? 0 : "108%", opacity: reduce ? 0 : 1 },
              shown: { y: 0, opacity: 1 },
            }}
            transition={{ duration: reduce ? 0.3 : 1, ease: easeOut }}
          >
            {word}
            {index < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
