"use client";

import { ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { trackContactClick } from "@/lib/meta/client";
import { WhatsAppIcon } from "./icons";

type ContactMethod = Parameters<typeof trackContactClick>[0];

/**
 * Plain anchor that reports the click to Meta. Tracking is fire-and-forget so
 * navigation is never delayed.
 */
export function ContactLink({
  method,
  onClick,
  ...props
}: ComponentProps<"a"> & { method: ContactMethod }) {
  const external = method !== "phone";
  return (
    <a
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
      {...props}
      onClick={(event) => {
        trackContactClick(method);
        onClick?.(event);
      }}
    />
  );
}

const pillBase =
  "group inline-flex min-h-14 select-none items-center rounded-full text-[1.0625rem] font-semibold " +
  "transition-[transform,background-color,box-shadow,border-color] duration-200 ease-out active:scale-[0.97]";

/** Primary call to action: ink pill with a gold arrow that leans in on hover. */
export function PrimaryCta({
  children,
  className,
  ...props
}: ComponentProps<"a"> & { children: ReactNode }) {
  return (
    <a
      className={`${pillBase} gap-4 bg-ink py-2 pr-2 pl-7 text-paper shadow-lift hover:bg-night-soft ${className ?? ""}`}
      {...props}
    >
      {children}
      <span
        aria-hidden
        className="grid size-10 place-items-center rounded-full bg-gold text-ink transition-transform duration-300 ease-(--ease-out-expo) group-hover:rotate-45"
      >
        <ArrowUpRight className="size-5" strokeWidth={2.2} />
      </span>
    </a>
  );
}

/** Secondary call to action: opens a WhatsApp chat. */
export function WhatsAppCta({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <ContactLink
      method="whatsapp"
      href={href}
      className={`${pillBase} gap-2.5 border border-ink/15 bg-surface/70 px-6 text-ink hover:border-ink/40 hover:bg-surface ${className ?? ""}`}
    >
      <WhatsAppIcon className="size-5 text-whatsapp" />
      {children}
    </ContactLink>
  );
}
