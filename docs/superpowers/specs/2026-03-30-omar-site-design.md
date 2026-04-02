# Omar Kamel — Personal Portfolio & Brand Website

## Overview

A personal portfolio and brand website for Omar Kamel, AI Creative & Production Lead at Optix/Saatchi & Saatchi Dubai. The site showcases client work, personal projects/ventures, blog content, and provides a professional contact point.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **CMS:** Sanity (embedded Studio at `/studio`)
- **Email:** Resend (contact form)
- **Hosting:** Vercel
- **Language:** English only

## Architecture

Single repo, single Vercel deployment. Sanity Studio embedded as a Next.js route at `/studio`. All content fetched server-side via GROQ queries in Server Components. Client Components used only where interactivity is required (contact form, category filters, animations).

Route groups separate the public site layout (nav + footer) from the Studio route (no site chrome).

Future-proofing: `/services` and `/shop` routes can be added to the `(site)` route group without restructuring. Stripe integration can be added via a new API route and client components.

## Project Structure

```
omar-site/
├── app/
│   ├── (site)/                    # Public site (nav + footer layout)
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Homepage
│   │   ├── work/
│   │   │   ├── page.tsx           # Work grid with category filters
│   │   │   └── [slug]/page.tsx    # Work detail
│   │   ├── projects/
│   │   │   ├── page.tsx           # Projects grid
│   │   │   └── [slug]/page.tsx    # Project detail
│   │   ├── blog/
│   │   │   ├── page.tsx           # Blog listing
│   │   │   └── [slug]/page.tsx    # Blog post
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   └── services/page.tsx      # Coming soon placeholder
│   ├── studio/[[...tool]]/        # Sanity Studio (own layout, no nav/footer)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── contact/route.ts       # Resend email handler
│   │   └── draft/route.ts         # Sanity preview (future)
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── feed.xml/route.ts          # RSS feed
│   ├── layout.tsx                 # Root layout (fonts, GA snippet)
│   └── globals.css
├── components/
│   ├── nav.tsx
│   ├── mobile-nav.tsx
│   ├── footer.tsx
│   ├── hero.tsx
│   ├── work-card.tsx
│   ├── project-card.tsx
│   ├── blog-card.tsx
│   ├── contact-form.tsx
│   ├── category-filter.tsx
│   ├── section-heading.tsx
│   ├── tag-badge.tsx
│   ├── media-embed.tsx
│   ├── portable-text.tsx
│   └── coming-soon.tsx
├── lib/
│   ├── sanity/
│   │   ├── client.ts
│   │   ├── queries.ts
│   │   ├── image.ts
│   │   └── types.ts
│   ├── resend.ts
│   └── utils.ts
├── sanity/
│   ├── sanity.config.ts
│   ├── schema.ts
│   └── schemas/
│       ├── work.ts
│       ├── project.ts
│       ├── blogPost.ts
│       ├── siteSettings.ts
│       └── mediaItem.ts
├── public/
│   └── (placeholder images)
├── .env.example
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

## Sanity Schemas

### `work` — Client & Creative Work

| Field        | Type              | Notes                                                                                  |
| ------------ | ----------------- | -------------------------------------------------------------------------------------- |
| title        | string (required) |                                                                                        |
| slug         | slug (from title) |                                                                                        |
| client       | string (optional) | For client work                                                                        |
| description  | portable text     |                                                                                        |
| coverImage   | image (with alt)  |                                                                                        |
| categories   | array of strings  | Values: "AI & Production", "Video Production", "AI Films", "Music", "Comics & Writing" |
| tags         | array of strings  | Freeform — e.g., "Generative Image", "Brand Campaign"                                  |
| media        | array of objects  | Each: { type: "youtube"                                                                |
| externalLink | URL (optional)    |                                                                                        |
| featured     | boolean           |                                                                                        |
| sortOrder    | number            |                                                                                        |
| date         | date              |                                                                                        |

### `project` — Personal Projects & Ventures

| Field       | Type              | Notes                                  |
| ----------- | ----------------- | -------------------------------------- |
| title       | string (required) |                                        |
| slug        | slug              |                                        |
| description | portable text     |                                        |
| coverImage  | image (with alt)  |                                        |
| logo        | image (optional)  |                                        |
| status      | string            | Values: "active", "archived", "paused" |
| links       | array of objects  | Each: { label: string, url: string }   |
| tags        | array of strings  |                                        |
| featured    | boolean           |                                        |
| sortOrder   | number            |                                        |

### `blogPost` — Blog Posts

| Field      | Type              | Notes                                           |
| ---------- | ----------------- | ----------------------------------------------- |
| title      | string (required) |                                                 |
| slug       | slug              |                                                 |
| coverImage | image (with alt)  |                                                 |
| body       | portable text     | Rich text with inline images, code blocks, etc. |
| excerpt    | text              | For cards and SEO description                   |
| date       | datetime          |                                                 |
| tags       | array of strings  |                                                 |
| seo        | object            | { metaTitle, metaDescription, ogImage }         |

### `siteSettings` — Singleton

| Field             | Type             | Notes                                   |
| ----------------- | ---------------- | --------------------------------------- |
| heroHeadline      | string           |                                         |
| heroTagline       | string           |                                         |
| heroBackground    | image or file    | Supports image or video                 |
| aboutBio          | portable text    |                                         |
| aboutPhoto        | image            |                                         |
| profilePhoto      | image            | Used in nav, footer, OG fallback        |
| socialLinks       | array of objects | Each: { platform: string, url: string } |
| googleAnalyticsId | string           |                                         |

### `mediaItem` — Reusable Media Library

| Field       | Type              | Notes                           |
| ----------- | ----------------- | ------------------------------- |
| title       | string (required) |                                 |
| type        | string            | Values: "image", "video"        |
| image       | image (with alt)  | For image type                  |
| videoUrl    | URL               | For video type (YouTube, Vimeo) |
| description | text (optional)   |                                 |

Used as a reference type by `work` and `project` schemas where reusable media is needed.

## Visual Design System

### Palette

| Token      | Value     | Usage                            |
| ---------- | --------- | -------------------------------- |
| `black`    | `#000000` | Backgrounds, primary text        |
| `white`    | `#FFFFFF` | Backgrounds, inverse text        |
| `brick`    | `#8B2500` | Accent — links, CTAs, highlights |
| `gray-900` | `#171717` | Dark surfaces                    |
| `gray-600` | `#525252` | Secondary text                   |
| `gray-200` | `#E5E5E5` | Borders, dividers                |
| `gray-50`  | `#FAFAFA` | Light surface backgrounds        |

