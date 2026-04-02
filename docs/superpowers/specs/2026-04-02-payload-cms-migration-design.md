# Omar Kamel Site — Payload CMS Migration

## Overview

Migrate the CMS layer from Sanity (configured but unused) to Payload CMS v3. The site currently runs on Next.js 15 with all content served from hardcoded dummy data. Sanity schemas, queries, and studio are set up but no pages actually call them.

**Goal:** Replace Sanity with Payload CMS to give Omar a clean, WordPress-like content editing experience — rich text, media library, structured fields — all hosted on Vercel as a single deployment.

**Non-goals:** No changes to visual design, page structure, styling, or frontend components. No new pages or features. This is a data layer swap.

## Tech Stack Changes

### Removed
- `sanity` (v4.22.0)
- `next-sanity` (v11.6.12)
- `@sanity/vision`
- `@sanity/code-input`
- `@sanity/image-url`
- `@portabletext/react`
- `styled-components` (Sanity Studio dependency, not used elsewhere)

### Added
- `payload` (v3.x)
- `@payloadcms/next` — Next.js integration
- `@payloadcms/db-postgres` — Postgres adapter
- `@payloadcms/richtext-lexical` — Rich text editor (Lexical-based)
- `@payloadcms/storage-vercel-blob` — Media storage on Vercel Blob
- `@payloadcms/plugin-seo` — SEO fields plugin (metaTitle, metaDescription, ogImage)

### Unchanged
- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS
- Resend (contact form)
- Vercel hosting
- All frontend components, pages, and styling

## Infrastructure

| Concern | Solution | Cost |
|---|---|---|
| Database | Neon Postgres (free tier: 0.5GB, autosuspend) | Free |
| Media storage | Vercel Blob (free tier: 1GB) | Free |
| Hosting | Vercel (unchanged) | Free tier |
| Auth | Payload built-in (single admin user) | N/A |

### Environment Variables

Replace Sanity vars with:

```
DATABASE_URI=          # Neon Postgres connection string
PAYLOAD_SECRET=        # Random string for auth/encryption
BLOB_READ_WRITE_TOKEN= # Vercel Blob token
RESEND_API_KEY=        # Unchanged
CONTACT_EMAIL=         # Unchanged
```

## Files Removed

```
sanity.config.ts
sanity/schema.ts
sanity/schemas/work.ts
sanity/schemas/project.ts
sanity/schemas/blogPost.ts
sanity/schemas/siteSettings.ts
sanity/schemas/mediaItem.ts
lib/sanity/client.ts
lib/sanity/queries.ts
lib/sanity/types.ts
lib/sanity/image.ts
lib/dummy-data.ts              # After Payload collections are wired in
app/studio/[[...tool]]/layout.tsx
app/studio/[[...tool]]/page.tsx
components/portable-text.tsx    # Replaced by Payload's Lexical rich text renderer
```

## Files Added

```
payload.config.ts               # Root config: collections, globals, plugins, db adapter
collections/Work.ts             # Work collection config
collections/Projects.ts         # Projects collection config
collections/BlogPosts.ts        # Blog posts collection config
collections/Media.ts            # Media/uploads collection config
globals/SiteSettings.ts         # Site settings global config
lib/payload/queries.ts          # Helper functions wrapping Payload Local API
app/(payload)/admin/[[...segments]]/page.tsx   # Admin panel route
app/(payload)/layout.tsx        # Payload admin layout (no site chrome)
```

## Payload Collections

### Work

| Field | Type | Notes |
|---|---|---|
| title | text (required) | |
| slug | text (auto from title, unique, indexed) | |
| client | text (optional) | |
| description | richText (Lexical) | |
| coverImage | upload (Media) | Required |
| categories | select (multiple) | "AI & Production", "Video Production", "AI Films", "Music", "Comics & Writing" |
| tags | array of text | Freeform |
| media | array of { type: select, url: text } | YouTube/Vimeo/Spotify/SoundCloud |
| externalLink | text (URL) | Optional |
| featured | checkbox | Default false |
| sortOrder | number | |
| date | date | |

Admin config: default sort by `-sortOrder`, list columns: title, client, featured, date.

### Projects

| Field | Type | Notes |
|---|---|---|
| title | text (required) | |
| slug | text (auto from title, unique, indexed) | |
| description | richText (Lexical) | |
| coverImage | upload (Media) | Required |
| logo | upload (Media) | Optional |
| status | select | "active", "archived", "paused" |
| links | array of { label: text, url: text } | |
| tags | array of text | |
| featured | checkbox | Default false |
| sortOrder | number | |

Admin config: default sort by `-sortOrder`, list columns: title, status, featured.

### Blog Posts

| Field | Type | Notes |
|---|---|---|
| title | text (required) | |
| slug | text (auto from title, unique, indexed) | |
| coverImage | upload (Media) | |
| body | richText (Lexical) | With image upload, code blocks enabled |
| excerpt | textarea | For cards and meta description |
| date | date | |
| tags | array of text | |

SEO fields via `@payloadcms/plugin-seo`: metaTitle, metaDescription, ogImage. Applied to this collection only.

Admin config: default sort by `-date`, list columns: title, date, tags.

