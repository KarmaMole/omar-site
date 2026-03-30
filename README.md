# Omar Kamel — Personal Portfolio & Brand Website

Portfolio and brand site built with Next.js 15, Sanity CMS, and Tailwind CSS.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **CMS:** Sanity v4 (embedded Studio at `/studio`)
- **Email:** Resend
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

1. Clone the repo:

```bash
git clone https://github.com/KarmaMole/omar-site.git
cd omar-site
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file from the template:

```bash
cp .env.example .env.local
```

4. Fill in your environment variables:

- **Sanity:** Create a project at [sanity.io/manage](https://www.sanity.io/manage) and copy the project ID
- **Resend:** Sign up at [resend.com](https://resend.com) and get an API key (optional for local dev — form submissions log to console without it)

5. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Sanity Studio

Access the CMS at [http://localhost:3000/studio](http://localhost:3000/studio).

To use Sanity Studio:

1. Go to [sanity.io/manage](https://www.sanity.io/manage) and create a new project
2. Copy the project ID into `NEXT_PUBLIC_SANITY_PROJECT_ID` in `.env.local`
3. Add `http://localhost:3000` to your project's CORS origins in Sanity settings
4. Restart the dev server

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Add all environment variables from `.env.example` in the Vercel dashboard:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` — your Sanity project ID
   - `NEXT_PUBLIC_SANITY_DATASET` — `production`
   - `NEXT_PUBLIC_SANITY_API_VERSION` — `2024-01-01`
   - `SANITY_API_TOKEN` — generate a read token in Sanity settings
   - `RESEND_API_KEY` — your Resend API key
   - `CONTACT_EMAIL` — `omar@omarkamel.com`
4. Deploy

After deploying, add your Vercel domain (e.g. `omar-site.vercel.app`) to Sanity's CORS origins.

## Project Structure

```
app/(site)/       — Public site pages (nav + footer layout)
app/studio/       — Embedded Sanity Studio (no site chrome)
app/api/          — API routes (contact form)
components/       — Reusable React components
lib/              — Utilities, Sanity client, types, queries, dummy data
sanity/           — Sanity schema definitions
```

## Content Management

All content is managed via Sanity Studio at `/studio`:

- **Work** — Client projects and creative work (filterable by category: AI & Production, Video Production, AI Films, Music, Comics & Writing)
- **Projects** — Personal ventures and platforms (6DOF Reviews, humanimpact.news, etc.)
- **Blog Posts** — Full blog with rich text, images, code blocks, and SEO fields
- **Site Settings** — Hero text, about bio, social links, profile photo, analytics ID

## SEO

- Auto-generated `sitemap.xml` at `/sitemap.xml`
- `robots.txt` at `/robots.txt` (disallows `/studio`)
- RSS feed at `/feed.xml`
- OpenGraph metadata on all pages
- Google Analytics — add your GA measurement ID to Site Settings in Sanity

## Future

- `/services` page is a coming-soon placeholder — ready for Stripe integration
- Add ISR + Sanity webhooks for on-demand revalidation when content changes
