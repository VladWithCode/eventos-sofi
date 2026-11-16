import { ExternalLink, LogOut } from "lucide-react";
import { logout } from "@/app/actions/admin/auth";
import { getAdmin } from "@/lib/auth/session";
import { countBookingsByStatus } from "@/lib/data/bookings";
import { countContactsByStatus } from "@/lib/data/contacts";
import { SubmitButton } from "./form-controls";
import { buttonClass } from "./ui";

export function Wordmark() {
  return (
    <span className="font-display text-[1.75rem] leading-none font-semibold tracking-[-0.02em]">
      Eventos Sofi
      <span className="ml-2 align-middle font-sans text-[0.65rem] font-semibold tracking-[0.2em] text-muted uppercase">
        Panel
      </span>
    </span>
  );
}

/** Signed-in email, "Ver sitio" and logout. Streams in: it reads the session. */
export async function Account() {
  const admin = await getAdmin();
  return (
    <div className="flex flex-col gap-2">
      <a href="/" target="_blank" rel="noopener" className={buttonClass("ghost", "md", "justify-start px-4")}>
        <ExternalLink aria-hidden className="size-4" />
        Ver sitio
      </a>
      {admin ? (
        <>
          <p className="truncate px-4 text-[0.85rem] text-muted" title={admin.email}>
            {admin.email}
          </p>
          <form action={logout}>
            <SubmitButton variant="secondary" pendingLabel="Saliendo…" className="w-full">
              <LogOut aria-hidden className="size-4" />
              Cerrar sesión
            </SubmitButton>
          </form>
        </>
      ) : null}
    </div>
  );
}

function CountBadge({ count, label }: { count: number; label: string }) {
  if (count === 0) return null;
  return (
    <span
      aria-label={`${count} ${label}`}
      className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-deep px-1.5 text-[0.7rem] leading-none font-bold text-white tabular-nums"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export async function NewBookingsBadge() {
  if (!(await getAdmin())) return null;
  return <CountBadge count={countBookingsByStatus().nueva} label="reservas nuevas" />;
}

export async function UnreadMessagesBadge() {
  if (!(await getAdmin())) return null;
  return <CountBadge count={countContactsByStatus().nuevo} label="mensajes sin responder" />;
}
