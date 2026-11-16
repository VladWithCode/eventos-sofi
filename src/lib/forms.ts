import type { z } from "zod";
import type { FormState } from "./types";

/** Reads text fields from FormData; files and missing keys become "". */
export function formFields<K extends string>(formData: FormData, keys: readonly K[]): Record<K, string> {
  const out = {} as Record<K, string>;
  for (const key of keys) {
    const value = formData.get(key);
    out[key] = typeof value === "string" ? value : "";
  }
  return out;
}

/** A positive integer `id` field, or null. */
export function idFrom(formData: FormData, key = "id"): number | null {
  const value = formData.get(key);
  if (typeof value !== "string" || !/^\d{1,12}$/.test(value)) return null;
  const id = Number(value);
  return id > 0 ? id : null;
}

/** `checked` checkboxes submit "on"; unchecked ones are absent. */
export function checked(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

/** First error message per field, keyed by field name. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

export function invalid(error: z.ZodError, message = "Revisa los campos marcados."): FormState {
  return { status: "error", message, fieldErrors: fieldErrors(error) };
}
