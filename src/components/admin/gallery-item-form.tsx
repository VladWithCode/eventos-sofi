"use client";

import { saveGalleryItem } from "@/app/actions/admin/gallery";
import { EVENT_TYPES } from "@/lib/event-types";
import type { GalleryItem } from "@/lib/types";
import { FormNotice, SubmitButton, useAdminForm } from "./form-controls";
import { Checkbox, Field, Input, Select } from "./ui";

export function GalleryItemForm({ item }: { item: GalleryItem }) {
  const { state, pending, onSubmit, error } = useAdminForm(saveGalleryItem);
  const id = (field: string) => `gallery-${item.id}-${field}`;
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={item.id} />
      <Field
        label="Descripción de la foto"
        htmlFor={id("alt")}
        hint="Qué se ve en la foto. La leen Google y los lectores de pantalla."
        error={error("alt")}
      >
        <Input
          id={id("alt")}
          name="alt"
          defaultValue={item.image.alt}
          aria-invalid={Boolean(error("alt"))}
          aria-describedby={`${id("alt")}-hint`}
        />
      </Field>
      <Field label="Pie de foto" htmlFor={id("caption")} optional error={error("caption")}>
        <Input
          id={id("caption")}
          name="caption"
          defaultValue={item.caption}
          aria-invalid={Boolean(error("caption"))}
          aria-describedby={`${id("caption")}-hint`}
        />
      </Field>
      <Field label="Tipo de evento" htmlFor={id("eventType")} error={error("eventType")}>
        <Select id={id("eventType")} name="eventType" defaultValue={item.eventType}>
          {EVENT_TYPES.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.label}
            </option>
          ))}
        </Select>
      </Field>
      <label className="flex min-h-11 items-center gap-3 font-semibold text-ink-soft">
        <Checkbox name="featured" defaultChecked={item.featured} />
        Destacada (aparece en la portada)
      </label>
      <label className="flex min-h-11 items-center gap-3 font-semibold text-ink-soft">
        <Checkbox name="visible" defaultChecked={item.visible} />
        Visible en el sitio
      </label>
      <FormNotice state={state} />
      <SubmitButton pending={pending} size="sm" className="min-h-11 self-start">
        Guardar
      </SubmitButton>
    </form>
  );
}
