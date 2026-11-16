"use client";

import { login } from "@/app/actions/admin/auth";
import { FormNotice, SubmitButton, useAdminForm } from "./form-controls";
import { Field, Input } from "./ui";

export function LoginForm() {
  const { state, pending, onSubmit, error } = useAdminForm(login);
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <FormNotice state={state} />
      <Field label="Correo" htmlFor="email" error={error("email")}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          aria-invalid={Boolean(error("email"))}
          aria-describedby="email-hint"
        />
      </Field>
      <Field label="Contraseña" htmlFor="password" error={error("password")}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(error("password"))}
          aria-describedby="password-hint"
        />
      </Field>
      <SubmitButton pending={pending} pendingLabel="Entrando…" className="mt-2 w-full">
        Entrar
      </SubmitButton>
    </form>
  );
}
