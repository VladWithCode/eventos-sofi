import "server-only";
import { db, nowIso, type Row } from "@/lib/db";
import type { Faq } from "@/lib/types";
import { bool, nextPosition, num, str } from "./rows";

function toFaq(row: Row): Faq {
  return {
    id: num(row.id),
    question: str(row.question),
    answer: str(row.answer),
    position: num(row.position),
    visible: bool(row.visible),
  };
}

export function listFaqs({ onlyVisible }: { onlyVisible: boolean }): Faq[] {
  const where = onlyVisible ? "WHERE visible = 1" : "";
  return db().prepare(`SELECT * FROM faqs ${where} ORDER BY position, id`).all().map(toFaq);
}

export type FaqInput = Omit<Faq, "id" | "position">;

export function createFaq(input: FaqInput) {
  const now = nowIso();
  db()
    .prepare(
      `INSERT INTO faqs (question, answer, visible, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(input.question, input.answer, input.visible ? 1 : 0, nextPosition("faqs"), now, now);
}

export function updateFaq(id: number, input: FaqInput) {
  db()
    .prepare("UPDATE faqs SET question = ?, answer = ?, visible = ?, updated_at = ? WHERE id = ?")
    .run(input.question, input.answer, input.visible ? 1 : 0, nowIso(), id);
}

export function deleteFaq(id: number) {
  db().prepare("DELETE FROM faqs WHERE id = ?").run(id);
}
