"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

/**
 * A statement that "inks in" word by word as it is scrolled through — the
 * reader sets the pace. Screen readers and reduced-motion users get the
 * plain paragraph.
 */
export function Manifesto({ text, emphasis }: { text: string; emphasis: string[] }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");

  if (reduce) {
    return <p className="display-lg font-normal">{text}</p>;
  }

  return (
    <p ref={ref} aria-label={text} className="display-lg font-normal">
      {words.map((word, index) => (
        <Word
          key={`${word}-${index}`}
          progress={scrollYProgress}
          range={[index / words.length, (index + 1) / words.length]}
          highlighted={emphasis.includes(word.replace(/[.,;:]/g, ""))}
        >
          {word}
        </Word>
      ))}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
  highlighted,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  highlighted: boolean;
}) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span
      aria-hidden
      style={{ opacity }}
      className={highlighted ? "text-gold-deep italic" : undefined}
    >
      {children}{" "}
    </motion.span>
  );
}
