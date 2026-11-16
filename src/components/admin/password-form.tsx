"use client";

import { changePassword } from "@/app/actions/admin/auth";
import { FormNotice, SubmitButton, useAdminForm } from "./form-controls";
import { Field, Input } from "./ui";

export function PasswordForm() {
  const { state, pending, onSubmit, formRef, error } = useAdminForm(changePassword, { resetOnSuccess: true });
  const field = (name: "current" | "next" | "confirm", label: string, autoComplete: string, hint?: string) => (
    <Field label={label} htmlFor={`password-${name}`} hint={hint} error={error(name)}>
      <Input
        id={`password-${name}`}
        name={name}
        type="password"
        autoComplete={autoComplete}
        required
        aria-invalid={Boolean(error(name))}
        aria-describedby={`password-${name}-hint`}
      />
    </Field>
  );

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Lets password managers associate the new password with the account. */}
      <input type="text" name="username" autoComplete="username" hidden readOnly />
      {field("current", "Contraseña actual", "current-password")}
      {field("next", "Nueva contraseña", "new-password", "Mínimo 10 caracteres.")}
      {field("confirm", "Repite la nueva contraseña", "new-password")}
      <FormNotice state={state} />
      <SubmitButton pending={pending} variant="secondary" className="self-start">
        Cambiar contraseña
      </SubmitButton>
    </form>
  );
}
