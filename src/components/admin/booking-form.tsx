"use client";

import { saveBooking } from "@/app/actions/admin/bookings";
import { BOOKING_STATUS, BOOKING_STATUSES, type BookingStatus } from "@/lib/statuses";
import { FormNotice, SubmitButton, useAdminForm } from "./form-controls";
import { Field, Input, Select, Textarea } from "./ui";

export function BookingForm({
  id,
  status,
  notes,
  quoteAmount,
}: {
  id: number;
  status: BookingStatus;
  notes: string;
  quoteAmount: number | null;
}) {
  const { state, pending, onSubmit, error } = useAdminForm(saveBooking);
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />
      <Field label="Estado" htmlFor="status" error={error("status")}>
        <Select id="status" name="status" defaultValue={status} aria-describedby="status-hint">
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {BOOKING_STATUS[s].label}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label="Monto cotizado (MXN)"
        htmlFor="quoteAmount"
        optional
        hint="Solo el número, sin signo de pesos."
        error={error("quoteAmount")}
      >
        <Input
          id="quoteAmount"
          name="quoteAmount"
          inputMode="decimal"
          defaultValue={quoteAmount ?? ""}
          aria-invalid={Boolean(error("quoteAmount"))}
          aria-describedby="quoteAmount-hint"
        />
      </Field>
      <Field label="Notas internas" htmlFor="notes" optional hint="Solo las ves tú." error={error("notes")}>
        <Textarea
          id="notes"
          name="notes"
          rows={5}
          defaultValue={notes}
          aria-invalid={Boolean(error("notes"))}
          aria-describedby="notes-hint"
        />
      </Field>
      <FormNotice state={state} />
      <SubmitButton pending={pending} className="self-start">
        Guardar cambios
      </SubmitButton>
    </form>
  );
}
