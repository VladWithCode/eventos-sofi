"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/motion/reveal";

const STEPS = [
  {
    title: "Cuéntanos tu idea",
    body: "Escríbenos por WhatsApp o llena el formulario con la fecha, el tipo de evento y tus invitados. Con eso empezamos.",
  },
  {
    title: "Recibe tu propuesta",
    body: "Preparamos una cotización a tu medida: decoración, banquete y mobiliario pensados para tu presupuesto.",
  },
  {
    title: "Afinamos cada detalle",
    body: "Colores, flores, telas, menú y montaje. Ajustamos contigo hasta que todo se sienta tuyo.",
  },
  {
    title: "Disfruta tu evento",
    body: "Llega el día y nosotros montamos, coordinamos y recogemos. Tú solo celebras.",
  },
];

/** Timeline whose gold thread is drawn by the scroll position. */
export function ProcessTimeline() {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.55"] });
  const thread = useSpring(scrollYProgress, { stiffness: 220, damping: 40, mass: 0.5 });

  return (
    <ol ref={ref} className="relative">
      <span aria-hidden className="absolute top-3 bottom-3 left-[1.4rem] w-px bg-ink/12" />
      <motion.span
        aria-hidden
        className="absolute top-3 bottom-3 left-[1.4rem] w-px origin-top bg-gold-deep"
        style={{ scaleY: reduce ? 1 : thread }}
      />
      {STEPS.map((step, index) => (
        <Step
          key={step.title}
          step={step}
          index={index}
          progress={thread}
          threshold={index / (STEPS.length - 1)}
          reduce={Boolean(reduce)}
        />
      ))}
    </ol>
  );
}

function Step({
  step,
  index,
  progress,
  threshold,
  reduce,
}: {
  step: (typeof STEPS)[number];
  index: number;
  progress: MotionValue<number>;
  threshold: number;
  reduce: boolean;
}) {
  // The marker fills as the thread reaches it.
  const span: [number, number] = [Math.max(0, threshold - 0.08), Math.min(1, threshold + 0.02)];
  const fill = useTransform(progress, span, [0, 1]);
  const numberColor = useTransform(progress, span, ["#16171a", "#ffffff"]);

  return (
    <li className="relative flex gap-6 pb-12 last:pb-0 sm:gap-8 sm:pb-16">
      <span className="relative z-10 grid size-[2.8rem] shrink-0 place-items-center overflow-clip rounded-full border border-ink/15 bg-paper">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-gold-deep"
          style={{ scale: reduce ? 1 : fill, opacity: reduce ? 1 : fill }}
        />
        <motion.span
          className="relative font-display text-[1.25rem] leading-none font-semibold"
          style={{ color: reduce ? "#ffffff" : numberColor }}
        >
          {index + 1}
        </motion.span>
      </span>
      <Reveal className="pt-1" y={20}>
        <h3 className="display-md">{step.title}</h3>
        <p className="mt-2.5 max-w-[30rem] text-ink-soft">{step.body}</p>
      </Reveal>
    </li>
  );
}
