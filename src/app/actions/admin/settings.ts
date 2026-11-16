"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/dal";
import { CONTENT_TAGS } from "@/lib/content";
import { writeSettings } from "@/lib/data/settings";
import { formFields, invalid } from "@/lib/forms";
import { normalizeMxPhone } from "@/lib/phone";
import type { FormState, SiteSettings } from "@/lib/types";

const text = (max: number) => z.string().trim().max(max, { error: `Máximo ${max} caracteres.` });

const phone = z.string().transform((value, ctx) => {
  const normalized = normalizeMxPhone(value);
  if (!normalized) {
    ctx.addIssue({ code: "custom", message: "Escribe 10 dígitos, por ejemplo 618 109 1072." });
    return z.NEVER;
  }
  return normalized;
});

const socialUrl = z.union([
  z.literal(""),
  z.url({ protocol: /^https$/, error: "Pega el enlace completo, empezando con https://" }).trim().max(300),
]);

const count = (max: number) =>
  z.coerce
    .number({ error: "Escribe un número." })
    .int({ error: "Escribe un número entero." })
    .min(0, { error: "No puede ser negativo." })
    .max(max, { error: `Máximo ${max}.` });

const schema = z.object({
  businessName: text(80).min(2, { error: "Escribe el nombre del negocio." }),
  tagline: text(160),
  phone,
  whatsapp: phone,
  whatsappMessage: text(300),
  email: z.union([z.literal(""), z.email({ error: "Revisa el correo." }).trim().toLowerCase().max(200)]),
  address: text(200),
  city: text(80),
  serviceArea: text(160),
  hours: text(160),
  instagramUrl: socialUrl,
  facebookUrl: socialUrl,
  tiktokUrl: socialUrl,
  yearsExperience: count(100),
  eventsCompleted: count(100_000),
}) satisfies z.ZodType<SiteSettings>;

const KEYS = Object.keys(schema.shape) as Array<keyof SiteSettings>;

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = schema.safeParse(formFields(formData, KEYS));
  if (!parsed.success) return invalid(parsed.error);

  writeSettings(parsed.data);
  updateTag(CONTENT_TAGS.settings);
  return { status: "success", message: "Ajustes guardados. El sitio ya muestra los cambios." };
}
