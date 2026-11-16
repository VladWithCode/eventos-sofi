import { ArrowDown, ArrowUp } from "lucide-react";
import { SubmitButton } from "./form-controls";

/** Up/down ordering controls for a positioned row. */
export function MoveButtons({
  action,
  id,
  isFirst,
  isLast,
}: {
  action: (formData: FormData) => Promise<void>;
  id: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {isFirst ? null : (
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="direction" value="up" />
          <SubmitButton variant="ghost" size="sm" pendingLabel="…" ariaLabel="Subir" className="min-h-11 min-w-11">
            <ArrowUp aria-hidden className="size-4" />
          </SubmitButton>
        </form>
      )}
      {isLast ? null : (
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="direction" value="down" />
          <SubmitButton variant="ghost" size="sm" pendingLabel="…" ariaLabel="Bajar" className="min-h-11 min-w-11">
            <ArrowDown aria-hidden className="size-4" />
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
