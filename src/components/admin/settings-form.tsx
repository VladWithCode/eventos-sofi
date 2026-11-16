"use client";

import { saveSettings } from "@/app/actions/admin/settings";
import { formatMxPhone } from "@/lib/phone";
import type { SiteSettings } from "@/lib/types";
import { FormNotice, SubmitButton, useAdminForm } from "./form-controls";
import { Card, CardTitle, Field, Input, Textarea } from "./ui";

type Key = keyof SiteSettings;

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { state, pending, onSubmit, error } = useAdminForm(saveSettings);

  const text = (
    key: Key,
    label: string,
    options: { hint?: string; optional?: boolean; type?: string; inputMode?: "numeric" | "tel" | "email" | "url" } = {},
  ) => (
    <Field label={label} htmlFor={`settings-${key}`} hint={options.hint} optional={options.optional} error={error(key)}>
      <Input
        id={`settings-${key}`}
        name={key}
        type={options.type ?? "text"}
        inputMode={options.inputMode}
        defaultValue={key === "phone" || key === "whatsapp" ? formatMxPhone(settings[key]) : String(settings[key])}
        aria-invalid={Boolean(error(key))}
        aria-describedby={`settings-${key}-hint`}
      />
    </Field>
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <CardTitle>Negocio</CardTitle>
        {text("businessName", "Nombre del negocio")}
        {text("tagline", "Frase principal", { optional: true })}
        <div className="grid gap-4 sm:grid-cols-2">
          {text("yearsExperience", "Años de experiencia", { type: "number", inputMode: "numeric" })}
          {text("eventsCompleted", "Eventos realizados", {
            type: "number",
            inputMode: "numeric",
            hint: "Escribe 0 si prefieres no mostrar este dato.",
          })}
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <CardTitle>Contacto</CardTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {text("phone", "Teléfono para llamadas", {
            type: "tel",
            inputMode: "tel",
            hint: "10 dígitos; agregamos el 52 de México automáticamente.",
          })}
          {text("whatsapp", "WhatsApp", {
            type: "tel",
            inputMode: "tel",
            hint: "10 dígitos del número que recibe los mensajes.",
          })}
        </div>
        <Field
          label="Mensaje inicial de WhatsApp"
          htmlFor="settings-whatsappMessage"
          optional
          hint="Texto que aparece escrito cuando un cliente abre el chat desde el sitio."
          error={error("whatsappMessage")}
        >
          <Textarea
            id="settings-whatsappMessage"
            name="whatsappMessage"
            rows={2}
            defaultValue={settings.whatsappMessage}
            aria-invalid={Boolean(error("whatsappMessage"))}
            aria-describedby="settings-whatsappMessage-hint"
          />
        </Field>
        {text("email", "Correo", { type: "email", inputMode: "email", optional: true })}
      </Card>

      <Card className="flex flex-col gap-4">
        <CardTitle>Ubicación y horario</CardTitle>
        {text("address", "Dirección", { optional: true, hint: "Déjala vacía si no atiendes en un local." })}
        <div className="grid gap-4 sm:grid-cols-2">
          {text("city", "Ciudad", { optional: true })}
          {text("serviceArea", "Zona de servicio", { optional: true })}
        </div>
        {text("hours", "Horario de atención", { optional: true, hint: "Por ejemplo: Lunes a sábado de 10:00 a 19:00." })}
      </Card>

      <Card className="flex flex-col gap-4">
        <CardTitle>Redes sociales</CardTitle>
        {text("instagramUrl", "Instagram", { type: "url", inputMode: "url", optional: true })}
        {text("facebookUrl", "Facebook", { type: "url", inputMode: "url", optional: true })}
        {text("tiktokUrl", "TikTok", { type: "url", inputMode: "url", optional: true })}
      </Card>

      <div className="flex flex-col gap-3">
        <FormNotice state={state} />
        <SubmitButton pending={pending} className="self-start">
          Guardar ajustes
        </SubmitButton>
      </div>
    </form>
  );
}
