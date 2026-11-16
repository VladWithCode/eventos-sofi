"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import type { Service } from "@/lib/types";
import { ArtFrame, type ArtTone } from "./art";
import { SparkIcon } from "./icons";

const SURFACES = ["bg-surface", "bg-sand", "bg-blue-wash", "bg-gold-wash"] as const;
const TONES: ArtTone[] = ["blue", "gold", "sand"];

const priceFormat = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

/**
 * A deck of service cards. Each card sticks below the header while the next
 * one slides over it; covered cards settle back slightly to read as a stack.
 * Stacking needs enough viewport height to show a whole card, otherwise the
 * cards simply flow.
 */
export function ServiceDeck({ services }: { services: Service[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <div ref={ref} className="mt-14 flex flex-col gap-6 sm:mt-20">
      {services.map((service, index) => (
        <ServiceCard
          key={service.id}
          service={service}
          index={index}
          total={services.length}
          progress={scrollYProgress}
        />
      ))}
    </div>
  );
}

function ServiceCard({
  service,
  index,
  total,
  progress,
}: {
  service: Service;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const settled = 1 - (total - 1 - index) * 0.028;
  const scale = useTransform(progress, [index / total, 1], [1, settled]);

  return (
    <div
      className="[@media(min-height:660px)]:sticky"
      style={{ top: `calc(5.25rem + ${index * 0.75}rem)` }}
    >
      <motion.article
        style={reduce ? undefined : { scale, transformOrigin: "top center" }}
        className={`relative grid gap-x-10 gap-y-6 overflow-clip rounded-[2rem] border border-line p-6 shadow-lift will-change-transform sm:p-9 lg:grid-cols-12 lg:rounded-[2.5rem] lg:p-12 ${SURFACES[index % SURFACES.length]}`}
      >
        <div className="flex flex-col lg:col-span-7">
          <p className="font-display text-[1.35rem] leading-none text-gold-deep italic">
            {String(index + 1).padStart(2, "0")}
            <span className="text-muted not-italic"> / {String(total).padStart(2, "0")}</span>
          </p>
          {/* Small arch on phones, where the full frame would push the card past the fold. */}
          <ArtFrame
            image={service.image}
            tone={TONES[index % TONES.length]}
            sizes="4rem"
            className="arch absolute top-5 right-5 aspect-[3/4] w-16 sm:top-8 sm:right-8 lg:hidden"
          />

          <h3 className="display-lg mt-5 pr-20 lg:mt-7 lg:pr-0">{service.title}</h3>
          <p className="lede mt-3 max-w-[34rem] text-ink-soft lg:mt-5">{service.summary}</p>

          <ul className="mt-6 grid gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:mt-8">
            {service.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-[0.98rem] leading-snug text-ink-soft">
                <SparkIcon className="mt-[0.3em] size-3 shrink-0 text-gold" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-auto lg:pt-10">
            <a
              href="#cotizar"
              className="group inline-flex min-h-11 items-center gap-2 border-b border-ink pb-0.5 text-[1rem] font-semibold transition-colors duration-200 hover:border-gold-deep hover:text-gold-deep"
            >
              Cotizar este servicio
              <ArrowUpRight className="size-4 transition-transform duration-300 ease-(--ease-out-expo) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            {service.priceFrom ? (
              <p className="text-[0.95rem] text-muted">
                Desde <span className="font-semibold text-ink">{priceFormat.format(service.priceFrom)}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="hidden lg:col-span-5 lg:block">
          <ArtFrame
            image={service.image}
            tone={TONES[index % TONES.length]}
            sizes="(min-width: 1024px) 30rem, 0px"
            className="arch ml-auto aspect-[4/5] max-h-[27rem] w-full max-w-[22rem]"
          />
        </div>
      </motion.article>
    </div>
  );
}
