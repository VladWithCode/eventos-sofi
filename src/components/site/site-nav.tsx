"use client";

import { Menu, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { easeOut, spring } from "@/components/motion/springs";
import { ContactLink } from "./links";
import { WhatsAppIcon } from "./icons";

type NavLink = { href: string; label: string };

/** Scroll distance (px) that counts as a deliberate direction change. */
const DIRECTION_THRESHOLD = 6;

export function SiteNav({ links, whatsappUrl }: { links: NavLink[]; whatsappUrl: string }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [raised, setRaised] = useState(false);
  const [open, setOpen] = useState(false);

  // The bar steps aside while reading down and returns on the first scroll up.
  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    setRaised(current > 24);
    if (open) return;
    if (current - previous > DIRECTION_THRESHOLD && current > 240) setHidden(true);
    else if (previous - current > DIRECTION_THRESHOLD || current < 240) setHidden(false);
  });

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5"
        animate={{ y: hidden && !open ? "-130%" : "0%" }}
        transition={reduce ? { duration: 0 } : spring.move}
      >
        <div
          className={`mx-auto flex h-[3.75rem] max-w-[76rem] items-center justify-between rounded-full pr-2 pl-5 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-500 ${
            raised || open ? "glass" : "border border-transparent"
          }`}
        >
          <Link href="/#top" className="flex items-baseline gap-2" aria-label="Eventos Sofi, inicio">
            <span className="font-script text-[2.1rem] leading-none text-ink">Sofi</span>
            <span className="eyebrow text-[0.62rem] text-ink-soft">Eventos</span>
          </Link>

          <nav aria-label="Secciones" className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-[0.95rem] font-medium text-ink-soft transition-colors duration-200 hover:bg-ink/5 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href="/#cotizar"
              className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-[0.95rem] font-semibold text-paper transition-[transform,background-color] duration-150 ease-out hover:bg-night-soft active:scale-[0.97]"
            >
              Cotizar
            </Link>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full text-ink transition-[transform,background-color] duration-150 ease-out hover:bg-ink/5 active:scale-[0.94] lg:hidden"
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="menu-movil"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="fixed inset-0 z-[45] flex flex-col justify-between bg-paper/92 px-7 pt-28 pb-[calc(2rem+env(safe-area-inset-bottom))] backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0, scale: reduce ? 1 : 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 1.03 }}
            transition={{ duration: 0.35, ease: easeOut }}
          >
            <motion.nav
              aria-label="Secciones"
              className="flex flex-col"
              initial="closed"
              animate="open"
              transition={{ staggerChildren: reduce ? 0 : 0.055, delayChildren: 0.08 }}
            >
              {links.map((link) => (
                <motion.div
                  key={link.href}
                  className="border-b border-line"
                  variants={{
                    closed: { opacity: 0, y: reduce ? 0 : 26 },
                    open: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.7, ease: easeOut }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-4 font-display text-[2.6rem] leading-none font-medium tracking-[-0.025em]"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOut, delay: 0.3 }}
            >
              <Link
                href="/#cotizar"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-14 items-center justify-center rounded-full bg-ink text-[1.0625rem] font-semibold text-paper active:scale-[0.97]"
              >
                Cotiza tu evento
              </Link>
              <ContactLink
                method="whatsapp"
                href={whatsappUrl}
                className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full border border-ink/15 bg-surface text-[1.0625rem] font-semibold active:scale-[0.97]"
              >
                <WhatsAppIcon className="size-5 text-whatsapp" />
                Escríbenos por WhatsApp
              </ContactLink>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
