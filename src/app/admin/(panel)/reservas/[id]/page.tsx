import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { removeBooking } from "@/app/actions/admin/bookings";
import { BookingForm } from "@/components/admin/booking-form";
import { ConfirmDelete } from "@/components/admin/form-controls";
import { PageSkeleton } from "@/components/admin/skeleton";
import { Badge, Card, CardTitle, Notice, buttonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/dal";
import type { Attribution } from "@/lib/data/attribution";
import { confirmedOnSameDate, findBooking } from "@/lib/data/bookings";
import { readSettings } from "@/lib/data/settings";
import { formatEventDate, formatMoney, formatTimestamp } from "@/lib/dates";
import { eventTypeLabel } from "@/lib/event-types";
import { formatMxPhone, whatsappLink } from "@/lib/phone";
import { BOOKING_STATUS } from "@/lib/statuses";

export const metadata: Metadata = { title: "Reserva" };

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <Link href="/admin/reservas" className={buttonClass("ghost", "sm", "-ml-3 mb-4")}>
        <ArrowLeft aria-hidden className="size-4" />
        Reservas
      </Link>
      <Suspense fallback={<PageSkeleton rows={3} />}>
        <BookingDetail params={params} />
      </Suspense>
    </>
  );
}

async function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const booking = /^\d{1,12}$/.test(id) ? findBooking(Number(id)) : null;
  if (!booking) notFound();

  const clashes = confirmedOnSameDate(booking);
  const { businessName } = readSettings();
  const eventLabel = eventTypeLabel(booking.eventType).toLowerCase();
  const firstName = booking.name.split(" ")[0];
  const greeting = `¡Hola ${firstName}! Te saluda ${businessName}. Recibimos tu solicitud para tu evento (${eventLabel}) del ${formatEventDate(booking.eventDate)}. ¿Te parece si platicamos los detalles?`;
  const status = BOOKING_STATUS[booking.status];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[2rem] leading-none font-semibold tracking-[-0.02em] md:text-[2.5rem]">
            {booking.name}
          </h1>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <p className="text-muted">
          {eventTypeLabel(booking.eventType)} · {formatEventDate(booking.eventDate)} · {booking.guests} invitados
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={whatsappLink(booking.phone, greeting)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("primary")}
          >
            <MessageCircle aria-hidden className="size-4" />
            Abrir WhatsApp
          </a>
          <a href={`tel:+${booking.phone}`} className={buttonClass("secondary")}>
            <Phone aria-hidden className="size-4" />
            Llamar
          </a>
          {booking.email ? (
            <a href={`mailto:${booking.email}`} className={buttonClass("secondary")}>
              <Mail aria-hidden className="size-4" />
              Correo
            </a>
          ) : null}
        </div>
      </header>

      {clashes.length > 0 ? (
        <Notice tone="warn">
          Ya tienes {clashes.length === 1 ? "otro evento confirmado" : `${clashes.length} eventos confirmados`} para el{" "}
          {formatEventDate(booking.eventDate)}:{" "}
          {clashes.map((c, i) => (
            <span key={c.id}>
              {i > 0 ? ", " : ""}
              <Link href={`/admin/reservas/${c.id}`} className="underline">
                {c.name}
              </Link>
            </span>
          ))}
          .
        </Notice>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardTitle className="mb-4">Solicitud</CardTitle>
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Detail label="Teléfono" value={formatMxPhone(booking.phone)} />
              <Detail label="Correo" value={booking.email || "—"} />
              <Detail label="Tipo de evento" value={eventTypeLabel(booking.eventType)} />
              <Detail label="Fecha del evento" value={formatEventDate(booking.eventDate)} />
              <Detail label="Invitados" value={booking.guests} />
              <Detail label="Lugar" value={booking.location || "—"} />
              <Detail label="Recibida" value={formatTimestamp(booking.createdAt)} />
              <Detail
                label="Cotización"
                value={booking.quoteAmount == null ? "—" : formatMoney(booking.quoteAmount)}
              />
            </dl>
            {booking.message ? (
              <div className="mt-5 border-t border-line pt-5">
                <p className="text-[0.85rem] font-semibold text-muted">Mensaje</p>
                <p className="mt-1 whitespace-pre-line">{booking.message}</p>
              </div>
            ) : null}
          </Card>
          <AttributionCard attribution={booking.attribution} />
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardTitle className="mb-4">Seguimiento</CardTitle>
            <BookingForm
              id={booking.id}
              status={booking.status}
              notes={booking.notes}
              quoteAmount={booking.quoteAmount}
            />
          </Card>
          <div className="flex justify-end">
            <ConfirmDelete
              action={removeBooking}
              id={booking.id}
              title="¿Eliminar esta reserva?"
              description={`Se borrará la solicitud de ${booking.name} de forma permanente. Esta acción no se puede deshacer.`}
              label="Eliminar reserva"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.85rem] font-semibold text-muted">{label}</dt>
      <dd className="mt-0.5 break-words">{value}</dd>
    </div>
  );
}

function AttributionCard({ attribution: a }: { attribution: Attribution }) {
  const rows = [
    ["Campaña", a.utm_campaign],
    ["Anuncio", a.utm_content],
    ["Fuente", a.utm_source],
    ["Medio", a.utm_medium],
    ["Término", a.utm_term],
    ["Ubicación", a.placement],
    ["Llegó desde", a.referrer],
    ["Primera página", a.landingUrl],
  ].filter(([, value]) => value);
  const fromMetaAd = Boolean(a.fbclid);

  return (
    <details className="group rounded-[1.25rem] border border-line bg-surface/60 px-5 py-4">
      <summary className="flex min-h-8 items-center justify-between gap-3 text-[0.9rem] font-semibold text-ink-soft">
        Origen de la solicitud
        <span className="text-[0.8rem] font-normal text-muted">
          {fromMetaAd ? "Anuncio de Meta" : rows.length ? "Ver detalles" : "Directo"}
        </span>
      </summary>
      {rows.length ? (
        <dl className="mt-4 grid gap-3 text-[0.85rem]">
          {rows.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="font-semibold text-muted">{label}</dt>
              <dd className="break-all">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-3 text-[0.85rem] text-muted">Sin datos de campaña: llegó directo o desde un enlace sin etiquetas.</p>
      )}
    </details>
  );
}
