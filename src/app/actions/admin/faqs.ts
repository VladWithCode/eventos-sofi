"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/dal";
import { CONTENT_TAGS } from "@/lib/content";
import { createFaq, deleteFaq, updateFaq } from "@/lib/data/faqs";
import { moveRow } from "@/lib/data/rows";
import { checked, formFields, idFrom, invalid } from "@/lib/forms";
import type { FormState } from "@/lib/types";

const schema = z.object({
  question: z.string().trim().min(5, { error: "Escribe la pregunta." }).max(200, { error: "Máximo 200 caracteres." }),
  answer: z.string().trim().min(5, { error: "Escribe la respuesta." }).max(2000, { error: "Máximo 2000 caracteres." }),
});

export async function saveFaq(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = idFrom(formData);
  const parsed = schema.safeParse(formFields(formData, ["question", "answer"]));
  if (!parsed.success) return invalid(parsed.error);

  const input = { ...parsed.data, visible: checked(formData, "visible") };
  if (id) updateFaq(id, input);
  else createFaq(input);

  updateTag(CONTENT_TAGS.faqs);
  return { status: "success", message: id ? "Pregunta actualizada." : "Pregunta agregada." };
}

export async function moveFaq(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(formData);
  const direction = formData.get("direction");
  if (!id || (direction !== "up" && direction !== "down")) return;
  moveRow("faqs", id, direction);
  updateTag(CONTENT_TAGS.faqs);
}

export async function removeFaq(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(formData);
  if (!id) return;
  deleteFaq(id);
  updateTag(CONTENT_TAGS.faqs);
}
