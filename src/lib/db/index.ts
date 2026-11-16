import "server-only";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { hashPasswordSync } from "@/lib/auth/password";
import { UPLOADS_DIR } from "@/lib/media";
import { MIGRATIONS, SCHEMA } from "./schema";
import { DEFAULT_SETTINGS, SEED_FAQS, SEED_SERVICES } from "./seed";
import { SEED_GALLERY, SEED_SERVICE_IMAGES, type SeedImage } from "./seed-media";

export type Row = Record<string, unknown>;

// Dev hot reload re-evaluates modules; keep one connection per process.
const globalForDb = globalThis as typeof globalThis & { __eventosSofiDb?: DatabaseSync };

export function db(): DatabaseSync {
  globalForDb.__eventosSofiDb ??= open();
  return globalForDb.__eventosSofiDb;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Runs `fn` inside a write transaction (BEGIN IMMEDIATE avoids upgrade deadlocks under WAL). */
export function transaction<T>(fn: () => T, conn: DatabaseSync = db()): T {
  conn.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    conn.exec("COMMIT");
    return result;
  } catch (error) {
    conn.exec("ROLLBACK");
    throw error;
  }
}

function open(): DatabaseSync {
  const file = resolve(/*turbopackIgnore: true*/ process.env.DATABASE_PATH ?? "./data/sofi.db");
  mkdirSync(dirname(file), { recursive: true });

  // `timeout` is the busy timeout: build workers and the server may open the file at once.
  const conn = new DatabaseSync(file, { timeout: 5000, enableForeignKeyConstraints: true });
  conn.exec("PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA foreign_keys = ON;");

  transaction(() => {
    conn.exec(SCHEMA);
    migrate(conn);
    seed(conn);
    bootstrapAdmin(conn);
  }, conn);
  return conn;
}

function migrate(conn: DatabaseSync) {
  const version = Number(conn.prepare("PRAGMA user_version").get()?.user_version ?? 0);
  for (let i = version; i < MIGRATIONS.length; i++) {
    conn.exec(MIGRATIONS[i]);
  }
  if (version < MIGRATIONS.length) conn.exec(`PRAGMA user_version = ${MIGRATIONS.length}`);
}

function isEmpty(conn: DatabaseSync, table: "settings" | "services" | "faqs" | "users") {
  return !conn.prepare(`SELECT 1 FROM ${table} LIMIT 1`).get();
}

const SEED_MEDIA_DIR = join(/*turbopackIgnore: true*/ process.cwd(), "seed", "media");

/** Copies a seed photo into the uploads folder and returns its public URL. */
function installSeedImage(image: SeedImage): string {
  const target = join(UPLOADS_DIR, image.file);
  if (!existsSync(target)) {
    mkdirSync(UPLOADS_DIR, { recursive: true });
    copyFileSync(join(SEED_MEDIA_DIR, image.file), target);
  }
  return `/media/${image.file}`;
}

function seed(conn: DatabaseSync) {
  const now = nowIso();
  // Settings exist from the first start on, so their absence marks a brand-new database.
  const firstRun = isEmpty(conn, "settings");

  if (firstRun) {
    conn
      .prepare("INSERT INTO settings (id, data, updated_at) VALUES (1, ?, ?)")
      .run(JSON.stringify(DEFAULT_SETTINGS), now);

    // Only on a new database: an owner who later empties the gallery keeps it empty.
    const insert = conn.prepare(
      `INSERT INTO gallery_items
         (image_url, image_width, image_height, image_blur, image_alt, event_type, caption, featured, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    SEED_GALLERY.forEach((photo, i) =>
      insert.run(
        installSeedImage(photo),
        photo.width,
        photo.height,
        photo.blur,
        photo.alt,
        photo.eventType,
        photo.caption,
        photo.featured ? 1 : 0,
        i + 1,
        now,
        now,
      ),
    );
  }

  if (isEmpty(conn, "services")) {
    const insert = conn.prepare(
      `INSERT INTO services
         (title, summary, description, features, image_url, image_width, image_height, image_blur, image_alt, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    SEED_SERVICES.forEach((s, i) => {
      const image = SEED_SERVICE_IMAGES[i];
      insert.run(
        s.title,
        s.summary,
        s.description,
        JSON.stringify(s.features),
        image ? installSeedImage(image) : null,
        image?.width ?? null,
        image?.height ?? null,
        image?.blur ?? null,
        image?.alt ?? null,
        i + 1,
        now,
        now,
      );
    });
  }

  if (isEmpty(conn, "faqs")) {
    const insert = conn.prepare(
      "INSERT INTO faqs (question, answer, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    );
    SEED_FAQS.forEach((f, i) => insert.run(f.question, f.answer, i + 1, now, now));
  }
}

function bootstrapAdmin(conn: DatabaseSync) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || !isEmpty(conn, "users")) return;
  if (password.length < 10) {
    console.error("[db] ADMIN_PASSWORD must have at least 10 characters; admin user not created.");
    return;
  }
  const now = nowIso();
  conn
    .prepare("INSERT INTO users (email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?)")
    .run(email, hashPasswordSync(password), now, now);
}