### Typography

- **Headings:** Playfair Display (serif) — editorial, high-contrast
- **Body:** Inter (sans-serif) — clean, highly legible
- **Sizes:** Tailwind default scale, with custom sizes for hero headline (clamp-based fluid sizing)

### Aesthetic

- Bold, high-contrast — black/white with brick red as the sole accent
- Editorial feel — generous whitespace, strong typographic hierarchy
- Magazine-inspired layout with full-bleed hero and grid-based sections
- Mobile-first responsive design

### Animations

- Fade-in on scroll for sections (Intersection Observer, CSS transitions)
- Subtle hover lift + shadow on cards
- Smooth underline transitions on nav links
- No flashy or distracting motion

## Page Designs

### Homepage (`/`)

1. **Hero:** Full-screen section. Name ("Omar Kamel"), title, punchy tagline. Background image or video loop from Sanity. Scroll indicator.
2. **Featured Work:** Section heading + 6-8 work cards in responsive grid, filtered to `featured: true`. "View all work" link.
3. **Projects:** 3-4 featured project cards with logos and status badges. "View all projects" link.
4. **Latest Posts:** 3 most recent blog posts as cards. "Read more" link.
5. **Contact CTA:** Brief text + link to contact page.

### Work (`/work`)

- Category filter bar at top (All | AI & Production | Video Production | AI Films | Music | Comics & Writing)
- Responsive grid of work cards (cover image, title, client, category badges, tags)
- Filter is client-side (URL query param: `/work?category=music`)
- Click through to `/work/[slug]` detail page

### Work Detail (`/work/[slug]`)

- Cover image (full-width)
- Title, client, date, categories, tags
- Description (portable text)
- Media embeds (YouTube, Vimeo, SoundCloud, Spotify)
- External link if applicable
- Back to work link

### Projects (`/projects`)

- Responsive grid of project cards
- Each card: logo (if available), title, description excerpt, status badge, tags
- Click through to `/projects/[slug]`

### Project Detail (`/projects/[slug]`)

- Cover image, logo
- Title, status, description (portable text)
- Links section (website, YouTube, etc. — rendered as buttons)
- Tags

### Blog (`/blog`)

- List of posts: cover image, title, excerpt, date, tags
- Ordered by date descending

### Blog Post (`/blog/[slug]`)

- Cover image (full-width)
- Title, date, tags
- Body rendered from portable text (supports images, code blocks, blockquotes)
- SEO: meta title, description, OG image from `seo` field or fallback to cover image

### About (`/about`)

- Profile photo (from Sanity)
- Long-form bio rendered from portable text
- Skills/tools grid — hardcoded initially, can be moved to Sanity later

### Contact (`/contact`)

- Form: name, email, message fields
- Client Component with client-side validation
- Submits to `/api/contact` which sends email via Resend to `omar@omarkamel.com`
- Success/error states
- Social links: LinkedIn, Instagram, Twitter/X, YouTube

### Services (`/services`)

- Coming soon page
- Brief teaser text
- Link to contact page for enquiries

## Navigation

**Desktop:** Horizontal nav bar — Home | Work | Projects | Blog | About | Contact | Services (dimmed/badge "coming soon")

**Mobile:** Hamburger menu → full-screen overlay nav

Logo/name on the left, nav items on the right. Sticky on scroll.

## API Routes

### `POST /api/contact`

- Accepts: `{ name, email, message }`
- Validates required fields + email format
- Sends email via Resend to `omar@omarkamel.com`
- Returns: `{ success: true }` or `{ error: string }`
- Rate limiting: basic in-memory throttle (upgrade later if needed)

### `GET /api/draft` (future)

- Placeholder for Sanity preview mode

## SEO & Performance

- `generateMetadata` on every page — title, description, OG image
- Blog posts use `seo` field with fallback to title/excerpt/cover image
- `sitemap.ts` — fetches all slugs from Sanity at build time
- `robots.ts` — allows all, disallows `/studio`
- RSS feed at `/feed.xml` — generated from blog posts
- `next/image` with Sanity CDN loader for optimized images
- Google Analytics: `gtag` snippet in root layout, ID from `siteSettings` (empty by default)

## Environment Variables

```
# .env.example
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=
RESEND_API_KEY=
CONTACT_EMAIL=omar@omarkamel.com
```

## Dummy Content

All sections will be populated with realistic placeholder content so the site looks complete before Sanity is populated:

- 6-8 work items across all categories (using placeholder images)
- 3-4 projects (6DOF Reviews, humanimpact.news, etc.)
- 3-5 blog posts with lorem-style content
- Full about bio placeholder
- Hero text and tagline

## Future-Proofing

- Route group structure allows adding `/services` or `/shop` pages without restructuring
- Stripe can be added via: new API routes in `/api/`, new components, and environment variables
- Sanity schemas can be extended without breaking existing content
- Category system is flexible — new categories added in Sanity, no code changes
