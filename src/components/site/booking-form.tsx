"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useActionState, useRef, useState } from "react";
import { submitBooking } from "@/app/actions/public";
import { easeOut, spring } from "@/components/motion/springs";
import { EVENT_TYPES, GUEST_RANGES, eventTypeLabel } from "@/lib/event-types";
import { getAttribution, newEventId, trackCustom, trackPixel } from "@/lib/meta/client";
import type { EventTypeSlug, FormState } from "@/lib/types";
import {
  ChoiceGroup,
  ConsentField,
  FieldError,
  Honeypot,
  SubmitButton,
  TextAreaField,
  TextField,
} from "./form-fields";
import { WhatsAppIcon } from "./icons";
import { ContactLink } from "./links";

type GuestRange = (typeof GUEST_RANGES)[number];

type Values = {
  eventType: EventTypeSlug | "";
  eventDate: string;
  guests: GuestRange | "";
  location: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  consent: boolean;
};

const EMPTY: Values = {
  eventType: "",
  eventDate: "",
  guests: "",
  location: "",
  name: "",
  phone: "",
  email: "",
  message: "",
  consent: false,
};

const EVENT_STEP_FIELDS = ["eventType", "eventDate", "guests", "location"] as const;
const EVENT_OPTIONS = EVENT_TYPES.map((type) => ({ value: type.slug, label: type.label }));
const GUEST_OPTIONS = GUEST_RANGES.map((range) => ({ value: range, label: range }));
const IDLE: FormState = { status: "idle" };

function localDateString(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Checks the first step in the browser so "Continuar" never advances past a gap. */
function validateEventStep(values: Values): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.eventType) errors.eventType = "Elige el tipo de evento.";
  if (!values.eventDate) errors.eventDate = "Indica la fecha de tu evento.";
  else if (values.eventDate < localDateString(new Date())) errors.eventDate = "La fecha ya pasó. Elige una fecha próxima.";
  if (!values.guests) errors.guests = "Elige el número aproximado de invitados.";
  return errors;
}

