"use client";

import { Check } from "lucide-react";
import { useActionState, useState } from "react";
import { submitContact } from "@/app/actions/public";
import { Reveal } from "@/components/motion/reveal";
import { getAttribution, newEventId, trackPixel } from "@/lib/meta/client";
import type { FormState } from "@/lib/types";
import { ConsentField, FieldError, Honeypot, SubmitButton, TextAreaField, TextField } from "./form-fields";

const IDLE: FormState = { status: "idle" };

/** Short "ask us anything" form for visitors who are not ready to request a quote. */
export function ContactForm() {
  const [values, setValues] = useState({ name: "", phone: "", message: "", consent: false });

  const [state, formAction, pending] = useActionState(async (previous: FormState, formData: FormData) => {
    formData.set("eventId", newEventId());
    formData.set("attribution", getAttribution());
    const result = await submitContact(previous, formData);
    if (result.status === "success") trackPixel("Contact", { method: "form" }, result.eventId);
    return result;
  }, IDLE);

  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <Reveal className="flex min-h-64 flex-col items-center justify-center rounded-[2rem] border border-line bg-surface p-8 text-center shadow-soft">
        <span className="grid size-14 place-items-center rounded-full bg-gold-wash text-gold-deep">
          <Check className="size-7" strokeWidth={2.4} />
        </span>
        <p role="status" className="display-md mt-5">
          ¡Mensaje recibido!
        </p>
        <p className="mt-2 max-w-xs text-ink-soft">Te responderemos muy pronto.</p>
      </Reveal>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      className="relative flex flex-col gap-5 rounded-[2rem] border border-line bg-surface p-6 shadow-soft sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="contacto-nombre"
          name="name"
          label="Tu nombre"
          autoComplete="name"
          value={values.name}
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
          error={errors.name}
        />
        <TextField
          id="contacto-telefono"
          name="phone"
          type="tel"
          inputMode="tel"
          label="WhatsApp o teléfono"
          autoComplete="tel"
          value={values.phone}
          onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
          error={errors.phone}
        />
      </div>
      <TextAreaField
        id="contacto-mensaje"
        name="message"
        label="Tu mensaje"
        rows={4}
        value={values.message}
        onChange={(event) => setValues((current) => ({ ...current, message: event.target.value }))}
        error={errors.message}
      />
      <ConsentField
        id="contacto-consent"
        checked={values.consent}
        onChange={(consent) => setValues((current) => ({ ...current, consent }))}
        error={errors.consent}
      />
      {state.status === "error" && state.message ? <FieldError id="contacto-error" message={state.message} /> : null}
      <SubmitButton pending={pending}>Enviar mensaje</SubmitButton>
      <Honeypot />
    </form>
  );
}
