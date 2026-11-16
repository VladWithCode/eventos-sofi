import type { EventTypeSlug } from "./types";

export const EVENT_TYPES: ReadonlyArray<{ slug: EventTypeSlug; label: string }> = [
  { slug: "xv-anos", label: "XV años" },
  { slug: "boda", label: "Boda" },
  { slug: "infantil", label: "Fiesta infantil" },
  { slug: "cumpleanos", label: "Cumpleaños" },
  { slug: "graduacion", label: "Graduación" },
  { slug: "bautizo", label: "Bautizo o primera comunión" },
  { slug: "empresarial", label: "Evento empresarial" },
  { slug: "otro", label: "Otro" },
];

export const EVENT_TYPE_SLUGS = EVENT_TYPES.map((t) => t.slug) as [EventTypeSlug, ...EventTypeSlug[]];

export const GUEST_RANGES = ["1-50", "51-100", "101-200", "201-300", "300+"] as const;

export function eventTypeLabel(slug: string): string {
  return EVENT_TYPES.find((t) => t.slug === slug)?.label ?? "Otro";
}

export function isEventTypeSlug(value: string): value is EventTypeSlug {
  return EVENT_TYPES.some((t) => t.slug === value);
}
