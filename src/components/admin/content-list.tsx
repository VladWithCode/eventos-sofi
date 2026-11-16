import type { ReactNode } from "react";
import { Badge, Card } from "./ui";

/**
 * One row of an ordered content list (services, testimonials, FAQs): a
 * summary line with ordering controls and a collapsible edit area.
 */
export function ContentItem({
  title,
  subtitle,
  visible,
  controls,
  children,
}: {
  title: string;
  subtitle?: string;
  visible: boolean;
  controls: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card padded={false}>
      <div className="flex items-start gap-3 px-5 pt-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{title}</p>
            {visible ? null : <Badge>Oculto</Badge>}
          </div>
          {subtitle ? <p className="mt-0.5 line-clamp-2 text-[0.9rem] text-muted">{subtitle}</p> : null}
        </div>
        {controls}
      </div>
      <details className="px-5 pb-4">
        <summary className="flex min-h-11 items-center text-[0.9rem] font-semibold text-blue-deep">Editar</summary>
        <div className="flex flex-col gap-4 pt-2">{children}</div>
      </details>
    </Card>
  );
}

/** Collapsible "add new" card shown above a content list. */
export function NewItemCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="rounded-[1.25rem] border border-dashed border-line bg-surface/60 px-5 py-3 open:bg-surface open:shadow-soft">
      <summary className="flex min-h-11 items-center font-semibold text-blue-deep">{label}</summary>
      <div className="pt-3 pb-2">{children}</div>
    </details>
  );
}
