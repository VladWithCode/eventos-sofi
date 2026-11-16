import "server-only";
import { db, nowIso, type Row } from "@/lib/db";
import { isEventTypeSlug } from "@/lib/event-types";
import type { EventTypeSlug, GalleryItem, MediaImage } from "@/lib/types";
import { bool, imageFromRow, imageParams, nextPosition, num, str } from "./rows";

function toItem(row: Row): GalleryItem {
  const eventType = str(row.event_type);
  return {
    id: num(row.id),
    // image_url is NOT NULL for gallery rows.
    image: imageFromRow(row)!,
    eventType: isEventTypeSlug(eventType) ? eventType : "otro",
    caption: str(row.caption),
    featured: bool(row.featured),
    position: num(row.position),
    visible: bool(row.visible),
  };
}

export function listGallery({ onlyVisible }: { onlyVisible: boolean }): GalleryItem[] {
  const where = onlyVisible ? "WHERE visible = 1" : "";
  return db().prepare(`SELECT * FROM gallery_items ${where} ORDER BY position, id`).all().map(toItem);
}

export function countGallery(): number {
  return num(db().prepare("SELECT COUNT(*) AS n FROM gallery_items").get()?.n);
}

export function createGalleryItem(image: MediaImage, eventType: EventTypeSlug): number {
  const now = nowIso();
  const result = db()
    .prepare(
      `INSERT INTO gallery_items (image_url, image_width, image_height, image_blur, image_alt, event_type,
         position, created_at, updated_at)
       VALUES (:image_url, :image_width, :image_height, :image_blur, :image_alt, :event_type, :position, :now, :now)`,
    )
    .run({ ...imageParams(image), event_type: eventType, position: nextPosition("gallery_items"), now });
  return Number(result.lastInsertRowid);
}

export function updateGalleryItem(
  id: number,
  input: { alt: string; caption: string; eventType: EventTypeSlug; featured: boolean; visible: boolean },
) {
  db()
    .prepare(
      `UPDATE gallery_items SET image_alt = :alt, caption = :caption, event_type = :event_type,
         featured = :featured, visible = :visible, updated_at = :now
       WHERE id = :id`,
    )
    .run({
      id,
      alt: input.alt,
      caption: input.caption,
      event_type: input.eventType,
      featured: input.featured ? 1 : 0,
      visible: input.visible ? 1 : 0,
      now: nowIso(),
    });
}

/** Returns the removed image so the caller can delete its file. */
export function deleteGalleryItem(id: number): MediaImage | null {
  const row = db().prepare("SELECT * FROM gallery_items WHERE id = ?").get(id);
  if (!row) return null;
  db().prepare("DELETE FROM gallery_items WHERE id = ?").run(id);
  return imageFromRow(row);
}
