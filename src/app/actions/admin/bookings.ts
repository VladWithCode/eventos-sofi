"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/dal";
import { deleteBooking, findBooking, updateBooking } from "@/lib/data/bookings";
import { formFields, idFrom, invalid } from "@/lib/forms";
import { BOOKING_STATUSES } from "@/lib/statuses";
import type { FormState } from "@/lib/types";

const schema = z.object({
  status: z.enum(BOOKING_STATUSES, { error: "Elige un estado." }),
  notes: z.string().trim().max(5000, { error: "Las notas son demasiado largas." }),
  quoteAmount: z
    .string()
    .trim()
    .transform((v) => v.replace(/[$,\s]/g, ""))
    .refine((v) => v === "" || /^\d{1,9}(\.\d{1,2})?$/.test(v), { error: "Escribe solo el monto, por ejemplo 15000." })
    .transform((v) => (v === "" ? null : Math.round(Number(v)))),
});

export async function saveBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = idFrom(formData);
  if (!id || !findBooking(id)) return { status: "error", message: "Esta reserva ya no existe." };

  const parsed = schema.safeParse(formFields(formData, ["status", "notes", "quoteAmount"]));
  if (!parsed.success) return invalid(parsed.error);

  updateBooking(id, parsed.data);
  refresh();
  return { status: "success", message: "Cambios guardados." };
}

export async function removeBooking(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idFrom(formData);
  if (id) deleteBooking(id);
  redirect("/admin/reservas");
}
