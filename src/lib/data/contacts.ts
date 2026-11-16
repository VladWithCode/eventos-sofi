import "server-only";
import { db, nowIso, type Row } from "@/lib/db";
import { attributionColumns, attributionFromRow, type Attribution } from "./attribution";
import { CONTACT_STATUSES, type ContactStatus } from "@/lib/statuses";
import { num, str } from "./rows";

export type ContactRequest = {
  id: number;
  name: string;
  phone: string;
  message: string;
  status: ContactStatus;
  attribution: Attribution;
  createdAt: string;
};

function toContact(row: Row): ContactRequest {
  return {
    id: num(row.id),
    name: str(row.name),
    phone: str(row.phone),
    message: str(row.message),
    status: str(row.status) as ContactStatus,
    attribution: attributionFromRow(row),
    createdAt: str(row.created_at),
  };
}

export function insertContact(input: {
  name: string;
  phone: string;
  message: string;
  metaEventId: string;
  attribution: Attribution;
}): number {
  const now = nowIso();
  const result = db()
    .prepare(
      `INSERT INTO contact_requests (name, phone, message, meta_event_id,
         utm_source, utm_medium, utm_campaign, utm_content, utm_term, placement, fbclid, landing_url, referrer,
         created_at, updated_at)
       VALUES (:name, :phone, :message, :meta_event_id,
         :utm_source, :utm_medium, :utm_campaign, :utm_content, :utm_term, :placement, :fbclid, :landing_url, :referrer,
         :now, :now)`,
    )
    .run({
      name: input.name,
      phone: input.phone,
      message: input.message,
      meta_event_id: input.metaEventId,
      ...attributionColumns(input.attribution),
      now,
    });
  return Number(result.lastInsertRowid);
}

export function listContacts(status?: ContactStatus): ContactRequest[] {
  const sql = status
    ? "SELECT * FROM contact_requests WHERE status = ? ORDER BY created_at DESC, id DESC LIMIT 500"
    : "SELECT * FROM contact_requests ORDER BY created_at DESC, id DESC LIMIT 500";
  const stmt = db().prepare(sql);
  return (status ? stmt.all(status) : stmt.all()).map(toContact);
}

export function countContactsByStatus(): Record<ContactStatus, number> {
  const counts = Object.fromEntries(CONTACT_STATUSES.map((s) => [s, 0])) as Record<ContactStatus, number>;
  for (const row of db().prepare("SELECT status, COUNT(*) AS n FROM contact_requests GROUP BY status").all()) {
    counts[str(row.status) as ContactStatus] = num(row.n);
  }
  return counts;
}

export function setContactStatus(id: number, status: ContactStatus) {
  db().prepare("UPDATE contact_requests SET status = ?, updated_at = ? WHERE id = ?").run(status, nowIso(), id);
}

export function deleteContact(id: number) {
  db().prepare("DELETE FROM contact_requests WHERE id = ?").run(id);
}
