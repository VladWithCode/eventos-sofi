import "server-only";
import { db, nowIso, type Row } from "@/lib/db";
import { attributionColumns, attributionFromRow, type Attribution } from "./attribution";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/statuses";
import { nullableNum, num, str } from "./rows";

export type Booking = {
  id: number;
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  guests: string;
  location: string;
  message: string;
  status: BookingStatus;
  notes: string;
  quoteAmount: number | null;
  attribution: Attribution;
  createdAt: string;
  updatedAt: string;
};

function toBooking(row: Row): Booking {
  return {
    id: num(row.id),
    name: str(row.name),
    phone: str(row.phone),
    email: str(row.email),
    eventType: str(row.event_type),
    eventDate: str(row.event_date),
    guests: str(row.guests),
    location: str(row.location),
    message: str(row.message),
    status: str(row.status) as BookingStatus,
    notes: str(row.notes),
    quoteAmount: nullableNum(row.quote_amount),
    attribution: attributionFromRow(row),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function insertBooking(input: {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  guests: string;
  location: string;
  message: string;
  metaEventId: string;
  attribution: Attribution;
}): number {
  const now = nowIso();
  const result = db()
    .prepare(
      `INSERT INTO bookings (name, phone, email, event_type, event_date, guests, location, message, meta_event_id,
         utm_source, utm_medium, utm_campaign, utm_content, utm_term, placement, fbclid, landing_url, referrer,
         created_at, updated_at)
       VALUES (:name, :phone, :email, :event_type, :event_date, :guests, :location, :message, :meta_event_id,
         :utm_source, :utm_medium, :utm_campaign, :utm_content, :utm_term, :placement, :fbclid, :landing_url, :referrer,
         :now, :now)`,
    )
    .run({
      name: input.name,
      phone: input.phone,
      email: input.email,
      event_type: input.eventType,
      event_date: input.eventDate,
      guests: input.guests,
      location: input.location,
      message: input.message,
      meta_event_id: input.metaEventId,
      ...attributionColumns(input.attribution),
      now,
    });
  return Number(result.lastInsertRowid);
}

export function listBookings({ status, query }: { status?: BookingStatus; query?: string }): Booking[] {
  const clauses: string[] = [];
  const params: Record<string, string> = {};
  if (status) {
    clauses.push("status = :status");
    params.status = status;
  }
  const q = query?.trim();
  if (q) {
    const digits = q.replace(/\D/g, "");
    // Escape LIKE wildcards so a search for "50%" is literal.
    const like = (v: string) => `%${v.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    clauses.push(digits.length >= 3 ? "(name LIKE :q ESCAPE '\\' OR phone LIKE :d ESCAPE '\\')" : "name LIKE :q ESCAPE '\\'");
    params.q = like(q);
    if (digits.length >= 3) params.d = like(digits);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return db()
    .prepare(`SELECT * FROM bookings ${where} ORDER BY created_at DESC, id DESC LIMIT 500`)
    .all(params)
    .map(toBooking);
}

export function countBookingsByStatus(): Record<BookingStatus, number> {
  const counts = Object.fromEntries(BOOKING_STATUSES.map((s) => [s, 0])) as Record<BookingStatus, number>;
  for (const row of db().prepare("SELECT status, COUNT(*) AS n FROM bookings GROUP BY status").all()) {
    counts[str(row.status) as BookingStatus] = num(row.n);
  }
  return counts;
}

export function latestBookings(limit: number): Booking[] {
  return db().prepare("SELECT * FROM bookings ORDER BY created_at DESC, id DESC LIMIT ?").all(limit).map(toBooking);
}

/** Confirmed bookings with an event date in [from, to] (YYYY-MM-DD, inclusive). */
export function confirmedBetween(from: string, to: string): Booking[] {
  return db()
    .prepare(
      "SELECT * FROM bookings WHERE status = 'confirmada' AND event_date BETWEEN ? AND ? ORDER BY event_date, id",
    )
    .all(from, to)
    .map(toBooking);
}

export function findBooking(id: number): Booking | null {
  const row = db().prepare("SELECT * FROM bookings WHERE id = ?").get(id);
  return row ? toBooking(row) : null;
}

export function confirmedOnSameDate(booking: Booking): Booking[] {
  return db()
    .prepare("SELECT * FROM bookings WHERE status = 'confirmada' AND event_date = ? AND id != ? ORDER BY id")
    .all(booking.eventDate, booking.id)
    .map(toBooking);
}

export function updateBooking(id: number, input: { status: BookingStatus; notes: string; quoteAmount: number | null }) {
  db()
    .prepare("UPDATE bookings SET status = ?, notes = ?, quote_amount = ?, updated_at = ? WHERE id = ?")
    .run(input.status, input.notes, input.quoteAmount, nowIso(), id);
}

export function deleteBooking(id: number) {
  db().prepare("DELETE FROM bookings WHERE id = ?").run(id);
}
