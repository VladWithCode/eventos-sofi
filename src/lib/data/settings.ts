import "server-only";
import { db, nowIso } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/db/seed";
import type { SiteSettings } from "@/lib/types";

export function readSettings(): SiteSettings {
  const row = db().prepare("SELECT data FROM settings WHERE id = 1").get();
  let stored: Partial<SiteSettings> = {};
  try {
    stored = row ? (JSON.parse(String(row.data)) as Partial<SiteSettings>) : {};
  } catch {
    console.error("[settings] stored settings are not valid JSON; using defaults");
  }
  // Defaults first so fields added in later versions always have a value.
  return { ...DEFAULT_SETTINGS, ...stored };
}

export function writeSettings(settings: SiteSettings) {
  db()
    .prepare(
      `INSERT INTO settings (id, data, updated_at) VALUES (1, ?, ?)
       ON CONFLICT (id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    )
    .run(JSON.stringify(settings), nowIso());
}
