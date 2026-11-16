"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/dal";
import { CONTENT_TAGS } from "@/lib/content";
import { createGalleryItem, deleteGalleryItem, updateGalleryItem } from "@/lib/data/gallery";
import { moveRow } from "@/lib/data/rows";
import { EVENT_TYPE_SLUGS, eventTypeLabel } from "@/lib/event-types";
import { checked, formFields, idFrom, invalid } from "@/lib/forms";
import { deleteStoredImage, MediaError, saveUploadedImage } from "@/lib/media";
import type { FormState } from "@/lib/types";

const eventType = z.enum(EVENT_TYPE_SLUGS, { error: "Elige el tipo de evento." });

/** Uploads one photo. The client calls it once per file so each request stays small. */
export async function uploadGalleryPhoto(formData: FormData): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  const file = formData.get("file");
  const type = eventType.safeParse(formData.get("eventType"));
  if (!(file instanceof File) || !type.success) return { ok: false, message: "Datos incompletos." };

  try {
    const image = await saveUploadedImage(file, `Evento de ${eventTypeLabel(type.data).toLowerCase()} por Eventos Sofi`);
    createGalleryItem(image, type.data);
  } catch (error) {
    if (error instanceof MediaError) return { ok: false, message: error.message };
    console.error("[gallery] upload failed:", error instanceof Error ? error.message : error);
    return { ok: false, message: "No pudimos guardar la foto." };
  }
  updateTag(CONTENT_TAGS.gallery);
  return { ok: true };
}

const itemSchema = z.object({
  alt: z
    .string()
    .trim()
    .min(3, { error: "Describe brevemente la foto (ayuda a personas con lector de pantalla y a Google)." })
    .max(200, { error: "Máximo 200 caracteres." }),
  caption: z.string().trim().max(200, { error: "Máximo 200 caracteres." }),
  eventType,
});

export async function saveGalleryItem(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = idFrom(formData);
  if (!id) return { status: "error", message: "Foto no encontrada." };
  const parsed = itemSchema.safeParse(formFields(formData, ["alt", "caption", "eventType"]));
  if (!parsed.success) return invalid(parsed.error);

  updateGalleryItem(id, { ...parsed.data, featured: checked(formData, "featured"), visible: checked(formData, "visible") });
  updateTag(CONTENT_TAGS.gallery);
  return { status: "success", message: "Foto actualizada." };
}

export async function moveGalleryItem(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(formData);
  const direction = formData.get("direction");
  if (!id || (direction !== "up" && direction !== "down")) return;
  moveRow("gallery_items", id, direction);
  updateTag(CONTENT_TAGS.gallery);
}

export async function removeGalleryItem(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(formData);
  if (!id) return;
  await deleteStoredImage(deleteGalleryItem(id));
  updateTag(CONTENT_TAGS.gallery);
}
