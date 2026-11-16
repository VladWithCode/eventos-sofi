import "server-only";
import { db, nowIso, type Row } from "@/lib/db";
import type { MediaImage, Service } from "@/lib/types";
import { bool, imageFromRow, imageParams, nextPosition, nullableNum, num, str } from "./rows";

function toService(row: Row): Service {
  let features: string[] = [];
  try {
    const parsed: unknown = JSON.parse(str(row.features));
    if (Array.isArray(parsed)) features = parsed.map(String);
  } catch {
    features = [];
  }
  return {
    id: num(row.id),
    title: str(row.title),
    summary: str(row.summary),
    description: str(row.description),
    features,
    image: imageFromRow(row),
    priceFrom: nullableNum(row.price_from),
    position: num(row.position),
    visible: bool(row.visible),
  };
}

export function listServices({ onlyVisible }: { onlyVisible: boolean }): Service[] {
  const where = onlyVisible ? "WHERE visible = 1" : "";
  return db().prepare(`SELECT * FROM services ${where} ORDER BY position, id`).all().map(toService);
}

export function findService(id: number): Service | null {
  const row = db().prepare("SELECT * FROM services WHERE id = ?").get(id);
  return row ? toService(row) : null;
}

export type ServiceInput = Omit<Service, "id" | "position">;

function params(input: ServiceInput) {
  return {
    title: input.title,
    summary: input.summary,
    description: input.description,
    features: JSON.stringify(input.features),
    price_from: input.priceFrom,
    visible: input.visible ? 1 : 0,
    ...imageParams(input.image),
  };
}

export function createService(input: ServiceInput): number {
  const now = nowIso();
  const result = db()
    .prepare(
      `INSERT INTO services (title, summary, description, features, price_from, visible,
         image_url, image_width, image_height, image_blur, image_alt, position, created_at, updated_at)
       VALUES (:title, :summary, :description, :features, :price_from, :visible,
         :image_url, :image_width, :image_height, :image_blur, :image_alt, :position, :now, :now)`,
    )
    .run({ ...params(input), position: nextPosition("services"), now });
  return Number(result.lastInsertRowid);
}

export function updateService(id: number, input: ServiceInput) {
  db()
    .prepare(
      `UPDATE services SET title = :title, summary = :summary, description = :description, features = :features,
         price_from = :price_from, visible = :visible, image_url = :image_url, image_width = :image_width,
         image_height = :image_height, image_blur = :image_blur, image_alt = :image_alt, updated_at = :now
       WHERE id = :id`,
    )
    .run({ ...params(input), id, now: nowIso() });
}

/** Returns the removed image so the caller can delete its file. */
export function deleteService(id: number): MediaImage | null {
  const existing = findService(id);
  db().prepare("DELETE FROM services WHERE id = ?").run(id);
  return existing?.image ?? null;
}
