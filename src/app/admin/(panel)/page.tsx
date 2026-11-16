import { CalendarCheck, Inbox } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { BookingList } from "@/components/admin/booking-list";
import { PageSkeleton } from "@/components/admin/skeleton";
import { Card, CardTitle, EmptyState, Stat, buttonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/dal";
import { confirmedBetween, countBookingsByStatus, latestBookings } from "@/lib/data/bookings";
import { countContactsByStatus } from "@/lib/data/contacts";
import { countGallery } from "@/lib/data/gallery";
import { TIME_ZONE, addDays, formatEventDate, todayInMexico } from "@/lib/dates";
import { eventTypeLabel } from "@/lib/event-types";

export default function OverviewPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Overview />
    </Suspense>
  );
}

function greeting(now: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: TIME_ZONE }).format(now));
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

async function Overview() {
  await requireAdmin();
  const today = todayInMexico();
  const upcoming = confirmedBetween(today, addDays(today, 30));
  const latest = latestBookings(5);
  const bookingCounts = countBookingsByStatus();
  const unread = countContactsByStatus().nuevo;

  return (
    <>
      <header className="mb-6 md:mb-8">
        <p className="eyebrow text-gold-deep">{greeting(new Date())}</p>
        <h1 className="mt-2 font-display text-[2rem] leading-none font-semibold tracking-[-0.02em] md:text-[2.5rem]">
          Tu resumen de hoy
        </h1>
      </header>

      <section aria-label="Resumen" className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <Link href="/admin/reservas?estado=nueva" className="rounded-[1.25rem]">
          <Stat label="Reservas nuevas" value={bookingCounts.nueva} tone="gold" detail="Por contactar" />
        </Link>
        <Stat label="Confirmados" value={upcoming.length} tone="ok" detail="Próximos 30 días" />
        <Link href="/admin/mensajes?estado=nuevo" className="rounded-[1.25rem]">
          <Stat label="Mensajes" value={unread} tone="info" detail="Sin responder" />
        </Link>
        <Link href="/admin/galeria" className="rounded-[1.25rem]">
          <Stat label="Galería" value={countGallery()} detail="Fotos publicadas o en borrador" />
        </Link>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section aria-labelledby="upcoming-title">
          <CardTitle id="upcoming-title" className="mb-3">
            Próximos eventos
          </CardTitle>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck aria-hidden className="size-5" />}
              title="Sin eventos confirmados"
              description="Los eventos confirmados de los próximos 30 días aparecerán aquí."
            />
          ) : (
            <Card padded={false}>
              <ul className="divide-y divide-line">
                {upcoming.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/admin/reservas/${b.id}`}
                      className="flex min-h-14 items-center gap-4 px-5 py-3 transition-colors hover:bg-sand/40"
                    >
                      <span className="w-24 shrink-0 text-[0.85rem] font-semibold text-ok">{formatEventDate(b.eventDate)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{b.name}</span>
                        <span className="block text-[0.85rem] text-muted">
                          {eventTypeLabel(b.eventType)} · {b.guests} invitados
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>

        <section aria-labelledby="latest-title">
          <div className="mb-3 flex items-center justify-between gap-3">
            <CardTitle id="latest-title">Últimas solicitudes</CardTitle>
            <Link href="/admin/reservas" className={buttonClass("ghost", "sm")}>
              Ver todas
            </Link>
          </div>
          {latest.length === 0 ? (
            <EmptyState
              icon={<Inbox aria-hidden className="size-5" />}
              title="Aún no hay solicitudes"
              description="Cuando alguien llene el formulario de reserva del sitio, la verás aquí."
            />
          ) : (
            <BookingList bookings={latest} />
          )}
        </section>
      </div>
    </>
  );
}
