import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Booking } from "@/lib/data/bookings";
import { formatEventDate, formatTimestamp } from "@/lib/dates";
import { eventTypeLabel } from "@/lib/event-types";
import { BOOKING_STATUS } from "@/lib/statuses";
import { Badge } from "./ui";

function StatusBadge({ booking }: { booking: Booking }) {
  const meta = BOOKING_STATUS[booking.status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

/** Cards on mobile, a table from md up. */
export function BookingList({ bookings }: { bookings: Booking[] }) {
  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {bookings.map((b) => (
          <li key={b.id}>
            <Link
              href={`/admin/reservas/${b.id}`}
              className="flex items-center gap-3 rounded-[1.25rem] border border-line bg-surface p-4 shadow-soft transition-colors hover:border-ink/25"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold">{b.name}</p>
                  <StatusBadge booking={b} />
                </div>
                <p className="mt-1 text-[0.9rem] text-ink-soft">
                  {eventTypeLabel(b.eventType)} · {formatEventDate(b.eventDate)} · {b.guests} invitados
                </p>
                <p className="mt-0.5 text-[0.8rem] text-muted">Recibida {formatTimestamp(b.createdAt)}</p>
              </div>
              <ChevronRight aria-hidden className="size-5 shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-[1.25rem] border border-line bg-surface shadow-soft md:block">
        <table className="w-full text-left text-[0.92rem]">
          <thead className="border-b border-line bg-sand/50 text-[0.75rem] tracking-[0.12em] text-muted uppercase">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Nombre</th>
              <th scope="col" className="px-4 py-3 font-semibold">Evento</th>
              <th scope="col" className="px-4 py-3 font-semibold">Fecha</th>
              <th scope="col" className="px-4 py-3 font-semibold">Invitados</th>
              <th scope="col" className="px-4 py-3 font-semibold">Estado</th>
              <th scope="col" className="px-4 py-3 font-semibold">Recibida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {bookings.map((b) => (
              <tr key={b.id} className="transition-colors hover:bg-sand/40">
                <td className="px-4 py-3 font-semibold">
                  <Link href={`/admin/reservas/${b.id}`} className="rounded hover:underline">
                    {b.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{eventTypeLabel(b.eventType)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatEventDate(b.eventDate)}</td>
                <td className="px-4 py-3">{b.guests}</td>
                <td className="px-4 py-3">
                  <StatusBadge booking={b} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">{formatTimestamp(b.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
