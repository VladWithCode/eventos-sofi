"use client";

import { X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
  type TargetAndTransition,
} from "motion/react";
import { useEffect, useState } from "react";
import { Magnetic } from "@/components/motion/magnetic";
import { spring } from "@/components/motion/springs";
import { trackContactClick } from "@/lib/meta/client";
import { WhatsAppIcon } from "./icons";

const HINT_SEEN_KEY = "sofi-wa-hint";
const HINT_DELAY_MS = 7000;
const HINT_VISIBLE_MS = 10000;
const NUDGE_EVERY_MS = 24000;

/** A short ring-ring: a phone buzzing in place, then still again. */
const NUDGE: TargetAndTransition = {
  rotate: [0, -16, 13, -9, 6, -3, 0],
  transition: { duration: 0.9, ease: "easeInOut" },
};

export function WhatsAppFab({ href }: { href: string }) {
  const reduce = useReducedMotion();
  const icon = useAnimationControls();
  const [hint, setHint] = useState(false);
  const [unread, setUnread] = useState(false);

  // One invitation per visit: the hint bubble opens after a few seconds of reading.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(HINT_SEEN_KEY)) return;
    } catch {
      // Storage unavailable (private mode): show the hint anyway.
    }
    const show = setTimeout(() => {
      setHint(true);
      setUnread(true);
      if (!reduce) icon.start(NUDGE);
      try {
        sessionStorage.setItem(HINT_SEEN_KEY, "1");
      } catch {
        // Ignored: worst case the hint shows again on the next page load.
      }
    }, HINT_DELAY_MS);
    const hide = setTimeout(() => setHint(false), HINT_DELAY_MS + HINT_VISIBLE_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [icon, reduce]);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") icon.start(NUDGE);
    }, NUDGE_EVERY_MS);
    return () => clearInterval(id);
  }, [icon, reduce]);

  return (
    <div className="pointer-events-none fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {hint ? (
          <motion.div
            role="status"
            className="glass pointer-events-auto relative max-w-[16.5rem] rounded-[1.4rem] rounded-br-md py-3.5 pr-10 pl-4"
            style={{ transformOrigin: "bottom right" }}
            initial={{ opacity: 0, scale: reduce ? 1 : 0.5, y: reduce ? 0 : 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.5, y: reduce ? 0 : 14 }}
            transition={reduce ? { duration: 0.2 } : spring.momentum}
          >
            <p className="text-[0.95rem] leading-snug font-semibold text-ink">¿Planeamos tu evento?</p>
            <p className="mt-0.5 text-[0.875rem] leading-snug text-ink-soft">
              Escríbenos por WhatsApp y platicamos tu idea.
            </p>
            <button
              type="button"
              aria-label="Cerrar mensaje"
              className="absolute top-1.5 right-1.5 grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
              onClick={() => setHint(false)}
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Magnetic className="pointer-events-auto">
        <motion.a
          href={href}
          target="_blank"
          rel="noopener"
          aria-label="Escríbenos por WhatsApp"
          className="relative grid size-[3.75rem] place-items-center rounded-full bg-whatsapp text-white shadow-lift"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.92 }}
          transition={reduce ? { duration: 0.2 } : { ...spring.momentum, delay: 1.2 }}
          onClick={() => {
            setHint(false);
            setUnread(false);
            trackContactClick("whatsapp");
          }}
        >
          <span aria-hidden className="absolute inset-0 -z-10 animate-ping-soft rounded-full bg-whatsapp" />
          <span
            aria-hidden
            className="absolute inset-0 -z-10 animate-ping-soft rounded-full bg-whatsapp [animation-delay:0.45s]"
          />
          <motion.span animate={icon} className="grid place-items-center">
            <WhatsAppIcon className="size-8" />
          </motion.span>
          <AnimatePresence>
            {unread ? (
              <motion.span
                aria-hidden
                className="absolute -top-0.5 -right-0.5 grid size-[1.35rem] place-items-center rounded-full bg-danger text-[0.72rem] leading-none font-bold text-white ring-2 ring-paper"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={spring.momentum}
              >
                1
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.a>
      </Magnetic>
    </div>
  );
}
