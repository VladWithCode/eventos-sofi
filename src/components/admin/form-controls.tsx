"use client";

import { Trash2 } from "lucide-react";
import { startTransition, useActionState, useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/types";
import { Button, Notice } from "./ui";

const IDLE: FormState = { status: "idle" };

/**
 * `useActionState` wired through onSubmit instead of `<form action>`, so React
 * does not reset the fields when the server returns validation errors.
 */
export function useAdminForm(
  action: (prev: FormState, formData: FormData) => Promise<FormState>,
  { resetOnSuccess = false } = {},
) {
  const [state, dispatch, pending] = useActionState(action, IDLE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state.status === "success") formRef.current?.reset();
  }, [state, resetOnSuccess]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return { state, pending, onSubmit, formRef, error: (field: string) => state.fieldErrors?.[field] };
}

/** Submit button with a pending state. Pass `pending` when the form is not using `action={…}`. */
export function SubmitButton({
  children,
  pendingLabel = "Guardando…",
  pending,
  variant = "primary",
  size = "md",
  className,
  name,
  value,
  ariaLabel,
}: {
  children: ReactNode;
  pendingLabel?: string;
  pending?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm";
  className?: string;
  name?: string;
  value?: string;
  ariaLabel?: string;
}) {
  const status = useFormStatus();
  const busy = pending ?? status.pending;
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      name={name}
      value={value}
      disabled={busy}
      aria-disabled={busy}
      aria-label={ariaLabel}
    >
      {busy ? pendingLabel : children}
    </Button>
  );
}

export function FormNotice({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) return null;
  return <Notice tone={state.status === "success" ? "ok" : "danger"}>{state.message}</Notice>;
}

/** A delete button that asks for confirmation in a native `<dialog>`. */
export function ConfirmDelete({
  action,
  id,
  title,
  description,
  label = "Eliminar",
  compact = false,
}: {
  action: (formData: FormData) => Promise<void>;
  id: number;
  title: string;
  description: string;
  label?: string;
  compact?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Button
        variant="ghost"
        size={compact ? "sm" : "md"}
        className="min-h-11 text-danger hover:bg-danger-wash"
        onClick={() => dialogRef.current?.showModal()}
      >
        <Trash2 aria-hidden className="size-4" />
        {label}
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`confirm-${id}-title`}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-[1.25rem] border border-line bg-surface p-0 text-ink shadow-lift backdrop:bg-night/50"
        onClick={(event) => {
          // A click on the backdrop lands on the dialog element itself.
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <form action={action} className="flex flex-col gap-4 p-6">
          <input type="hidden" name="id" value={id} />
          <h2 id={`confirm-${id}-title`} className="font-display text-2xl font-semibold">
            {title}
          </h2>
          <p className="text-[0.95rem] text-muted">{description}</p>
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => dialogRef.current?.close()}>
              Cancelar
            </Button>
            <SubmitButton variant="danger" pendingLabel="Eliminando…">
              Sí, eliminar
            </SubmitButton>
          </div>
        </form>
      </dialog>
    </>
  );
}
