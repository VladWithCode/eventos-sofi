"use client";

import Image from "next/image";
import { saveService } from "@/app/actions/admin/services";
import type { Service } from "@/lib/types";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/upload-limits";
import { FormNotice, SubmitButton, useAdminForm } from "./form-controls";
import { Checkbox, Field, Input, Textarea } from "./ui";

/** Create (no `service`) or edit form for a service. */
export function ServiceForm({ service }: { service?: Service }) {
  const { state, pending, onSubmit, formRef, error } = useAdminForm(saveService, { resetOnSuccess: !service });
  const id = (field: string) => `service-${service?.id ?? "new"}-${field}`;
  const control = (field: string) => ({
    id: id(field),
    name: field,
    "aria-invalid": Boolean(error(field)),
    "aria-describedby": `${id(field)}-hint`,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
      {service ? <input type="hidden" name="id" value={service.id} /> : null}
      <Field label="Nombre del servicio" htmlFor={id("title")} error={error("title")}>
        <Input {...control("title")} defaultValue={service?.title} required />
      </Field>
      <Field label="Resumen" htmlFor={id("summary")} hint="Una línea que se lee de un vistazo." error={error("summary")}>
        <Input {...control("summary")} defaultValue={service?.summary} required />
      </Field>
      <Field label="Descripción" htmlFor={id("description")} optional error={error("description")}>
        <Textarea {...control("description")} rows={4} defaultValue={service?.description} />
      </Field>
      <Field
        label="Qué incluye"
        htmlFor={id("features")}
        optional
        hint="Una característica por renglón."
        error={error("features")}
      >
        <Textarea {...control("features")} rows={4} defaultValue={service?.features.join("\n")} />
      </Field>
      <Field
        label="Precio desde (MXN)"
        htmlFor={id("priceFrom")}
        optional
        hint="Déjalo vacío para no mostrar precio."
        error={error("priceFrom")}
      >
        <Input {...control("priceFrom")} inputMode="numeric" defaultValue={service?.priceFrom ?? ""} />
      </Field>

      <fieldset className="flex flex-col gap-3 rounded-[1rem] border border-line p-4">
        <legend className="px-1 text-[0.875rem] font-semibold text-ink-soft">Imagen (opcional)</legend>
        {service?.image ? (
          <div className="flex items-center gap-3">
            <Image
              src={service.image.url}
              alt={service.image.alt}
              width={96}
              height={72}
              className="h-18 w-24 rounded-lg object-cover"
            />
            <label className="flex min-h-11 items-center gap-3 text-[0.9rem] font-semibold text-ink-soft">
              <Checkbox name="removeImage" />
              Quitar imagen
            </label>
          </div>
        ) : null}
        <Field
          label={service?.image ? "Reemplazar imagen" : "Subir imagen"}
          htmlFor={id("image")}
          hint="JPG, PNG, WebP, AVIF o HEIC. Máximo 12 MB."
          error={error("image")}
        >
          <input
            {...control("image")}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            className="min-h-11 w-full cursor-pointer rounded-[0.875rem] border border-dashed border-line bg-surface px-3 py-2 text-[0.9rem] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-sand file:px-3 file:py-1.5 file:font-semibold file:text-ink"
          />
        </Field>
        <Field
          label="Descripción de la imagen"
          htmlFor={id("imageAlt")}
          optional
          hint="Qué se ve en la imagen. Si la dejas vacía usamos el nombre del servicio."
          error={error("imageAlt")}
        >
          <Input {...control("imageAlt")} defaultValue={service?.image?.alt} />
        </Field>
      </fieldset>

      <label className="flex min-h-11 items-center gap-3 font-semibold text-ink-soft">
        <Checkbox name="visible" defaultChecked={service?.visible ?? true} />
        Visible en el sitio
      </label>
      <FormNotice state={state} />
      <SubmitButton pending={pending} className="self-start">
        {service ? "Guardar cambios" : "Agregar servicio"}
      </SubmitButton>
    </form>
  );
}
