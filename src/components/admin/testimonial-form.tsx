"use client";

import { saveTestimonial } from "@/app/actions/admin/testimonials";
import { EVENT_TYPES } from "@/lib/event-types";
import type { Testimonial } from "@/lib/types";
import { FormNotice, SubmitButton, useAdminForm } from "./form-controls";
import { Checkbox, Field, Input, Select, Textarea } from "./ui";

export function TestimonialForm({ testimonial }: { testimonial?: Testimonial }) {
  const { state, pending, onSubmit, formRef, error } = useAdminForm(saveTestimonial, {
    resetOnSuccess: !testimonial,
  });
  const id = (field: string) => `testimonial-${testimonial?.id ?? "new"}-${field}`;
  const control = (field: string) => ({
    id: id(field),
    name: field,
    "aria-invalid": Boolean(error(field)),
    "aria-describedby": `${id(field)}-hint`,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
      {testimonial ? <input type="hidden" name="id" value={testimonial.id} /> : null}
      <Field label="Nombre" htmlFor={id("author")} hint="Como quiere aparecer, por ejemplo “Mariana G.”" error={error("author")}>
        <Input {...control("author")} defaultValue={testimonial?.author} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de evento" htmlFor={id("eventType")} error={error("eventType")}>
          <Select {...control("eventType")} defaultValue={testimonial?.eventType ?? "xv-anos"}>
            {EVENT_TYPES.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Calificación" htmlFor={id("rating")} error={error("rating")}>
          <Select {...control("rating")} defaultValue={String(testimonial?.rating ?? 5)}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {"★".repeat(n)} ({n})
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field
        label="Testimonio"
        htmlFor={id("quote")}
        hint="Copia sus palabras tal cual y con su permiso."
        error={error("quote")}
      >
        <Textarea {...control("quote")} rows={4} defaultValue={testimonial?.quote} required />
      </Field>
      <label className="flex min-h-11 items-center gap-3 font-semibold text-ink-soft">
        <Checkbox name="visible" defaultChecked={testimonial?.visible ?? true} />
        Visible en el sitio
      </label>
      <FormNotice state={state} />
      <SubmitButton pending={pending} className="self-start">
        {testimonial ? "Guardar cambios" : "Agregar testimonio"}
      </SubmitButton>
    </form>
  );
}
