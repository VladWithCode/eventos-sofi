"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/dal";
import { CONTENT_TAGS } from "@/lib/content";
import { moveRow } from "@/lib/data/rows";
import { createService, deleteService, findService, updateService } from "@/lib/data/services";
import { checked, formFields, idFrom, invalid } from "@/lib/forms";
import { deleteStoredImage, MediaError, saveUploadedImage } from "@/lib/media";
import type { FormState, MediaImage } from "@/lib/types";

const schema = z.object({
  title: z.string().trim().min(2, { error: "Escribe el nombre del servicio." }).max(120),
  summary: z.string().trim().min(2, { error: "Escribe un resumen corto." }).max(240, { error: "Máximo 240 caracteres." }),
  description: z.string().trim().max(2000, { error: "Máximo 2000 caracteres." }),
  features: z
    .string()
    .transform((v) =>
      v
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .refine((list) => list.length <= 12, { error: "Máximo 12 características." })
    .refine((list) => list.every((f) => f.length <= 120), { error: "Cada característica debe tener máximo 120 caracteres." }),
  priceFrom: z
    .string()
    .trim()
    .transform((v) => v.replace(/[$,\s]/g, ""))
    .refine((v) => v === "" || /^\d{1,9}$/.test(v), { error: "Escribe solo números, por ejemplo 3500." })
    .transform((v) => (v === "" ? null : Number(v))),
  imageAlt: z.string().trim().max(200, { error: "Máximo 200 caracteres." }),
});

export async function saveService(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = idFrom(formData);
  const existing = id ? findService(id) : null;
  if (id && !existing) return { status: "error", message: "Este servicio ya no existe." };

  const parsed = schema.safeParse(
    formFields(formData, ["title", "summary", "description", "features", "priceFrom", "imageAlt"]),
  );
  if (!parsed.success) return invalid(parsed.error);
  const { imageAlt, ...fields } = parsed.data;
  const alt = imageAlt || fields.title;

  let image: MediaImage | null = existing?.image ? { ...existing.image, alt } : null;
  let replaced: MediaImage | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      replaced = image;
      image = await saveUploadedImage(file, alt);
    } catch (error) {
      if (error instanceof MediaError) return { status: "error", fieldErrors: { image: error.message } };
      throw error;
    }
  } else if (checked(formData, "removeImage")) {
    replaced = image;
    image = null;
  }

  const input = { ...fields, image, visible: checked(formData, "visible") };
  if (existing) updateService(existing.id, input);
  else createService(input);
  await deleteStoredImage(replaced);

  updateTag(CONTENT_TAGS.services);
  return { status: "success", message: existing ? "Servicio actualizado." : "Servicio creado." };
}

export async function moveService(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(formData);
  const direction = formData.get("direction");
  if (!id || (direction !== "up" && direction !== "down")) return;
  moveRow("services", id, direction);
  updateTag(CONTENT_TAGS.services);
}

export async function removeService(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(formData);
  if (!id) return;
  await deleteStoredImage(deleteService(id));
  updateTag(CONTENT_TAGS.services);
}
