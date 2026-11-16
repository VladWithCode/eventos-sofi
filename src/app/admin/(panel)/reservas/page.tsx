import { Inbox, Search } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingList } from "@/components/admin/booking-list";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { PageSkeleton } from "@/components/admin/skeleton";
import { Button, EmptyState, Input, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/dal";
import { countBookingsByStatus, listBookings } from "@/lib/data/bookings";
import { BOOKING_STATUS, BOOKING_STATUSES, isBookingStatus } from "@/lib/statuses";

export const metadata: Metadata = { title: "Reservas" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function BookingsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHeader title="Reservas" description="Solicitudes que llegan desde el formulario del sitio." />
      <Suspense fallback={<PageSkeleton />}>
        <Bookings searchParams={searchParams} />
      </Suspense>
    </>
  );
}

function hrefFor(status: string | undefined, q: string) {
  const params = new URLSearchParams();
  if (status) params.set("estado", status);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/admin/reservas?${query}` : "/admin/reservas";
}

async function Bookings({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const status = isBookingStatus(params.estado) ? params.estado : undefined;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";

  const counts = countBookingsByStatus();
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const bookings = listBookings({ status, query: q });

  return (
    <div className="flex flex-col gap-5">
      <FilterTabs
        label="Filtrar por estado"
        tabs={[
          { href: hrefFor(undefined, q), label: "Todas", count: total, active: !status },
          ...BOOKING_STATUSES.map((s) => ({
            href: hrefFor(s, q),
            label: BOOKING_STATUS[s].label,
            count: counts[s],
            active: status === s,
          })),
        ]}
      />

      <form role="search" action="/admin/reservas" className="flex gap-2">
        {status ? <input type="hidden" name="estado" value={status} /> : null}
        <label htmlFor="q" className="sr-only">
          Buscar por nombre o teléfono
        </label>
        <Input id="q" name="q" type="search" defaultValue={q} placeholder="Buscar por nombre o teléfono" className="flex-1" />
        <Button type="submit" variant="secondary" aria-label="Buscar">
          <Search aria-hidden className="size-4" />
          <span className="hidden sm:inline">Buscar</span>
        </Button>
      </form>

      {bookings.length === 0 ? (
        <EmptyState
          icon={<Inbox aria-hidden className="size-5" />}
          title={q || status ? "Sin resultados" : "Aún no hay reservas"}
          description={
            q || status
              ? "Prueba con otro filtro o búsqueda."
              : "Cuando alguien llene el formulario de reserva del sitio, aparecerá aquí."
          }
        />
      ) : (
        <BookingList bookings={bookings} />
      )}
    </div>
  );
}