export function BookingForm({ whatsappUrl }: { whatsappUrl: string }) {
  const reduce = useReducedMotion();
  const [values, setValues] = useState<Values>(EMPTY);
  const [step, setStep] = useState<0 | 1>(0);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const started = useRef(false);
  const card = useRef<HTMLDivElement>(null);

  const [state, formAction, pending] = useActionState(async (previous: FormState, formData: FormData) => {
    // One id shared by the browser Pixel event and the server event, so Meta counts the lead once.
    formData.set("eventId", newEventId());
    formData.set("attribution", getAttribution());
    const result = await submitBooking(previous, formData);
    if (result.status === "success") {
      trackPixel(
        "Lead",
        { content_name: eventTypeLabel(String(formData.get("eventType"))), content_category: "booking" },
        result.eventId,
      );
      // The thank-you panel is shorter than the form; bring it back into view.
      requestAnimationFrame(() => card.current?.scrollIntoView({ block: "center", behavior: "smooth" }));
    } else if (EVENT_STEP_FIELDS.some((field) => result.fieldErrors?.[field])) {
      setStep(0);
    }
    return result;
  }, IDLE);

  const errors = { ...state.fieldErrors, ...stepErrors };

  function set<Key extends keyof Values>(key: Key, value: Values[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    setStepErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function advance() {
    const found = validateEventStep(values);
    setStepErrors(found);
    if (Object.keys(found).length === 0) setStep(1);
  }

  function markStarted() {
    if (started.current) return;
    started.current = true;
    trackCustom("FormStart", { form: "booking" });
  }

  // Each step leaves the way it came in: forward exits left, back exits right.
  const stepMotion = (index: 0 | 1) => {
    const active = step === index;
    const offset = reduce ? 0 : index === 0 ? -36 : 36;
    return {
      inert: !active,
      initial: false as const,
      animate: active
        ? { opacity: 1, x: 0, visibility: "visible" as const }
        : { opacity: 0, x: offset, transitionEnd: { visibility: "hidden" as const } },
      transition: reduce ? { duration: 0.2 } : spring.move,
    };
  };

  return (
    <div
      ref={card}
      className="relative overflow-clip rounded-[2rem] border border-line bg-surface p-6 shadow-lift sm:p-9 lg:rounded-[2.5rem]"
    >
      <AnimatePresence mode="wait" initial={false}>
        {state.status === "success" ? (
          <motion.div
            key="gracias"
            role="status"
            className="flex min-h-[30rem] flex-col items-center justify-center text-center"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            <svg viewBox="0 0 72 72" className="size-20" aria-hidden>
              <motion.circle
                cx="36"
                cy="36"
                r="33"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: reduce ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: easeOut }}
                style={{ rotate: -90, transformOrigin: "center" }}
              />
              <motion.path
                d="M23 37.5l9 9 17.5-19"
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: reduce ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: easeOut, delay: 0.55 }}
              />
            </svg>
            <h3 className="display-lg mt-7">¡Gracias, {values.name.trim().split(" ")[0]}!</h3>
            <p className="lede mt-3 max-w-[26rem] text-ink-soft">
              Recibimos los datos de tu evento. Te contactaremos pronto para preparar tu cotización.
            </p>
            <ContactLink
              method="whatsapp"
              href={whatsappUrl}
              className="mt-8 inline-flex min-h-14 items-center gap-2.5 rounded-full bg-whatsapp px-7 text-[1.0625rem] font-semibold text-white shadow-lift transition-transform duration-150 ease-out active:scale-[0.97]"
            >
              <WhatsAppIcon className="size-5" />
              Escribir ahora por WhatsApp
            </ContactLink>
          </motion.div>
        ) : (
          <motion.form
            key="formulario"
            action={formAction}
            noValidate
            onFocusCapture={markStarted}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow text-muted">Paso {step + 1} de 2</p>
              <div aria-hidden className="flex w-24 gap-1.5">
                {[0, 1].map((index) => (
                  <span key={index} className="h-1 flex-1 overflow-clip rounded-full bg-line">
                    <motion.span
                      className="block h-full origin-left rounded-full bg-gold-deep"
                      initial={false}
                      animate={{ scaleX: step >= index ? 1 : 0 }}
                      transition={reduce ? { duration: 0 } : spring.move}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Both steps share one grid cell, so the card keeps its height while they swap. */}
            <div className="mt-6 grid [&>*]:col-start-1 [&>*]:row-start-1">
              <motion.div {...stepMotion(0)} className="flex flex-col gap-6">
                <h3 className="display-md">Cuéntanos de tu evento</h3>
                <ChoiceGroup
                  name="eventType"
                  legend="¿Qué celebramos?"
                  options={EVENT_OPTIONS}
                  value={values.eventType}
                  onChange={(value) => set("eventType", value)}
                  error={errors.eventType}
                />
                <TextField
                  id="reserva-fecha"
                  name="eventDate"
                  type="date"
                  label="Fecha del evento"
                  value={values.eventDate}
                  onChange={(event) => set("eventDate", event.target.value)}
                  error={errors.eventDate}
                />
                <ChoiceGroup
                  name="guests"
                  legend="Invitados (aproximado)"
                  options={GUEST_OPTIONS}
                  value={values.guests}
                  onChange={(value) => set("guests", value)}
                  error={errors.guests}
                />
                <TextField
                  id="reserva-lugar"
                  name="location"
                  label="Lugar o salón"
                  optional
                  placeholder="Salón, jardín, domicilio…"
                  value={values.location}
                  onChange={(event) => set("location", event.target.value)}
                  error={errors.location}
                />
                <button
                  type="button"
                  onClick={advance}
                  className="group mt-auto inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full bg-ink px-7 text-[1.0625rem] font-semibold text-paper shadow-lift transition-[transform,background-color] duration-150 ease-out hover:bg-night-soft active:scale-[0.97]"
                >
                  Continuar
                  <ArrowRight className="size-5 transition-transform duration-300 ease-(--ease-out-expo) group-hover:translate-x-1" />
                </button>
              </motion.div>

              <motion.div {...stepMotion(1)} className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    aria-label="Volver al paso anterior"
                    className="-ml-2 grid size-11 place-items-center rounded-full text-ink-soft transition-[transform,background-color] duration-150 hover:bg-ink/5 active:scale-[0.94]"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <h3 className="display-md">¿A quién le enviamos la cotización?</h3>
                </div>
                <TextField
                  id="reserva-nombre"
                  name="name"
                  label="Tu nombre"
                  autoComplete="name"
                  value={values.name}
                  onChange={(event) => set("name", event.target.value)}
                  error={errors.name}
                />
                <TextField
                  id="reserva-telefono"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  label="WhatsApp o teléfono"
                  autoComplete="tel"
                  placeholder="618 123 4567"
                  value={values.phone}
                  onChange={(event) => set("phone", event.target.value)}
                  error={errors.phone}
                />
                <TextField
                  id="reserva-correo"
                  name="email"
                  type="email"
                  inputMode="email"
                  label="Correo"
                  optional
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => set("email", event.target.value)}
                  error={errors.email}
                />
                <TextAreaField
                  id="reserva-mensaje"
                  name="message"
                  label="¿Algo que debamos saber?"
                  optional
                  placeholder="Temática, colores, servicios que te interesan…"
                  value={values.message}
                  onChange={(event) => set("message", event.target.value)}
                  error={errors.message}
                />
                <ConsentField
                  id="reserva-consent"
                  checked={values.consent}
                  onChange={(checked) => set("consent", checked)}
                  error={errors.consent}
                />
                {state.status === "error" && state.message ? (
                  <FieldError id="reserva-error" message={state.message} />
                ) : null}
                <SubmitButton pending={pending}>Solicitar cotización</SubmitButton>
              </motion.div>
            </div>
            <Honeypot />
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