### Media (Uploads)

| Field | Type | Notes |
|---|---|---|
| alt | text | Alt text for accessibility |

Payload's built-in upload collection handles filename, mimeType, filesize, width, height, URL automatically. Stored on Vercel Blob via storage adapter.

Image sizes config:
- `thumbnail`: 400x300, fit cover
- `card`: 800x600, fit cover
- `hero`: 1920x1080, fit cover

### Site Settings (Global)

| Field | Type | Notes |
|---|---|---|
| heroHeadline | text | |
| heroTagline | text | |
| heroBackground | upload (Media) | Image or video |
| aboutBio | richText (Lexical) | |
| aboutPhoto | upload (Media) | |
| profilePhoto | upload (Media) | Nav, footer, OG fallback |
| socialLinks | array of { platform: select, url: text } | Platforms: LinkedIn, Instagram, X, YouTube, GitHub, Behance |
| googleAnalyticsId | text | |

## Data Fetching

All pages use Payload's Local API (in-process, no HTTP overhead):

```ts
import { getPayload } from 'payload'
import config from '@payload-config'

// In any server component:
const payload = await getPayload({ config })
```

### Query Helper Functions (`lib/payload/queries.ts`)

```ts
getSiteSettings()              → payload.findGlobal({ slug: 'site-settings' })
getAllWork()                    → payload.find({ collection: 'work', sort: '-sortOrder', limit: 100 })
getFeaturedWork()              → payload.find({ collection: 'work', where: { featured: { equals: true } }, sort: '-sortOrder' })
getWorkBySlug(slug)            → payload.find({ collection: 'work', where: { slug: { equals: slug } }, limit: 1 })
getAllProjects()                → payload.find({ collection: 'projects', sort: '-sortOrder', limit: 100 })
getFeaturedProjects()           → payload.find({ collection: 'projects', where: { featured: { equals: true } }, sort: '-sortOrder' })
getProjectBySlug(slug)          → payload.find({ collection: 'projects', where: { slug: { equals: slug } }, limit: 1 })
getAllBlogPosts()               → payload.find({ collection: 'blog-posts', sort: '-date', limit: 100 })
getRecentBlogPosts(count)       → payload.find({ collection: 'blog-posts', sort: '-date', limit: count })
getBlogPostBySlug(slug)         → payload.find({ collection: 'blog-posts', where: { slug: { equals: slug } }, limit: 1 })
```

### Page Integration

| Page | Data Source |
|---|---|
| Home | `getFeaturedWork()`, `getFeaturedProjects()`, `getRecentBlogPosts(3)`, `getSiteSettings()` |
| Work listing | `getAllWork()` — category filter remains client-side |
| Work detail | `getWorkBySlug(params.slug)` |
| Projects listing | `getAllProjects()` |
| Project detail | `getProjectBySlug(params.slug)` |
| Blog listing | `getAllBlogPosts()` |
| Blog detail | `getBlogPostBySlug(params.slug)` |
| About | `getSiteSettings()` (aboutBio, aboutPhoto, profilePhoto) |
| Contact | No CMS data (form only, Resend unchanged) |
| Services | No CMS data (coming soon placeholder) |
| Layout (nav/footer) | `getSiteSettings()` (profilePhoto, socialLinks) |

### Static Generation

`generateStaticParams` on all `[slug]` pages queries Payload for all slugs in the collection. Same pattern as the existing (unused) Sanity approach.

### Rich Text Rendering

Payload's Lexical rich text outputs serializable JSON. Use `@payloadcms/richtext-lexical/react` to render in server components. This replaces `portable-text.tsx`. Code blocks in blog posts supported via Lexical's code node.

## Routing

### Removed
- `/studio` — Sanity Studio

### Added
- `/admin` — Payload admin panel (via `app/(payload)/admin/[[...segments]]/page.tsx`)

The `(payload)` route group uses its own layout with no site nav/footer, same pattern as the old `studio` route.

`robots.ts` updated to disallow `/admin` instead of `/studio`.

## SEO & Feeds

- `generateMetadata` on all pages — unchanged approach, just reads from Payload instead of dummy data
- Blog posts use SEO plugin fields with fallback to title/excerpt/coverImage
- `sitemap.ts` queries Payload for all slugs
- RSS feed at `/feed.xml` queries Payload for blog posts
- `next/image` uses Vercel Blob URLs (no special loader needed — standard URLs)

## Migration Path

1. Remove all Sanity files, packages, and config
2. Install Payload packages and configure
3. Define collections and globals matching current content types
4. Set up Neon Postgres database and Vercel Blob storage
5. Create query helper functions
6. Update each page to use Payload queries instead of dummy data imports
7. Update rich text rendering (Lexical instead of Portable Text)
8. Update sitemap, RSS feed, robots.txt
9. Seed initial content from dummy data via Payload admin or seed script
10. Remove `dummy-data.ts`
11. Clean up any remaining Sanity references (env vars, next.config image patterns, etc.)

## Future Considerations

- Payload has built-in draft/preview support — can be enabled later for content previewing
- Payload has access control — can add collaborators later if needed
- Collections can be extended with new fields without migration hassle
- `/services` and `/shop` routes can be added as new collections when ready
