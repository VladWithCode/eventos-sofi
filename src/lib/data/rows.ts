import "server-only";
import { db, transaction, type Row } from "@/lib/db";
import type { MediaImage } from "@/lib/types";

export const str = (v: unknown): string => (typeof v === "string" ? v : v == null ? "" : String(v));
export const num = (v: unknown): number => Number(v ?? 0);
export const bool = (v: unknown): boolean => Number(v) === 1;
export const nullableNum = (v: unknown): number | null => (v == null ? null : Number(v));

/** Reads the shared image_* columns. */
export function imageFromRow(row: Row): MediaImage | null {
  if (!row.image_url) return null;
  return {
    url: str(row.image_url),
    width: num(row.image_width),
    height: num(row.image_height),
    blurDataUrl: str(row.image_blur),
    alt: str(row.image_alt),
  };
}

export function imageParams(image: MediaImage | null) {
  return {
    image_url: image?.url ?? null,
    image_width: image?.width ?? null,
    image_height: image?.height ?? null,
    image_blur: image?.blurDataUrl ?? null,
    image_alt: image?.alt ?? null,
  };
}

/** Tables with a manual `position` order. Names are a fixed whitelist, never user input. */
export type OrderedTable = "services" | "gallery_items" | "testimonials" | "faqs";

export function nextPosition(table: OrderedTable): number {
  return num(db().prepare(`SELECT COALESCE(MAX(position), 0) + 1 AS p FROM ${table}`).get()?.p);
}

/** Swaps the row with its neighbour above or below. */
export function moveRow(table: OrderedTable, id: number, direction: "up" | "down") {
  transaction(() => {
    const conn = db();
    const current = conn.prepare(`SELECT id, position FROM ${table} WHERE id = ?`).get(id);
    if (!current) return;
    const neighbour =
      direction === "up"
        ? conn
            .prepare(`SELECT id, position FROM ${table} WHERE position < ? ORDER BY position DESC, id DESC LIMIT 1`)
            .get(current.position)
        : conn
            .prepare(`SELECT id, position FROM ${table} WHERE position > ? ORDER BY position ASC, id ASC LIMIT 1`)
            .get(current.position);
    if (!neighbour) return;
    const update = conn.prepare(`UPDATE ${table} SET position = ? WHERE id = ?`);
    update.run(neighbour.position, current.id);
    update.run(current.position, neighbour.id);
  });
}
