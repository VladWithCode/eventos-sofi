import "server-only";
import { db, nowIso } from "@/lib/db";

export function findUserByEmail(email: string): { id: number; passwordHash: string } | null {
  const row = db().prepare("SELECT id, password_hash FROM users WHERE email = ?").get(email.trim().toLowerCase());
  return row ? { id: Number(row.id), passwordHash: String(row.password_hash) } : null;
}

export function findPasswordHash(userId: number): string | null {
  const row = db().prepare("SELECT password_hash FROM users WHERE id = ?").get(userId);
  return row ? String(row.password_hash) : null;
}

export function setPasswordHash(userId: number, passwordHash: string) {
  db().prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(passwordHash, nowIso(), userId);
}

export function hasUsers(): boolean {
  return Boolean(db().prepare("SELECT 1 FROM users LIMIT 1").get());
}
