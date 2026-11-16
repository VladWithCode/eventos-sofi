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

## Deploying (single VPS)

1. `pnpm install --frozen-lockfile && pnpm build`
2. Run `pnpm start` under a process manager (systemd, pm2) with the env variables set.
3. Put a reverse proxy (Caddy, Nginx) in front with HTTPS. It must set
   `X-Forwarded-For` / `X-Real-IP` (and overwrite client-sent values): rate limits
   and Meta matching use them. The session cookie is `Secure` in production, so the
   admin only works over HTTPS.
4. Back up the whole `data/` directory (database + uploads). Use
   `sqlite3 data/sofi.db ".backup backup.db"` for a consistent copy while running.

`next build` prerenders the public content, so it opens (and if needed creates)
the database at build time. Build on the server, or point `DATABASE_PATH` at the
real database during the build. Rate limits are in memory and per process, which
is fine for one server.
