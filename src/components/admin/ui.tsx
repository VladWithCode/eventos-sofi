import type { ComponentProps, ReactNode } from "react";

/**
 * Admin building blocks. Calm surfaces, generous touch targets (the owner
 * works mostly from a phone), same tokens as the public site.
 */

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ---------------------------------------------------------------- Layout */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div className="min-w-0">
        <h1 className="font-display text-[2rem] leading-none font-semibold tracking-[-0.02em] md:text-[2.5rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-prose text-[0.95rem] text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Card({
  className,
  padded = true,
  ...props
}: ComponentProps<"div"> & { padded?: boolean }) {
  return (
    <div
      className={cx(
        "rounded-[1.25rem] border border-line bg-surface shadow-soft",
        padded && "p-5 md:p-6",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cx("text-[0.8rem] font-semibold tracking-[0.14em] text-muted uppercase", className)}
      {...props}
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[1.25rem] border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
      {icon ? (
        <div className="mb-4 grid size-12 place-items-center rounded-full bg-gold-wash text-gold-deep">
          {icon}
        </div>
      ) : null}
      <p className="font-display text-2xl font-semibold">{title}</p>
      {description ? <p className="mt-1.5 max-w-sm text-[0.95rem] text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* --------------------------------------------------------------- Buttons */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

const buttonBase =
  "inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap " +
  "transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-out " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-paper hover:bg-night-soft",
  secondary: "border border-line bg-surface text-ink hover:border-ink/30 hover:bg-sand/60",
  ghost: "text-ink-soft hover:bg-sand",
  danger: "bg-danger text-white hover:bg-danger/90",
};

const buttonSizes: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 text-[0.95rem]",
  sm: "min-h-9 px-3.5 text-[0.85rem]",
};

/** Class string for elements that must look like a button (`<Link>`, `<a>`). */
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cx(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

/* ----------------------------------------------------------------- Forms */

const controlClass =
  "w-full rounded-[0.875rem] border border-line bg-surface px-3.5 text-base text-ink placeholder:text-muted/70 " +
  "transition-[border-color,box-shadow] duration-150 " +
  "hover:border-ink/25 focus:border-blue-deep focus:outline-none focus:ring-4 focus:ring-blue/25 " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/15 disabled:bg-sand/60";

/**
 * Label + control + hint/error. Pass the control as children and give it the
 * same `id` as `htmlFor`; point its `aria-describedby` at `${htmlFor}-hint`.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[0.875rem] font-semibold text-ink-soft">
        {label}
        {optional ? <span className="ml-1.5 font-normal text-muted">(opcional)</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-hint`} role="alert" className="text-[0.85rem] font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-[0.85rem] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cx(controlClass, "min-h-11", className)} {...props} />;
}

export function Textarea({ className, rows = 4, ...props }: ComponentProps<"textarea">) {
  return <textarea rows={rows} className={cx(controlClass, "py-2.5 leading-normal", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cx(controlClass, "min-h-11 pr-9", className)} {...props} />;
}

export function Checkbox({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  return <input type="checkbox" className={cx("size-5 shrink-0 rounded-md accent-blue-deep", className)} {...props} />;
}

/* ---------------------------------------------------------------- Status */

export type Tone = "neutral" | "info" | "warn" | "ok" | "danger" | "gold";

const toneClass: Record<Tone, string> = {
  neutral: "bg-sand text-ink-soft",
  info: "bg-info-wash text-info",
  warn: "bg-warn-wash text-warn",
  ok: "bg-ok-wash text-ok",
  danger: "bg-danger-wash text-danger",
  gold: "bg-gold-wash text-gold-deep",
};

const dotClass: Record<Tone, string> = {
  neutral: "bg-ink-soft",
  info: "bg-info",
  warn: "bg-warn",
  ok: "bg-ok",
  danger: "bg-danger",
  gold: "bg-gold-deep",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.75rem] leading-none font-semibold whitespace-nowrap",
        toneClass[tone],
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

/** Big number tile for the overview page. */
export function Stat({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  detail?: string;
  tone?: Tone;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <CardTitle>{label}</CardTitle>
        <span aria-hidden className={cx("size-2 rounded-full", dotClass[tone])} />
      </div>
      <p className="font-display text-5xl leading-none font-semibold tracking-[-0.02em] lining-nums tabular-nums">{value}</p>
      {detail ? <p className="text-[0.85rem] text-muted">{detail}</p> : null}
    </Card>
  );
}

/** Inline notice for form results and page-level messages. */
export function Notice({ tone = "info", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div role="status" className={cx("rounded-[0.875rem] px-4 py-3 text-[0.9rem] font-medium", toneClass[tone])}>
      {children}
    </div>
  );
}
