"use client";

import { Check } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitQuickLead } from "@/app/actions/public";
import { getAttribution, newEventId, trackPixel } from "@/lib/meta/client";
import type { FormState } from "@/lib/types";
import { FieldError, Honeypot, SubmitButton, TextField } from "./form-fields";
import { SparkIcon } from "./icons";

const SEEN_KEY = "sofi-lead-prompt";
/** Long enough for the page to paint first, short enough to read as "on arrival". */
const OPEN_DELAY_MS = 700;
const IDLE: FormState = { status: "idle" };

const secondaryButton =
  "inline-flex min-h-14 w-full items-center justify-center rounded-full border border-ink/20 bg-surface px-7 text-[1.0625rem] font-semibold text-ink " +
  "transition-[transform,border-color,background-color] duration-150 ease-out hover:border-ink/50 active:scale-[0.97]";

/**
 * Quick contact form that greets a visitor on arrival. "Ver más" (or Escape,
 * or a tap outside) dismisses it; it does not come back during the same visit.
 */
export function LeadPrompt() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState({ name: "", phone: "", message: "" });

  const [state, formAction, pending] = useActionState(async (previous: FormState, formData: FormData) => {
    // One id for the browser Pixel event and the server event, so Meta counts the lead once.
    formData.set("eventId", newEventId());
    formData.set("attribution", getAttribution());
    const result = await submitQuickLead(previous, formData);
    if (result.status === "success") trackPixel("Lead", { content_category: "quick-contact" }, result.eventId);
    return result;
  }, IDLE);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch {
      // Storage unavailable (private mode): show the prompt anyway.
    }
    const timer = setTimeout(() => {
      const node = dialog.current;
      if (!node || node.open) return;
      node.showModal();
      // Keep focus on the dialog itself so phones do not open the keyboard unasked.
      node.focus();
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Ignored: worst case the prompt shows again on the next page load.
      }
    }, OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const close = () => dialog.current?.close();
  const errors = state.fieldErrors ?? {};
  const update = (key: keyof typeof values) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  return (
    <dialog
      ref={dialog}
      tabIndex={-1}
      aria-labelledby="lead-prompt-title"
      // A click that lands on the dialog element itself is a click on the scrim.
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="rise-dialog m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-[27rem] overflow-y-auto rounded-[2rem] bg-surface p-0 text-ink shadow-lift outline-none"
    >
      <div className="relative overflow-clip p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-20 size-56 rounded-full bg-gold-wash blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -left-24 size-52 rounded-full bg-blue-wash blur-2xl"
        />

        {state.status === "success" ? (
          <div role="status" className="relative flex flex-col items-center py-6 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-gold-wash text-gold-deep">
              <Check className="size-8" strokeWidth={2.4} />
            </span>
            <h2 id="lead-prompt-title" className="display-lg mt-6">
              ¡Gracias, {values.name.trim().split(" ")[0]}!
            </h2>
            <p className="mt-3 max-w-[20rem] text-ink-soft">
              Recibimos tus datos. Te contactaremos muy pronto para platicar tu evento.
            </p>
            <button type="button" onClick={close} className={`${secondaryButton} mt-8`}>
              Ver más
            </button>
          </div>
        ) : (
          <form action={formAction} noValidate className="relative flex flex-col gap-3.5">
            <div>
              <p className="eyebrow flex items-center gap-2.5 text-gold-deep">
                <SparkIcon className="size-3.5" />
                Cotiza sin compromiso
              </p>
              <h2 id="lead-prompt-title" className="display-lg mt-3">
                ¿Planeas un evento?
              </h2>
              <p className="mt-2 text-ink-soft">Déjanos tus datos y te contactamos.</p>
            </div>

            <TextField
              id="rapido-nombre"
              name="name"
              label="Tu nombre"
              autoComplete="name"
              value={values.name}
              onChange={update("name")}
              error={errors.name}
            />
            <TextField
              id="rapido-telefono"
              name="phone"
              type="tel"
              inputMode="tel"
              label="WhatsApp o teléfono"
              autoComplete="tel"
              placeholder="618 123 4567"
              value={values.phone}
              onChange={update("phone")}
              error={errors.phone}
            />
            <TextField
              id="rapido-evento"
              name="message"
              label="¿Qué vas a celebrar?"
              optional
              placeholder="XV años, boda, fiesta infantil…"
              value={values.message}
              onChange={update("message")}
              error={errors.message}
            />

            {state.status === "error" && state.message ? (
              <FieldError id="rapido-error" message={state.message} />
            ) : null}

            <div className="mt-1 flex flex-col gap-2.5">
              <SubmitButton pending={pending} tone="gold">
                Quiero cotizar
              </SubmitButton>
              <button type="button" onClick={close} className={secondaryButton}>
                Ver más
              </button>
            </div>

            <p className="text-center text-[0.8rem] leading-snug text-muted">
              Al enviar aceptas nuestro{" "}
              <a href="/aviso-de-privacidad" target="_blank" className="font-semibold text-ink-soft underline underline-offset-2">
                aviso de privacidad
              </a>
              .
            </p>
            <Honeypot />
          </form>
        )}
      </div>
    </dialog>
  );
}
