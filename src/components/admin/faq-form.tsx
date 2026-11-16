"use client";

import { saveFaq } from "@/app/actions/admin/faqs";
import type { Faq } from "@/lib/types";
import { FormNotice, SubmitButton, useAdminForm } from "./form-controls";
import { Checkbox, Field, Input, Textarea } from "./ui";

export function FaqForm({ faq }: { faq?: Faq }) {
  const { state, pending, onSubmit, formRef, error } = useAdminForm(saveFaq, { resetOnSuccess: !faq });
  const id = (field: string) => `faq-${faq?.id ?? "new"}-${field}`;
  const control = (field: string) => ({
    id: id(field),
    name: field,
    "aria-invalid": Boolean(error(field)),
    "aria-describedby": `${id(field)}-hint`,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
      {faq ? <input type="hidden" name="id" value={faq.id} /> : null}
      <Field label="Pregunta" htmlFor={id("question")} error={error("question")}>
        <Input {...control("question")} defaultValue={faq?.question} required />
      </Field>
      <Field label="Respuesta" htmlFor={id("answer")} error={error("answer")}>
        <Textarea {...control("answer")} rows={4} defaultValue={faq?.answer} required />
      </Field>
      <label className="flex min-h-11 items-center gap-3 font-semibold text-ink-soft">
        <Checkbox name="visible" defaultChecked={faq?.visible ?? true} />
        Visible en el sitio
      </label>
      <FormNotice state={state} />
      <SubmitButton pending={pending} className="self-start">
        {faq ? "Guardar cambios" : "Agregar pregunta"}
      </SubmitButton>
    </form>
  );
}
