"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { project, spring } from "@/components/motion/springs";
import { EVENT_TYPES, eventTypeLabel } from "@/lib/event-types";
import type { EventTypeSlug, GalleryItem } from "@/lib/types";

const PAGE_SIZE = 12;
/** Projected drag distance (px) past which the lightbox lets go. */
const DISMISS_DISTANCE = 220;

type Filter = "todos" | EventTypeSlug;

export function Gallery({ items }: { items: GalleryItem[] }) {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("todos");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [activeId, setActiveId] = useState<number | null>(null);

  const filters = EVENT_TYPES.filter((type) => items.some((item) => item.eventType === type.slug));
  const matching = filter === "todos" ? items : items.filter((item) => item.eventType === filter);
  const visible = matching.slice(0, limit);
  const activeIndex = visible.findIndex((item) => item.id === activeId);
  const active = activeIndex >= 0 ? visible[activeIndex] : null;

  const close = useCallback(() => setActiveId(null), []);
  const step = useCallback(
    (direction: 1 | -1) => {
      if (activeIndex < 0) return;
      const next = (activeIndex + direction + visible.length) % visible.length;
      setActiveId(visible[next].id);
    },
    [activeIndex, visible],
  );

  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, step]);

  return (
    <>
      {filters.length > 1 ? (
        <Reveal className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          {[{ slug: "todos" as const, label: "Todos" }, ...filters].map((option) => {
            const selected = filter === option.slug;
            return (
              <button
                key={option.slug}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setFilter(option.slug);
                  setLimit(PAGE_SIZE);
                }}
                className={`min-h-11 shrink-0 rounded-full border px-5 text-[0.95rem] font-semibold transition-[transform,background-color,color,border-color] duration-200 ease-out active:scale-[0.96] ${
                  selected
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-surface text-ink-soft hover:border-ink/40 hover:text-ink"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </Reveal>
      ) : null}

      <motion.div
        key={filter}
        className="mt-10 columns-2 gap-3 sm:gap-5 lg:columns-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {visible.map((item, index) => (
          <Reveal key={item.id} delay={(index % 3) * 0.07} className="mb-3 break-inside-avoid sm:mb-5">
            <motion.button
              type="button"
              layoutId={`foto-${item.id}`}
              onClick={() => setActiveId(item.id)}
              aria-label={`Ampliar foto: ${item.image.alt || eventTypeLabel(item.eventType)}`}
              className="group block w-full cursor-zoom-in overflow-clip rounded-[1.1rem] bg-sand sm:rounded-[1.5rem]"
              whileTap={{ scale: 0.98 }}
              transition={spring.move}
            >
              <Image
                src={item.image.url}
                alt={item.image.alt}
                width={item.image.width}
                height={item.image.height}
                sizes="(min-width: 1024px) 26rem, 48vw"
                placeholder={item.image.blurDataUrl ? "blur" : "empty"}
                blurDataURL={item.image.blurDataUrl || undefined}
                className="h-auto w-full transition-transform duration-[900ms] ease-(--ease-out-expo) group-hover:scale-[1.045]"
              />
            </motion.button>
          </Reveal>
        ))}
      </motion.div>

      {matching.length > limit ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((value) => value + PAGE_SIZE)}
            className="min-h-12 rounded-full border border-ink/20 bg-surface px-7 text-[1rem] font-semibold transition-[transform,border-color] duration-200 ease-out hover:border-ink active:scale-[0.97]"
          >
            Ver más fotos
          </button>
        </div>
      ) : null}

      <AnimatePresence>
        {active ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={active.caption || active.image.alt || "Foto ampliada"}
            className="fixed inset-0 z-[60] grid place-items-center p-4 sm:p-8"
          >
            {/* Scrim: dims the page so the photo is the only subject. */}
            <motion.div
              className="absolute inset-0 bg-ink/75 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={close}
            />

            {/* The photo grows out of its thumbnail and can be flicked away. */}
            <motion.figure
              key={active.id}
              layoutId={`foto-${active.id}`}
              className="relative z-10 touch-none overflow-clip rounded-[1.25rem] bg-sand shadow-lift"
              style={{
                aspectRatio: `${active.image.width} / ${active.image.height}`,
                width: `min(92vw, calc(82svh * ${active.image.width / active.image.height}))`,
              }}
              transition={reduce ? { duration: 0.2 } : spring.move}
              drag={reduce ? false : "y"}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.65}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.y + project(info.velocity.y)) > DISMISS_DISTANCE) close();
              }}
            >
              <Image
                src={active.image.url}
                alt={active.image.alt}
                fill
                sizes="92vw"
                draggable={false}
                className="pointer-events-none object-cover select-none"
              />
              {active.caption ? (
                <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/70 to-transparent px-5 pt-12 pb-4 text-[0.95rem] font-medium text-white">
                  {active.caption}
                </figcaption>
              ) : null}
            </motion.figure>

            <motion.div
              className="pointer-events-none absolute inset-0 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <button
                type="button"
                aria-label="Cerrar"
                onClick={close}
                className="glass pointer-events-auto absolute top-4 right-4 grid size-12 place-items-center rounded-full active:scale-[0.94]"
              >
                <X className="size-5" />
              </button>
              {visible.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Foto anterior"
                    onClick={() => step(-1)}
                    className="glass pointer-events-auto absolute bottom-5 left-4 grid size-12 place-items-center rounded-full active:scale-[0.94] sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Foto siguiente"
                    onClick={() => step(1)}
                    className="glass pointer-events-auto absolute right-4 bottom-5 grid size-12 place-items-center rounded-full active:scale-[0.94] sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              ) : null}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
