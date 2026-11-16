"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/dal";
import { CONTENT_TAGS } from "@/lib/content";
import { moveRow } from "@/lib/data/rows";
import { createTestimonial, deleteTestimonial, updateTestimonial } from "@/lib/data/testimonials";
import { EVENT_TYPE_SLUGS } from "@/lib/event-types";
import { checked, formFields, idFrom, invalid } from "@/lib/forms";
import type { FormState } from "@/lib/types";

const schema = z.object({
  author: z.string().trim().min(2, { error: "Escribe el nombre de quien opina." }).max(120),
  eventType: z.enum(EVENT_TYPE_SLUGS, { error: "Elige el tipo de evento." }),
  quote: z
    .string()
    .trim()
    .min(10, { error: "Escribe el testimonio." })
    .max(1000, { error: "Máximo 1000 caracteres." }),
  rating: z.coerce
    .number({ error: "Elige una calificación." })
    .int()
    .min(1, { error: "Elige de 1 a 5 estrellas." })
    .max(5, { error: "Elige de 1 a 5 estrellas." }),
});

export async function saveTestimonial(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = idFrom(formData);
  const parsed = schema.safeParse(formFields(formData, ["author", "eventType", "quote", "rating"]));
  if (!parsed.success) return invalid(parsed.error);

  const input = { ...parsed.data, visible: checked(formData, "visible") };
  if (id) updateTestimonial(id, input);
  else createTestimonial(input);

  updateTag(CONTENT_TAGS.testimonials);
  return { status: "success", message: id ? "Testimonio actualizado." : "Testimonio agregado." };
}

export async function moveTestimonial(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(formData);
  const direction = formData.get("direction");
  if (!id || (direction !== "up" && direction !== "down")) return;
  moveRow("testimonials", id, direction);
  updateTag(CONTENT_TAGS.testimonials);
}

export async function removeTestimonial(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(formData);
  if (!id) return;
  deleteTestimonial(id);
  updateTag(CONTENT_TAGS.testimonials);
}
