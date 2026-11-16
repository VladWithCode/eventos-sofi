/**
 * Base schema. Every statement is idempotent so it can run on each boot; later
 * changes go into MIGRATIONS (index = target `PRAGMA user_version` - 1).
 */
export const SCHEMA = /* sql */ `
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT NOT NULL DEFAULT '[]',
  image_url TEXT,
  image_width INTEGER,
  image_height INTEGER,
  image_blur TEXT,
  image_alt TEXT,
  price_from INTEGER,
  position INTEGER NOT NULL,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id INTEGER PRIMARY KEY,
  image_url TEXT NOT NULL,
  image_width INTEGER NOT NULL,
  image_height INTEGER NOT NULL,
  image_blur TEXT NOT NULL,
  image_alt TEXT NOT NULL DEFAULT '',
  event_type TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY,
  author TEXT NOT NULL,
  event_type TEXT NOT NULL,
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  position INTEGER NOT NULL,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  position INTEGER NOT NULL,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL,
  guests TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'nueva'
    CHECK (status IN ('nueva','contactada','cotizada','confirmada','realizada','cancelada')),
  notes TEXT NOT NULL DEFAULT '',
  quote_amount INTEGER,
  meta_event_id TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  utm_content TEXT NOT NULL DEFAULT '',
  utm_term TEXT NOT NULL DEFAULT '',
  placement TEXT NOT NULL DEFAULT '',
  fbclid TEXT NOT NULL DEFAULT '',
  landing_url TEXT NOT NULL DEFAULT '',
  referrer TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (status, created_at);
CREATE INDEX IF NOT EXISTS bookings_event_date_idx ON bookings (event_date);

CREATE TABLE IF NOT EXISTS contact_requests (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'nuevo' CHECK (status IN ('nuevo','respondido','archivado')),
  meta_event_id TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  utm_content TEXT NOT NULL DEFAULT '',
  utm_term TEXT NOT NULL DEFAULT '',
  placement TEXT NOT NULL DEFAULT '',
  fbclid TEXT NOT NULL DEFAULT '',
  landing_url TEXT NOT NULL DEFAULT '',
  referrer TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS contact_requests_status_idx ON contact_requests (status, created_at);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
`;

export const MIGRATIONS: string[] = [];
