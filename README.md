# Eventos Sofi

Public site and admin panel for Eventos Sofi, an event planning and decoration
business in Durango, Mexico. Next.js 16 (App Router, Cache Components), React 19,
Tailwind CSS 4, SQLite through Node's built-in `node:sqlite` (Node 24+).

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in ADMIN_EMAIL and ADMIN_PASSWORD
pnpm dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin

On first start the app creates `./data/sofi.db`, seeds the business settings,
services and FAQs, and creates the admin account from `ADMIN_EMAIL` /
`ADMIN_PASSWORD` if no user exists yet. A new database also gets the starter
photos in `seed/media` (taken from the business's own Facebook and Instagram
pages) as gallery items and service images; they are copied into
`data/uploads` and can be edited or deleted from the admin like any upload.
Testimonials start empty on purpose: add only real ones.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_PATH` | no | SQLite file, default `./data/sofi.db` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | first start | Bootstrap admin (password ≥ 10 chars). Ignored once a user exists. |
| `NEXT_PUBLIC_META_PIXEL_ID` | no | Meta Pixel id (digits). Enables the Pixel and the Conversions API. |
| `META_CAPI_TOKEN` | no | Conversions API access token. Without it, server events are skipped. |
| `META_TEST_EVENT_CODE` | no | Sends server events as test events. Remove in production. |
| `META_DOMAIN_VERIFICATION` | no | Code for the `facebook-domain-verification` meta tag (Business Settings → Domains). |
| `NEXT_PUBLIC_SITE_URL` | production | Public origin, used for canonical URLs, Open Graph tags and the sitemap. |

## Meta (Facebook / Instagram) ads setup

1. Create a Pixel in Events Manager and set `NEXT_PUBLIC_META_PIXEL_ID`.
2. Generate a Conversions API token for that Pixel and set `META_CAPI_TOKEN`.
3. Verify the domain with `META_DOMAIN_VERIFICATION`.
4. While testing, set `META_TEST_EVENT_CODE` and watch Events Manager → Test events, then remove it.

Events sent (browser and server share one `event_id`, so Meta counts each once):

| Event | When |
| --- | --- |
| `PageView` | Page load (Pixel). |
| `Lead` | Booking form saved. Use this as the campaign's conversion event. |
| `Contact` | Contact form saved, or a WhatsApp / phone / social link clicked (`method` tells them apart). |
| `FormStart` (custom) | First interaction with the booking form. Diagnostics only. |

Suggested ad URL parameters:
`?utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}&placement={{placement}}`.
They are stored with each booking and shown in its detail page.

## Design system

Tokens (colors, fonts, motion) live in `src/app/globals.css`. The site is light
only. Motion primitives are in `src/components/motion`; landing sections in
`src/components/site`. Above-the-fold animation is CSS, so the hero moves before
JavaScript loads; everything honors `prefers-reduced-motion`.

## Project layout

- `src/lib/db` – connection (WAL, foreign keys), schema, migrations (`PRAGMA user_version`), seeds.
- `src/lib/data` – SQL per table (prepared statements only).
- `src/lib/content.ts` – cached public reads (`use cache` + `cacheTag`); admin edits call `updateTag`, so the site updates immediately.
- `src/lib/auth` – scrypt passwords, cookie sessions (only the token hash is stored), `requireAdmin()`.
- `src/lib/meta` – browser Pixel helpers and the server Conversions API client.
- `src/app/actions` – server actions: `public.ts` (booking and contact forms) and `admin/*`.
- `src/app/admin` – admin panel. Every page and action calls `requireAdmin()`.
- `src/app/media/[file]` – serves uploaded images from `./data/uploads`.
- `src/app/api/meta/contact` – server mirror of Pixel `Contact` clicks.

## Deploying (VPS with nginx + pm2)

`deploy/vps.sh` builds the standalone bundle on this machine and runs it on the
server with pm2. The server needs only Node 24+ and pm2: no `pnpm install`, no
build. Both machines must share a CPU architecture (the bundle carries sharp's
native binary).

```bash
cp deploy/vps.env.example deploy/vps.env   # SSH target, folder, URL, port, admin, Meta keys
./deploy/vps.sh --code-only                # normal deploy: keeps the server's database and photos
./deploy/vps.sh                            # also replaces the server's data with ./data (asks first)
```

On the server, `$DEPLOY_DIR/app` is replaced on every deploy and
`$DEPLOY_DIR/data` (database + uploads) persists; back that folder up. For a
consistent copy while the site runs:
`node -e 'new (require("node:sqlite").DatabaseSync)("data/sofi.db").prepare("VACUUM INTO ?").run("backup.db")'`.

nginx is not configured by the script. The comment at the top of
`deploy/vps.sh` has the `location` block: proxy to `127.0.0.1:$DEPLOY_PORT`,
set `X-Forwarded-For` (rate limits and Meta matching use it), allow 15 MB
bodies for photo uploads, and serve over HTTPS (the admin session cookie is
`Secure` in production).

Public pages are prerendered at build time from the database and stay that way
until content is edited in the admin, so the build must read the content the
server will have. The script handles this: `--code-only` builds against a
snapshot of the server's database, the full deploy against the local one.
Rate limits are in memory and per process, which is fine for one server.
