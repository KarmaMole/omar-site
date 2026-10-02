# Omar Kamel: Portfolio & Brand Website

Source for [omarkamel.com](https://omarkamel.com). Next.js 15 (App Router) with an embedded Payload CMS.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19
- **CMS:** Payload 3 (admin at `/admin`)
- **Database:** Postgres on Neon
- **Media storage:** Vercel Blob
- **Styling:** Tailwind CSS 3
- **Email:** SMTP via nodemailer (contact form)
- **Hosting:** Vercel (project `omar2026`)

## Setup

```bash
git clone https://github.com/KarmaMole/omar-site.git
cd omar-site
npm install
cp .env.example .env.local   # then fill in the values
```

| Variable | Purpose |
|---|---|
| `DATABASE_URI` | Neon Postgres connection string |
| `PAYLOAD_SECRET` | Payload auth secret (required in production) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob, for media uploads |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Contact form mail. Production refuses to accept messages if these are missing |
| `CONTACT_EMAIL` | Where contact form messages go |
| `ANTHROPIC_API_KEY`, `FAL_KEY` | Admin-only "Generate All" button on Dispatches |
| `NEXT_PUBLIC_GA_ID` | Google Analytics (optional, loads only after cookie consent) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |

### ⚠ Schema changes and the production database

There is no migrations folder. Payload pushes schema changes automatically whenever `next dev` starts, and `.env.local` points at the **production** database. So:

- Don't run `npm run dev` after renaming or removing a field unless you mean to apply that change to production.
- For schema changes, dry-run first: Drizzle's `pushSchema` returns the SQL statements without applying them, so you can check there's no data loss.
- `next dev` renders blank pages because the site's CSP blocks `unsafe-eval`. To test locally, use `npm run build && npm start`.

## Content (Payload admin at `/admin`)

- **Works:** client and personal work (`/work`)
- **Studio:** personal projects (`/studio`)
- **Dispatches:** the blog (`/dispatch`), markdown body, with an AI "Generate All" button for excerpt, SEO and cover image
- **Clients:** the "Selected Clients" list
- **Homepage** (sidebar link): drag-and-drop picker for Featured Work, From the Studio and Recent Work pins. Unpinned Recent Work slots fill with the newest work automatically
- **Reorder Items** (sidebar link): the order of `/work` and `/studio`
- **Site Settings:** hero, about bio, photos, social links

Work, Studio and Dispatches keep their last 10 versions, which you can restore from each item's Versions tab.

## Project Structure

```
app/(site)/        Public site pages
app/(payload)/     Payload admin and REST API (/admin, /api)
app/api/           Custom API routes (contact form, reorder)
collections/       Payload collections
globals/           Payload globals (Site Settings, Homepage)
components/        React components (components/admin: custom admin UI)
lib/payload/       Cached data queries and homepage logic
scripts/archive/   Finished one-off migrations. Do not run
```

## Caching

Pages are static or ISR. Data queries are wrapped in `unstable_cache` with tags (`work`, `studio`, `dispatch`, `clients`, `settings`, `homepage`), and collection hooks call `revalidateTag` on every change, so edits show up within about a minute.

## SEO

`/sitemap.xml`, `/robots.txt`, `/feed.xml` (RSS), per-page Open Graph images, and JSON-LD (Person, WebSite, CreativeWork, Article, BreadcrumbList).
