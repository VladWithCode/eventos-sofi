import type { Tone } from "@/components/admin/ui";

export const BOOKING_STATUSES = ["nueva", "contactada", "cotizada", "confirmada", "realizada", "cancelada"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS: Record<BookingStatus, { label: string; tone: Tone }> = {
  nueva: { label: "Nueva", tone: "gold" },
  contactada: { label: "Contactada", tone: "info" },
  cotizada: { label: "Cotizada", tone: "warn" },
  confirmada: { label: "Confirmada", tone: "ok" },
  realizada: { label: "Realizada", tone: "neutral" },
  cancelada: { label: "Cancelada", tone: "danger" },
};

export const CONTACT_STATUSES = ["nuevo", "respondido", "archivado"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const CONTACT_STATUS: Record<ContactStatus, { label: string; tone: Tone }> = {
  nuevo: { label: "Sin responder", tone: "gold" },
  respondido: { label: "Respondido", tone: "ok" },
  archivado: { label: "Archivado", tone: "neutral" },
};

export function isBookingStatus(value: unknown): value is BookingStatus {
  return BOOKING_STATUSES.includes(value as BookingStatus);
}

export function isContactStatus(value: unknown): value is ContactStatus {
  return CONTACT_STATUSES.includes(value as ContactStatus);
}
