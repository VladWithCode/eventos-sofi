"use server";

import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { z } from "zod";
import { parseAttribution } from "@/lib/data/attribution";
import { insertBooking } from "@/lib/data/bookings";
import { insertContact } from "@/lib/data/contacts";
import { addDays, isValidIsoDate, todayInMexico } from "@/lib/dates";
import { EVENT_TYPE_SLUGS, GUEST_RANGES, eventTypeLabel } from "@/lib/event-types";
import { formFields, invalid } from "@/lib/forms";
import { sendCapiEvent } from "@/lib/meta/capi";
import { normalizeMxPhone } from "@/lib/phone";
import { rateLimit } from "@/lib/rate-limit";
import { getRequestContext } from "@/lib/request";
import type { FormState } from "@/lib/types";

const LIMIT = 5;
const WINDOW_MS = 10 * 60_000;

const name = z
  .string()
  .trim()
  .min(2, { error: "Escribe tu nombre." })
  .max(120, { error: "El nombre es demasiado largo." });

const phone = z
  .string()
  .transform((value, ctx) => {
    const normalized = normalizeMxPhone(value);
    if (!normalized) {
      ctx.addIssue({ code: "custom", message: "Escribe un teléfono de 10 dígitos." });
      return z.NEVER;
    }
    return normalized;
  });

const consent = z.literal("on", { error: "Necesitamos tu autorización para contactarte." });

const bookingSchema = z.object({
  name,
  phone,
  email: z.union([
    z.literal(""),
    z.email({ error: "Revisa tu correo electrónico." }).trim().toLowerCase().max(200),
  ]),
  eventType: z.enum(EVENT_TYPE_SLUGS, { error: "Elige el tipo de evento." }),
  eventDate: z
    .string()
    .refine(isValidIsoDate, { error: "Elige la fecha de tu evento." })
    .refine((d) => d >= todayInMexico(), { error: "La fecha no puede estar en el pasado." })
    .refine((d) => d <= addDays(todayInMexico(), 365 * 5), { error: "Elige una fecha más cercana." }),
  guests: z.enum(GUEST_RANGES, { error: "Elige el número de invitados." }),
  location: z.string().trim().max(200, { error: "El lugar es demasiado largo." }),
  message: z.string().trim().max(2000, { error: "El mensaje no puede pasar de 2000 caracteres." }),
  consent,
});

const contactSchema = z.object({
  name,
  phone,
  message: z
    .string()
    .trim()
    .min(1, { error: "Escribe tu mensaje." })
    .max(2000, { error: "El mensaje no puede pasar de 2000 caracteres." }),
  consent,
});

const quickLeadSchema = z.object({
  name,
  phone,
  message: z.string().trim().max(500, { error: "El mensaje no puede pasar de 500 caracteres." }),
});

const RATE_LIMITED: FormState = {
  status: "error",
  message: "Recibimos varias solicitudes seguidas desde tu conexión. Intenta de nuevo en unos minutos o escríbenos por WhatsApp.",
};

/** The client's event id (for Pixel/CAPI dedup) or a fresh one if it is missing or malformed. */
function eventIdFrom(formData: FormData): string {
  const value = formData.get("eventId");
  return typeof value === "string" && /^[A-Za-z0-9-]{8,64}$/.test(value) ? value : randomUUID();
}

function isBot(formData: FormData): boolean {
  const honeypot = formData.get("website");
  return typeof honeypot === "string" && honeypot.trim() !== "";
}

export async function submitBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  const eventId = eventIdFrom(formData);
  try {
    if (isBot(formData)) return { status: "success", eventId };

    const parsed = bookingSchema.safeParse(
      formFields(formData, ["name", "phone", "email", "eventType", "eventDate", "guests", "location", "message", "consent"]),
    );
    if (!parsed.success) return invalid(parsed.error);

    const request = await getRequestContext();
    if (!rateLimit(`form:${request.ip}`, LIMIT, WINDOW_MS)) return RATE_LIMITED;

    const data = parsed.data;
    const attribution = parseAttribution(formData.get("attribution"));
    insertBooking({ ...data, metaEventId: eventId, attribution });

    after(() =>
      sendCapiEvent({
        name: "Lead",
        eventId,
        sourceUrl: attribution.landingUrl || request.referer,
        request,
        user: { name: data.name, phone: data.phone, email: data.email },
        fbclid: attribution.fbclid,
        customData: { content_name: eventTypeLabel(data.eventType), content_category: "booking" },
      }),
    );
    return { status: "success", eventId };
  } catch (error) {
    console.error("[submitBooking] failed:", error instanceof Error ? error.message : error);
    return {
      status: "error",
      message: "No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.",
    };
  }
}

type ContactInput = { name: string; phone: string; message: string };

/** Shared tail of the contact actions: rate limit, store, then mirror the event to Meta. */
async function storeContact(
  formData: FormData,
  eventId: string,
  data: ContactInput,
  meta: { name: "Lead" | "Contact"; customData: Record<string, string> },
): Promise<FormState> {
  const request = await getRequestContext();
  if (!rateLimit(`form:${request.ip}`, LIMIT, WINDOW_MS)) return RATE_LIMITED;

  const attribution = parseAttribution(formData.get("attribution"));
  insertContact({ ...data, metaEventId: eventId, attribution });

  after(() =>
    sendCapiEvent({
      name: meta.name,
      eventId,
      sourceUrl: attribution.landingUrl || request.referer,
      request,
      user: { name: data.name, phone: data.phone },
      fbclid: attribution.fbclid,
      customData: meta.customData,
    }),
  );
  return { status: "success", eventId };
}

const CONTACT_FAILED: FormState = {
  status: "error",
  message: "No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos por WhatsApp.",
};

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const eventId = eventIdFrom(formData);
  try {
    if (isBot(formData)) return { status: "success", eventId };

    const parsed = contactSchema.safeParse(formFields(formData, ["name", "phone", "message", "consent"]));
    if (!parsed.success) return invalid(parsed.error);

    const { name, phone, message } = parsed.data;
    return await storeContact(formData, eventId, { name, phone, message }, {
      name: "Contact",
      customData: { method: "form" },
    });
  } catch (error) {
    console.error("[submitContact] failed:", error instanceof Error ? error.message : error);
    return CONTACT_FAILED;
  }
}

/**
 * Entry prompt on the landing page: name and phone only, message optional.
 * There is no consent checkbox; the form states that sending it accepts the
 * privacy notice. Counted as a Lead because it is the page's fastest conversion.
 */
export async function submitQuickLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const eventId = eventIdFrom(formData);
  try {
    if (isBot(formData)) return { status: "success", eventId };

    const parsed = quickLeadSchema.safeParse(formFields(formData, ["name", "phone", "message"]));
    if (!parsed.success) return invalid(parsed.error);

    return await storeContact(formData, eventId, parsed.data, {
      name: "Lead",
      customData: { content_category: "quick-contact" },
    });
  } catch (error) {
    console.error("[submitQuickLead] failed:", error instanceof Error ? error.message : error);
    return CONTACT_FAILED;
  }
}
