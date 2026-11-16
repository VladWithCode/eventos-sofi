import "server-only";
import { db, nowIso, type Row } from "@/lib/db";
import { isEventTypeSlug } from "@/lib/event-types";
import type { Testimonial } from "@/lib/types";
import { bool, nextPosition, num, str } from "./rows";

function toTestimonial(row: Row): Testimonial {
  const eventType = str(row.event_type);
  return {
    id: num(row.id),
    author: str(row.author),
    eventType: isEventTypeSlug(eventType) ? eventType : "otro",
    quote: str(row.quote),
    rating: num(row.rating),
    position: num(row.position),
    visible: bool(row.visible),
  };
}

export function listTestimonials({ onlyVisible }: { onlyVisible: boolean }): Testimonial[] {
  const where = onlyVisible ? "WHERE visible = 1" : "";
  return db().prepare(`SELECT * FROM testimonials ${where} ORDER BY position, id`).all().map(toTestimonial);
}

export type TestimonialInput = Omit<Testimonial, "id" | "position">;

function params(input: TestimonialInput) {
  return {
    author: input.author,
    event_type: input.eventType,
    quote: input.quote,
    rating: input.rating,
    visible: input.visible ? 1 : 0,
  };
}

export function createTestimonial(input: TestimonialInput) {
  const now = nowIso();
  db()
    .prepare(
      `INSERT INTO testimonials (author, event_type, quote, rating, visible, position, created_at, updated_at)
       VALUES (:author, :event_type, :quote, :rating, :visible, :position, :now, :now)`,
    )
    .run({ ...params(input), position: nextPosition("testimonials"), now });
}

export function updateTestimonial(id: number, input: TestimonialInput) {
  db()
    .prepare(
      `UPDATE testimonials SET author = :author, event_type = :event_type, quote = :quote, rating = :rating,
         visible = :visible, updated_at = :now
       WHERE id = :id`,
    )
    .run({ ...params(input), id, now: nowIso() });
}

export function deleteTestimonial(id: number) {
  db().prepare("DELETE FROM testimonials WHERE id = ?").run(id);
}
