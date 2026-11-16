import type { ComponentProps, ReactNode } from "react";

/* Shared controls for the public forms. Text is 16px+ so iOS never zooms on focus. */

const controlClass =
  "w-full rounded-[0.9rem] border border-line bg-paper/60 px-4 text-[1.0625rem] text-ink placeholder:text-muted/70 " +
  "transition-[border-color,box-shadow,background-color] duration-200 " +
  "hover:border-ink/30 focus:border-ink focus:bg-surface focus:outline-none focus:ring-4 focus:ring-gold/25 " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/15";

type FieldShellProps = {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
};

function FieldShell({ id, label, error, optional, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.9rem] font-semibold text-ink-soft">
        {label}
        {optional ? <span className="ml-1.5 font-normal text-muted">(opcional)</span> : null}
      </label>
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-[0.875rem] font-medium text-danger">
      {message}
    </p>
  );
}

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
};

export function TextField({ id, label, error, optional, className, ...props }: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} optional={optional}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${controlClass} min-h-[3.25rem] ${className ?? ""}`}
        {...props}
      />
    </FieldShell>
  );
}

type TextAreaFieldProps = Omit<ComponentProps<"textarea">, "id"> & {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
};

export function TextAreaField({ id, label, error, optional, className, rows = 3, ...props }: TextAreaFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} optional={optional}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${controlClass} resize-none py-3 leading-normal ${className ?? ""}`}
        {...props}
      />
    </FieldShell>
  );
}

type ChoiceGroupProps<Value extends string> = {
  name: string;
  legend: string;
  options: ReadonlyArray<{ value: Value; label: string }>;
  value: Value | "";
  onChange: (value: Value) => void;
  error?: string;
};

/** Radio group drawn as tappable chips. */
export function ChoiceGroup<Value extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  error,
}: ChoiceGroupProps<Value>) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="text-[0.9rem] font-semibold text-ink-soft">{legend}</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line bg-paper/60 px-4 text-[0.95rem] font-medium text-ink-soft transition-[transform,background-color,color,border-color] duration-150 ease-out select-none hover:border-ink/40 active:scale-[0.96] has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:ring-4 has-focus-visible:ring-gold/35"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
      <div className="mt-1.5">
        <FieldError id={`${name}-error`} message={error} />
      </div>
    </fieldset>
  );
}

type ConsentFieldProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
};

export function ConsentField({ id, checked, onChange, error }: ConsentFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-[0.9rem] leading-snug text-ink-soft">
        <input
          id={id}
          type="checkbox"
          name="consent"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-5 shrink-0 rounded-md accent-ink"
        />
        <span>
          Acepto el{" "}
          <a href="/aviso-de-privacidad" target="_blank" className="font-semibold text-ink underline underline-offset-2">
            aviso de privacidad
          </a>{" "}
          y que me contacten sobre mi evento.
        </span>
      </label>
      <div className="mt-1.5">
        <FieldError id={`${id}-error`} message={error} />
      </div>
    </div>
  );
}

/** Hidden from people, tempting to bots. A filled value marks the submission as spam. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
      <label>
        Sitio web
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

const submitTone = {
  ink: "bg-ink text-paper hover:bg-night-soft",
  gold: "bg-gold text-ink hover:bg-gold-bright",
} as const;

export function SubmitButton({
  pending,
  tone = "ink",
  children,
}: {
  pending: boolean;
  tone?: keyof typeof submitTone;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full px-7 text-[1.0625rem] font-semibold shadow-lift transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:opacity-70 ${submitTone[tone]}`}
    >
      {pending ? (
        <span aria-hidden className="size-5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      ) : null}
      {pending ? "Enviando…" : children}
    </button>
  );
}
