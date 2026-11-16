import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { db, nowIso } from "@/lib/db";

const COOKIE = "evs_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type AdminUser = { id: number; email: string };

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

async function currentTokenHash(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  return token && /^[A-Za-z0-9_-]{43}$/.test(token) ? hashToken(token) : null;
}

/** The signed-in admin for this request, or null. Deduplicated per request. */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  // Admin data must never be prerendered, and the expiry check reads the clock.
  await connection();
  const tokenHash = await currentTokenHash();
  if (!tokenHash) return null;
  const row = db()
    .prepare(
      `SELECT users.id, users.email FROM sessions JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
    )
    .get(tokenHash, nowIso());
  return row ? { id: Number(row.id), email: String(row.email) } : null;
});

/** Only from Server Actions or Route Handlers (sets a cookie). */
export async function startSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expires = new Date(now.getTime() + MAX_AGE_SECONDS * 1000);
  const conn = db();
  conn.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now.toISOString());
  conn
    .prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .run(hashToken(token), userId, expires.toISOString(), now.toISOString());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Only from Server Actions or Route Handlers (deletes a cookie). */
export async function endSession() {
  const tokenHash = await currentTokenHash();
  if (tokenHash) db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
  (await cookies()).delete(COOKIE);
}

/** Signs the user out everywhere except the current browser. */
export async function endOtherSessions(userId: number) {
  const tokenHash = (await currentTokenHash()) ?? "";
  db().prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash != ?").run(userId, tokenHash);
}
