# Payload CMS Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Sanity CMS with Payload CMS v3 so the site uses a clean, WordPress-like admin panel for content management, all deployed on Vercel.

**Architecture:** Payload CMS v3 installed into the existing Next.js 15 app. Admin panel at `/admin` via `(payload)` route group. Postgres via Neon for data, Vercel Blob for media. Pages query Payload's Local API directly in server components. No frontend/styling changes.

**Tech Stack:** Next.js 15, Payload CMS v3, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, `@payloadcms/storage-vercel-blob`, Neon Postgres, Tailwind CSS, Resend

**Spec:** `docs/superpowers/specs/2026-04-02-payload-cms-migration-design.md`

---

## File Map

### Removed

- `sanity.config.ts`
- `sanity/schema.ts`
- `sanity/schemas/work.ts`
- `sanity/schemas/project.ts`
- `sanity/schemas/blogPost.ts`
- `sanity/schemas/siteSettings.ts`
- `sanity/schemas/mediaItem.ts`
- `lib/sanity/client.ts`
- `lib/sanity/queries.ts`
- `lib/sanity/types.ts`
- `lib/sanity/image.ts`
- `app/studio/[[...tool]]/layout.tsx`
- `app/studio/[[...tool]]/page.tsx`
- `components/portable-text.tsx`

### Created

- `payload.config.ts` — Payload root config (collections, globals, db, storage, plugins)
- `collections/Media.ts` — Upload collection for images
- `collections/Work.ts` — Work collection
- `collections/Projects.ts` — Projects collection
- `collections/BlogPosts.ts` — Blog posts collection
- `globals/SiteSettings.ts` — Site settings global
- `lib/payload/queries.ts` — Query helper functions wrapping Local API
- `lib/payload/types.ts` — TypeScript types for Payload documents
- `app/(payload)/admin/[[...segments]]/page.tsx` — Payload admin route
- `app/(payload)/layout.tsx` — Admin layout (no site chrome)
- `app/(payload)/custom.scss` — Payload admin custom styles (empty, required by config)
- `components/rich-text.tsx` — Lexical rich text renderer for frontend

### Modified

- `package.json` — swap Sanity deps for Payload deps
- `next.config.mjs` — remove Sanity CDN image pattern, add Payload webpack config
- `.env.local` — replace Sanity vars with Payload vars
- `tsconfig.json` — add `@payload-config` path alias
- `app/(site)/page.tsx` — use Payload queries instead of dummy data
- `app/(site)/work/page.tsx` — use Payload queries
- `app/(site)/work/[slug]/page.tsx` — use Payload queries + rich text
- `app/(site)/projects/page.tsx` — use Payload queries
- `app/(site)/projects/[slug]/page.tsx` — use Payload queries + rich text
- `app/(site)/blog/page.tsx` — use Payload queries
- `app/(site)/blog/[slug]/page.tsx` — use Payload queries + rich text
- `app/(site)/about/page.tsx` — use Payload queries for bio/photo
- `app/sitemap.ts` — use Payload queries
- `app/feed.xml/route.ts` — use Payload queries
- `app/robots.ts` — disallow `/admin` instead of `/studio`
- `components/work-card.tsx` — update type imports
- `components/project-card.tsx` — update type imports
- `components/blog-card.tsx` — update type imports

---

## Task 1: Remove Sanity — files, packages, config

**Files:**
- Delete: `sanity.config.ts`, `sanity/schema.ts`, `sanity/schemas/*.ts`, `lib/sanity/*.ts`, `app/studio/[[...tool]]/*.tsx`, `components/portable-text.tsx`
- Modify: `package.json`, `next.config.mjs`, `.env.local`

- [ ] **Step 1: Delete all Sanity files**

```bash
rm sanity.config.ts
rm -rf sanity/
rm -rf lib/sanity/
rm -rf "app/studio/"
rm components/portable-text.tsx
```

- [ ] **Step 2: Remove Sanity packages from package.json**

Remove these from `dependencies` in `package.json`:
- `@portabletext/react`
- `@sanity/code-input`
- `@sanity/image-url`
- `@sanity/vision`
- `next-sanity`
- `sanity`
- `styled-components`

Run:
```bash
npm uninstall @portabletext/react @sanity/code-input @sanity/image-url @sanity/vision next-sanity sanity styled-components
```

- [ ] **Step 3: Clean next.config.mjs**

Replace the entire contents of `next.config.mjs` with:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

This removes the `cdn.sanity.io` remote image pattern. We'll add Payload-specific config in Task 2.

- [ ] **Step 4: Clean .env.local**

Replace the Sanity env vars. The file should become:

```
DATABASE_URI=
PAYLOAD_SECRET=
BLOB_READ_WRITE_TOKEN=
RESEND_API_KEY=
CONTACT_EMAIL=omar@omarkamel.com
```

Leave `DATABASE_URI`, `PAYLOAD_SECRET`, and `BLOB_READ_WRITE_TOKEN` empty for now — we'll fill them in after setting up Neon and Vercel Blob.

- [ ] **Step 5: Temporarily update dummy-data.ts imports**

The dummy data file imports types from the now-deleted `lib/sanity/types.ts`. Remove the import and inline the type references so the app still compiles. Change line 1 of `lib/dummy-data.ts` from:

```typescript
import type { SiteSettings, Work, Project, BlogPost } from "./sanity/types";
```

to:

```typescript
// Types will be replaced by Payload types in a later task.
// For now, define minimal interfaces to keep the app compiling.
interface MediaEmbed {
  type: "youtube" | "vimeo" | "soundcloud" | "spotify";
  url: string;
}

interface Work {
  _id: string;
  title: string;
  slug: { current: string };
  client?: string;
  categories?: string[];
  tags?: string[];
  media?: MediaEmbed[];
  externalLink?: string;
  featured?: boolean;
  sortOrder?: number;
  date?: string;
}

interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  status?: "active" | "archived" | "paused";
  links?: { label: string; url: string }[];
  tags?: string[];
  featured?: boolean;
  sortOrder?: number;
}

interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  date?: string;
  tags?: string[];
  seo?: { metaTitle?: string; metaDescription?: string };
}

interface SiteSettings {
  heroHeadline?: string;
  heroTagline?: string;
  socialLinks?: { platform: string; url: string }[];
}
```

- [ ] **Step 6: Update component type imports**

The card components and the project detail page import from `@/lib/sanity/types`. Update them to import from `@/lib/dummy-data` temporarily.

In `components/work-card.tsx`, change:
```typescript
import { Work } from "@/lib/sanity/types";
```
to:
```typescript
import type { Work } from "@/lib/sanity/types";
```

Wait — the types file is deleted. Instead, we need to export the temporary types from dummy-data.ts. Update `lib/dummy-data.ts` to add `export` before each `interface`:

```typescript
export interface MediaEmbed { ... }
export interface Work { ... }
export interface Project { ... }
export interface BlogPost { ... }
export interface SiteSettings { ... }
```

Then update the imports in these files:

`components/work-card.tsx` line 3:
```typescript
import { Work } from "@/lib/dummy-data";
```

`components/project-card.tsx` line 3:
```typescript
import { Project } from "@/lib/dummy-data";
```

`components/blog-card.tsx` line 4:
```typescript
import { BlogPost } from "@/lib/dummy-data";
```

`app/(site)/projects/[slug]/page.tsx` line 6:
```typescript
import type { Project } from "@/lib/dummy-data";
```

- [ ] **Step 7: Verify the app still compiles**

```bash
npx next build
```

Expected: Build succeeds. All pages render using dummy data. No Sanity references remain.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: remove Sanity CMS — files, packages, and config"
```

---

## Task 2: Install Payload CMS and configure

**Files:**
- Modify: `package.json`, `tsconfig.json`, `next.config.mjs`
- Create: `payload.config.ts`, `app/(payload)/admin/[[...segments]]/page.tsx`, `app/(payload)/layout.tsx`, `app/(payload)/custom.scss`

- [ ] **Step 1: Install Payload packages**

```bash
npm install payload@latest @payloadcms/next@latest @payloadcms/db-postgres@latest @payloadcms/richtext-lexical@latest @payloadcms/storage-vercel-blob@latest @payloadcms/plugin-seo@latest
```

- [ ] **Step 2: Add path alias to tsconfig.json**

Add a `@payload-config` path alias to the `paths` object in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@payload-config": ["./payload.config.ts"]
    }
  }
}
```

- [ ] **Step 3: Update next.config.mjs for Payload**

Replace `next.config.mjs` with:

```javascript
import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPayload(nextConfig);
```

- [ ] **Step 4: Create payload.config.ts**

Create `payload.config.ts` at the project root:

```typescript
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { seoPlugin } from "@payloadcms/plugin-seo";
import path from "path";
import { fileURLToPath } from "url";

import { Media } from "./collections/Media";
import { Work } from "./collections/Work";
import { Projects } from "./collections/Projects";
import { BlogPosts } from "./collections/BlogPosts";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  editor: lexicalEditor(),
  collections: [Media, Work, Projects, BlogPosts],
  globals: [SiteSettings],
  secret: process.env.PAYLOAD_SECRET || "DEVELOPMENT-SECRET-CHANGE-ME",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || "",
    }),
    seoPlugin({
      collections: ["blog-posts"],
      uploadsCollection: "media",
      generateTitle: ({ doc }) =>
        `${(doc as { title?: string }).title ?? ""} | Omar Kamel`,
      generateDescription: ({ doc }) =>
        (doc as { excerpt?: string }).excerpt ?? "",
    }),
  ],
  admin: {
    user: "users",
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
});
```

Wait — Payload v3 requires a `users` collection for auth. We need to add one. Update the config to include it, and we'll create the collection file in the next step.

Actually, let me revise. Payload v3 requires an auth collection. Add a minimal Users collection inline for now:

```typescript
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { seoPlugin } from "@payloadcms/plugin-seo";
import path from "path";
import { fileURLToPath } from "url";

import { Media } from "./collections/Media";
import { Work } from "./collections/Work";
import { Projects } from "./collections/Projects";
import { BlogPosts } from "./collections/BlogPosts";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  editor: lexicalEditor(),
  collections: [
    {
      slug: "users",
      auth: true,
      admin: { useAsTitle: "email" },
      fields: [],
    },
    Media,
    Work,
    Projects,
    BlogPosts,
  ],
  globals: [SiteSettings],
  secret: process.env.PAYLOAD_SECRET || "DEVELOPMENT-SECRET-CHANGE-ME",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || "",
    }),
    seoPlugin({
      collections: ["blog-posts"],
      uploadsCollection: "media",
      generateTitle: ({ doc }) =>
        `${(doc as { title?: string }).title ?? ""} | Omar Kamel`,
      generateDescription: ({ doc }) =>
        (doc as { excerpt?: string }).excerpt ?? "",
    }),
  ],
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
});
```

- [ ] **Step 5: Create Payload admin route**

Create `app/(payload)/layout.tsx`:

```tsx
import "@payloadcms/next/css";
import type React from "react";
import "./custom.scss";

export const metadata = {
  title: "Admin — Omar Kamel",
};

export default function PayloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

Create `app/(payload)/custom.scss`:

```scss
// Custom Payload admin styles — add overrides here if needed
```

Create `app/(payload)/admin/[[...segments]]/page.tsx`:

```tsx
import type { AdminViewProps } from "payload";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import { importMap } from "../importMap";
import config from "@payload-config";

export const generateMetadata = ({ params, searchParams }: AdminViewProps) =>
  generatePageMetadata({ config, params, searchParams });

const Page = ({ params, searchParams }: AdminViewProps) =>
  RootPage({ config, params, searchParams, importMap });

export default Page;
```

Create `app/(payload)/admin/importMap.js`:

```javascript
// This file is auto-generated by Payload. Do not modify manually.
// Run `payload generate:importmap` to regenerate.
export const importMap = {};
```

- [ ] **Step 6: Verify Payload installs cleanly**

The app won't fully start yet (no database, no collections defined), but verify that packages installed correctly and TypeScript doesn't complain about the config:

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | head -20
```

Expected: May show some errors about missing collection files (we create them next). No errors about Payload imports.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: install Payload CMS v3 and create base config"
```

---

## Task 3: Define Media collection

**Files:**
- Create: `collections/Media.ts`

- [ ] **Step 1: Create Media collection**

Create `collections/Media.ts`:

```typescript
import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ["image/*", "video/*"],
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 800,
        height: 600,
        position: "centre",
      },
      {
        name: "hero",
        width: 1920,
        height: 1080,
        position: "centre",
      },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add collections/Media.ts
git commit -m "feat: add Payload Media upload collection"
```

---

## Task 4: Define Work collection

**Files:**
- Create: `collections/Work.ts`

- [ ] **Step 1: Create Work collection**

Create `collections/Work.ts`:

```typescript
import type { CollectionConfig } from "payload";

export const Work: CollectionConfig = {
  slug: "work",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "client", "featured", "date"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "client",
      type: "text",
    },
    {
      name: "description",
      type: "richText",
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "categories",
      type: "select",
      hasMany: true,
      options: [
        { label: "AI & Production", value: "AI & Production" },
        { label: "Video Production", value: "Video Production" },
        { label: "AI Films", value: "AI Films" },
        { label: "Music", value: "Music" },
        { label: "Comics & Writing", value: "Comics & Writing" },
      ],
    },
    {
      name: "tags",
      type: "array",
      fields: [
        {
          name: "tag",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "media",
      type: "array",
      fields: [
        {
          name: "type",
          type: "select",
          required: true,
          options: [
            { label: "YouTube", value: "youtube" },
            { label: "Vimeo", value: "vimeo" },
            { label: "SoundCloud", value: "soundcloud" },
            { label: "Spotify", value: "spotify" },
          ],
        },
        {
          name: "url",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "externalLink",
      type: "text",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "date",
      type: "date",
      admin: {
        position: "sidebar",
      },
    },
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add collections/Work.ts
git commit -m "feat: add Payload Work collection"
```

---

## Task 5: Define Projects collection

**Files:**
- Create: `collections/Projects.ts`

- [ ] **Step 1: Create Projects collection**

Create `collections/Projects.ts`:

```typescript
import type { CollectionConfig } from "payload";

export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "featured"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "description",
      type: "richText",
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Paused", value: "paused" },
        { label: "Archived", value: "archived" },
      ],
      defaultValue: "active",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "links",
      type: "array",
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
        },
        {
          name: "url",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "tags",
      type: "array",
      fields: [
        {
          name: "tag",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      admin: {
        position: "sidebar",
      },
    },
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add collections/Projects.ts
git commit -m "feat: add Payload Projects collection"
```

---

## Task 6: Define BlogPosts collection

**Files:**
- Create: `collections/BlogPosts.ts`

- [ ] **Step 1: Create BlogPosts collection**

Create `collections/BlogPosts.ts`:

```typescript
import type { CollectionConfig } from "payload";

export const BlogPosts: CollectionConfig = {
  slug: "blog-posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "date", "tags"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "body",
      type: "richText",
    },
    {
      name: "excerpt",
      type: "textarea",
    },
    {
      name: "date",
      type: "date",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "tags",
      type: "array",
      fields: [
        {
          name: "tag",
          type: "text",
          required: true,
        },
      ],
    },
  ],
};
```

Note: The SEO fields (metaTitle, metaDescription, ogImage) are automatically added by the `@payloadcms/plugin-seo` configured in `payload.config.ts`.

- [ ] **Step 2: Commit**

```bash
git add collections/BlogPosts.ts
git commit -m "feat: add Payload BlogPosts collection"
```

---

## Task 7: Define SiteSettings global

**Files:**
- Create: `globals/SiteSettings.ts`

- [ ] **Step 1: Create SiteSettings global**

Create `globals/SiteSettings.ts`:

```typescript
import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "heroHeadline",
      type: "text",
      label: "Hero Headline",
    },
    {
      name: "heroTagline",
      type: "text",
      label: "Hero Tagline",
    },
    {
      name: "heroBackground",
      type: "upload",
      relationTo: "media",
      label: "Hero Background",
    },
    {
      name: "aboutBio",
      type: "richText",
      label: "About Bio",
    },
    {
      name: "aboutPhoto",
      type: "upload",
      relationTo: "media",
      label: "About Photo",
    },
    {
      name: "profilePhoto",
      type: "upload",
      relationTo: "media",
      label: "Profile Photo",
    },
    {
      name: "socialLinks",
      type: "array",
      fields: [
        {
          name: "platform",
          type: "select",
          required: true,
          options: [
            { label: "LinkedIn", value: "LinkedIn" },
            { label: "Instagram", value: "Instagram" },
            { label: "X", value: "X" },
            { label: "YouTube", value: "YouTube" },
            { label: "GitHub", value: "GitHub" },
            { label: "Behance", value: "Behance" },
          ],
        },
        {
          name: "url",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "googleAnalyticsId",
      type: "text",
      label: "Google Analytics ID",
      admin: {
        position: "sidebar",
      },
    },
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add globals/SiteSettings.ts
git commit -m "feat: add Payload SiteSettings global"
```

---

## Task 8: Create query helpers and types

**Files:**
- Create: `lib/payload/queries.ts`, `lib/payload/types.ts`

- [ ] **Step 1: Create Payload types**

Create `lib/payload/types.ts`:

```typescript
// Types for Payload documents as returned by the Local API.
// These mirror the collection shapes and are used by page components.

export interface MediaUpload {
  id: string;
  alt: string;
  url: string;
  width?: number;
  height?: number;
  sizes?: {
    thumbnail?: { url: string; width: number; height: number };
    card?: { url: string; width: number; height: number };
    hero?: { url: string; width: number; height: number };
  };
}

export interface MediaEmbed {
  type: "youtube" | "vimeo" | "soundcloud" | "spotify";
  url: string;
}

export interface WorkDoc {
  id: string;
  title: string;
  slug: string;
  client?: string | null;
  description?: unknown; // Lexical rich text JSON
  coverImage: MediaUpload | string;
  categories?: string[] | null;
  tags?: { tag: string }[] | null;
  media?: MediaEmbed[] | null;
  externalLink?: string | null;
  featured?: boolean | null;
  sortOrder?: number | null;
  date?: string | null;
}

export interface ProjectDoc {
  id: string;
  title: string;
  slug: string;
  description?: unknown; // Lexical rich text JSON
  coverImage: MediaUpload | string;
  logo?: MediaUpload | string | null;
  status?: "active" | "paused" | "archived" | null;
  links?: { label: string; url: string }[] | null;
  tags?: { tag: string }[] | null;
  featured?: boolean | null;
  sortOrder?: number | null;
}

export interface BlogPostDoc {
  id: string;
  title: string;
  slug: string;
  coverImage?: MediaUpload | string | null;
  body?: unknown; // Lexical rich text JSON
  excerpt?: string | null;
  date?: string | null;
  tags?: { tag: string }[] | null;
  meta?: {
    title?: string | null;
    description?: string | null;
    image?: MediaUpload | string | null;
  } | null;
}

export interface SiteSettingsDoc {
  heroHeadline?: string | null;
  heroTagline?: string | null;
  heroBackground?: MediaUpload | string | null;
  aboutBio?: unknown; // Lexical rich text JSON
  aboutPhoto?: MediaUpload | string | null;
  profilePhoto?: MediaUpload | string | null;
  socialLinks?: { platform: string; url: string }[] | null;
  googleAnalyticsId?: string | null;
}
```

- [ ] **Step 2: Create query helper functions**

Create `lib/payload/queries.ts`:

```typescript
import { getPayload } from "payload";
import config from "@payload-config";
import type {
  WorkDoc,
  ProjectDoc,
  BlogPostDoc,
  SiteSettingsDoc,
} from "./types";

async function getPayloadClient() {
  return getPayload({ config });
}

// ─── Site Settings ──────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettingsDoc> {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "site-settings" }) as Promise<SiteSettingsDoc>;
}

// ─── Work ───────────────────────────────────────────────────────

export async function getAllWork(): Promise<WorkDoc[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "work",
    sort: "-sortOrder",
    limit: 100,
    depth: 1,
  });
  return result.docs as unknown as WorkDoc[];
}

export async function getFeaturedWork(): Promise<WorkDoc[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "work",
    where: { featured: { equals: true } },
    sort: "-sortOrder",
    limit: 100,
    depth: 1,
  });
  return result.docs as unknown as WorkDoc[];
}

export async function getWorkBySlug(slug: string): Promise<WorkDoc | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "work",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });
  return (result.docs[0] as unknown as WorkDoc) ?? null;
}

export async function getAllWorkSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "work",
    limit: 1000,
    depth: 0,
  });
  return (result.docs as unknown as WorkDoc[]).map((d) => d.slug);
}

// ─── Projects ───────────────────────────────────────────────────

export async function getAllProjects(): Promise<ProjectDoc[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "projects",
    sort: "-sortOrder",
    limit: 100,
    depth: 1,
  });
  return result.docs as unknown as ProjectDoc[];
}

export async function getFeaturedProjects(): Promise<ProjectDoc[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "projects",
    where: { featured: { equals: true } },
    sort: "-sortOrder",
    limit: 100,
    depth: 1,
  });
  return result.docs as unknown as ProjectDoc[];
}

export async function getProjectBySlug(
  slug: string
): Promise<ProjectDoc | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "projects",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });
  return (result.docs[0] as unknown as ProjectDoc) ?? null;
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "projects",
    limit: 1000,
    depth: 0,
  });
  return (result.docs as unknown as ProjectDoc[]).map((d) => d.slug);
}

// ─── Blog Posts ─────────────────────────────────────────────────

export async function getAllBlogPosts(): Promise<BlogPostDoc[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "blog-posts",
    sort: "-date",
    limit: 100,
    depth: 1,
  });
  return result.docs as unknown as BlogPostDoc[];
}

export async function getRecentBlogPosts(
  count: number
): Promise<BlogPostDoc[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "blog-posts",
    sort: "-date",
    limit: count,
    depth: 1,
  });
  return result.docs as unknown as BlogPostDoc[];
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPostDoc | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "blog-posts",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });
  return (result.docs[0] as unknown as BlogPostDoc) ?? null;
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "blog-posts",
    limit: 1000,
    depth: 0,
  });
  return (result.docs as unknown as BlogPostDoc[]).map((d) => d.slug);
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/payload/
git commit -m "feat: add Payload query helpers and types"
```

---

## Task 9: Create rich text renderer component

**Files:**
- Create: `components/rich-text.tsx`

- [ ] **Step 1: Create rich text renderer**

Create `components/rich-text.tsx`:

```tsx
import {
  type JSXConvertersFunction,
  RichText as PayloadRichText,
} from "@payloadcms/richtext-lexical/react";

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
});

interface RichTextProps {
  data: unknown;
  className?: string;
}

export function RichText({ data, className }: RichTextProps) {
  if (!data) return null;

  return (
    <div className={className ?? "prose prose-lg max-w-none text-gray-700 leading-relaxed"}>
      <PayloadRichText
        data={data}
        converters={converters}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/rich-text.tsx
git commit -m "feat: add Lexical rich text renderer component"
```

---

## Task 10: Wire up pages — Homepage

**Files:**
- Modify: `app/(site)/page.tsx`

- [ ] **Step 1: Update homepage to use Payload queries**

Replace the entire contents of `app/(site)/page.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/hero";
import WorkCard from "@/components/work-card";
import ProjectCard from "@/components/project-card";
import BlogCard from "@/components/blog-card";
import SectionHeading from "@/components/section-heading";
import FadeIn from "@/components/fade-in";
import {
  getSiteSettings,
  getFeaturedWork,
  getFeaturedProjects,
  getRecentBlogPosts,
} from "@/lib/payload/queries";

export default async function HomePage() {
  const [settings, featuredWork, featuredProjects, recentPosts] =
    await Promise.all([
      getSiteSettings(),
      getFeaturedWork(),
      getFeaturedProjects(),
      getRecentBlogPosts(3),
    ]);

  return (
    <>
      <Hero
        headline={settings.heroHeadline || "Omar Kamel"}
        tagline={
          settings.heroTagline || "AI Creative & Production Lead"
        }
      />

      <section className="max-w-7xl mx-auto px-6 py-24">
        <FadeIn>
          <SectionHeading
            title="Work"
            subtitle="Selected projects across brand, film, music, and emerging media."
          />
        </FadeIn>

        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredWork.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </FadeIn>

        <FadeIn className="mt-10">
          <Link
            href="/work"
            className="link-underline text-brick font-medium text-sm uppercase tracking-wider"
          >
            View all work
          </Link>
        </FadeIn>
      </section>

      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <SectionHeading
              title="Projects"
              subtitle="Side ventures, tools, and ongoing experiments."
            />
          </FadeIn>

          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </FadeIn>

          <FadeIn className="mt-10">
            <Link
              href="/projects"
              className="link-underline text-brick font-medium text-sm uppercase tracking-wider"
            >
              View all projects
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <FadeIn>
          <SectionHeading
            title="Latest"
            subtitle="Thoughts on AI, production, and creative work."
          />
        </FadeIn>

        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </FadeIn>

        <FadeIn className="mt-10">
          <Link
            href="/blog"
            className="link-underline text-brick font-medium text-sm uppercase tracking-wider"
          >
            Read more
          </Link>
        </FadeIn>
      </section>

      <section className="bg-black text-white py-24">
        <FadeIn>
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-bold">
              Let&apos;s Work Together
            </h2>
            <p className="text-gray-300 text-lg mt-4">
              Have a project in mind? I&apos;d love to hear about it.
            </p>
            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-block bg-brick text-white px-8 py-3 text-sm font-medium uppercase tracking-wider hover:bg-brick/90 transition-colors"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(site)/page.tsx"
git commit -m "feat: wire homepage to Payload CMS"
```

---

## Task 11: Wire up pages — Work listing and detail

**Files:**
- Modify: `app/(site)/work/page.tsx`, `app/(site)/work/[slug]/page.tsx`, `components/work-card.tsx`

- [ ] **Step 1: Update WorkCard component types**

Replace `components/work-card.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import TagBadge from "./tag-badge";
import type { WorkDoc, MediaUpload } from "@/lib/payload/types";

interface WorkCardProps {
  work: WorkDoc;
}

export default function WorkCard({ work }: WorkCardProps) {
  const cover =
    typeof work.coverImage === "object" ? work.coverImage : null;

  return (
    <Link href={`/work/${work.slug}`} className="group block">
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden rounded-sm">
        {cover?.url ? (
          <Image
            src={cover.sizes?.card?.url ?? cover.url}
            alt={cover.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm font-medium px-4 text-center">
            {work.title}
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
      </div>

      <div className="mt-3 space-y-1">
        {work.client && (
          <p className="text-xs uppercase tracking-wider text-gray-500">
            {work.client}
          </p>
        )}

        <h3 className="font-serif text-xl font-semibold group-hover:text-brick transition-colors">
          {work.title}
        </h3>

        {work.categories && work.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {work.categories.map((category) => (
              <TagBadge key={category} label={category} variant="category" />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Update work listing page**

Replace `app/(site)/work/page.tsx`:

```tsx
import type { Metadata } from "next";
import WorkCard from "@/components/work-card";
import CategoryFilter from "@/components/category-filter";
import SectionHeading from "@/components/section-heading";
import FadeIn from "@/components/fade-in";
import { getAllWork } from "@/lib/payload/queries";

export const metadata: Metadata = {
  title: "Work",
  description:
    "A selection of work spanning AI production, video, music, and comics — built across 20+ years in Cairo, Italy, and Dubai.",
};

interface WorkPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function WorkPage({ searchParams }: WorkPageProps) {
  const { category } = await searchParams;
  const allWork = await getAllWork();

  const filtered = category
    ? allWork.filter((w) =>
        w.categories?.some(
          (c) => c.toLowerCase() === category.toLowerCase()
        )
      )
    : allWork;

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <SectionHeading
            title="Work"
            subtitle="AI production, video, music, and comics."
          />
        </FadeIn>

        <CategoryFilter />

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((work) => (
              <FadeIn key={work.id}>
                <WorkCard work={work} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No work found in this category.
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update work detail page**

Replace `app/(site)/work/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import TagBadge from "@/components/tag-badge";
import MediaEmbedComponent from "@/components/media-embed";
import { RichText } from "@/components/rich-text";
import { getWorkBySlug, getAllWorkSlugs } from "@/lib/payload/queries";
import type { MediaUpload } from "@/lib/payload/types";
import { formatDate } from "@/lib/utils";

interface WorkDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) return {};
  return {
    title: work.client ? `${work.title} — ${work.client}` : work.title,
    description: `${work.title}${work.client ? ` for ${work.client}` : ""}. ${work.categories?.join(", ") ?? ""}`,
  };
}

export async function generateStaticParams() {
  const slugs = await getAllWorkSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function WorkDetailPage({
  params,
}: WorkDetailPageProps) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) notFound();

  const cover =
    typeof work.coverImage === "object" ? work.coverImage : null;
  const tags = work.tags?.map((t) => t.tag) ?? [];

  return (
    <div className="pt-24 pb-16">
      {cover?.url ? (
        <div className="relative aspect-[21/9] w-full">
          <Image
            src={cover.sizes?.hero?.url ?? cover.url}
            alt={cover.alt}
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="aspect-[21/9] bg-gray-200 w-full flex items-center justify-center text-gray-400 text-lg font-medium">
          {work.title}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/work"
          className="text-sm text-gray-500 hover:text-brick transition-colors inline-block mb-8"
        >
          &larr; Back to Work
        </Link>

        {work.client && (
          <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
            {work.client}
          </p>
        )}

        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
          {work.title}
        </h1>

        {work.date && (
          <p className="text-sm text-gray-500 mb-6">
            {formatDate(work.date)}
          </p>
        )}

        {work.categories && work.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {work.categories.map((cat) => (
              <TagBadge key={cat} label={cat} variant="category" />
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map((tag) => (
              <TagBadge key={tag} label={tag} />
            ))}
          </div>
        )}

        {work.description && (
          <RichText data={work.description} className="mb-10" />
        )}

        {work.media && work.media.length > 0 && (
          <div className="space-y-6 mb-10">
            {work.media.map((embed, i) => (
              <MediaEmbedComponent key={i} embed={embed} />
            ))}
          </div>
        )}

        {work.externalLink && (
          <a
            href={work.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-brick text-brick px-6 py-2.5 text-sm font-medium hover:bg-brick hover:text-white transition-colors rounded-sm"
          >
            View Project &rarr;
          </a>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/work-card.tsx "app/(site)/work/"
git commit -m "feat: wire work pages to Payload CMS"
```

---

## Task 12: Wire up pages — Projects listing and detail

**Files:**
- Modify: `app/(site)/projects/page.tsx`, `app/(site)/projects/[slug]/page.tsx`, `components/project-card.tsx`

- [ ] **Step 1: Update ProjectCard component types**

Replace `components/project-card.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import TagBadge from "./tag-badge";
import type { ProjectDoc, MediaUpload } from "@/lib/payload/types";

interface ProjectCardProps {
  project: ProjectDoc;
}

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  archived: "bg-gray-100 text-gray-500",
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const logo =
    typeof project.logo === "object" && project.logo ? project.logo : null;
  const tags = project.tags?.map((t) => t.tag) ?? [];

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block border border-gray-200 rounded-sm p-6 hover:border-brick/30 hover:shadow-sm transition-all"
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
          {logo?.url ? (
            <Image
              src={logo.sizes?.thumbnail?.url ?? logo.url}
              alt={logo.alt}
              width={48}
              height={48}
              className="object-cover"
            />
          ) : (
            <span className="text-gray-500 font-semibold text-lg select-none">
              {project.title.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-xl font-semibold group-hover:text-brick transition-colors">
              {project.title}
            </h3>
            {project.status && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusStyles[project.status] ?? ""}`}
              >
                {project.status}
              </span>
            )}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (
                <TagBadge key={tag} label={tag} />
              ))}
            </div>
          )}

          {project.links && project.links.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {project.links.map((link) => (
                <span
                  key={link.url}
                  className="text-xs text-gray-500 truncate"
                >
                  {link.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Update projects listing page**

Replace `app/(site)/projects/page.tsx`:

```tsx
import type { Metadata } from "next";
import ProjectCard from "@/components/project-card";
import SectionHeading from "@/components/section-heading";
import FadeIn from "@/components/fade-in";
import { getAllProjects } from "@/lib/payload/queries";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Independent projects and side ventures — from VR reviews to journalism and open-source tools.",
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <SectionHeading
            title="Projects"
            subtitle="Independent ventures and ongoing experiments."
          />
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <FadeIn key={project.id}>
              <ProjectCard project={project} />
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update project detail page**

Replace `app/(site)/projects/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import TagBadge from "@/components/tag-badge";
import { RichText } from "@/components/rich-text";
import {
  getProjectBySlug,
  getAllProjectSlugs,
} from "@/lib/payload/queries";
import type { MediaUpload } from "@/lib/payload/types";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  archived: "bg-gray-100 text-gray-500",
};

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const tags = project.tags?.map((t) => t.tag) ?? [];
  return {
    title: project.title,
    description: `${project.title} — ${tags.join(", ")}`,
  };
}

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const cover =
    typeof project.coverImage === "object" ? project.coverImage : null;
  const logo =
    typeof project.logo === "object" && project.logo ? project.logo : null;
  const tags = project.tags?.map((t) => t.tag) ?? [];

  return (
    <div className="pt-24 pb-16">
      {cover?.url ? (
        <div className="relative aspect-[21/9] w-full">
          <Image
            src={cover.sizes?.hero?.url ?? cover.url}
            alt={cover.alt}
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="aspect-[21/9] bg-gray-200 w-full flex items-center justify-center text-gray-400 text-lg font-medium">
          {project.title}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/projects"
          className="text-sm text-gray-500 hover:text-brick transition-colors inline-block mb-8"
        >
          &larr; Back to Projects
        </Link>

        <div className="flex items-center gap-5 mb-6">
          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
            {logo?.url ? (
              <Image
                src={logo.sizes?.thumbnail?.url ?? logo.url}
                alt={logo.alt}
                width={64}
                height={64}
                className="object-cover"
              />
            ) : (
              <span className="text-gray-500 font-semibold text-2xl select-none">
                {project.title.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-4xl md:text-5xl font-bold">
              {project.title}
            </h1>
            {project.status && (
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${statusStyles[project.status] ?? ""}`}
              >
                {project.status}
              </span>
            )}
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map((tag) => (
              <TagBadge key={tag} label={tag} />
            ))}
          </div>
        )}

        {project.description && (
          <RichText data={project.description} className="mb-10" />
        )}

        {project.links && project.links.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {project.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-brick text-brick px-5 py-2 text-sm font-medium hover:bg-brick hover:text-white transition-colors rounded-sm"
              >
                {link.label} &rarr;
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/project-card.tsx "app/(site)/projects/"
git commit -m "feat: wire project pages to Payload CMS"
```

---

## Task 13: Wire up pages — Blog listing and detail

**Files:**
- Modify: `app/(site)/blog/page.tsx`, `app/(site)/blog/[slug]/page.tsx`, `components/blog-card.tsx`

- [ ] **Step 1: Update BlogCard component types**

Replace `components/blog-card.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import TagBadge from "./tag-badge";
import { formatDate } from "@/lib/utils";
import type { BlogPostDoc, MediaUpload } from "@/lib/payload/types";

interface BlogCardProps {
  post: BlogPostDoc;
}

export default function BlogCard({ post }: BlogCardProps) {
  const cover =
    typeof post.coverImage === "object" && post.coverImage
      ? post.coverImage
      : null;
  const tags = post.tags?.map((t) => t.tag) ?? [];

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden rounded-sm">
        {cover?.url ? (
          <Image
            src={cover.sizes?.card?.url ?? cover.url}
            alt={cover.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm font-medium px-4 text-center">
            {post.title}
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        {post.date && (
          <p className="text-xs uppercase tracking-wider text-gray-500">
            {formatDate(post.date)}
          </p>
        )}

        <h3 className="font-serif text-xl font-semibold group-hover:text-brick transition-colors">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {tags.map((tag) => (
              <TagBadge key={tag} label={tag} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Update blog listing page**

Replace `app/(site)/blog/page.tsx`:

```tsx
import type { Metadata } from "next";
import BlogCard from "@/components/blog-card";
import SectionHeading from "@/components/section-heading";
import FadeIn from "@/components/fade-in";
import { getAllBlogPosts } from "@/lib/payload/queries";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Thoughts on AI production, creative technology, storytelling, and building a career at the edge of art and tools.",
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <SectionHeading
            title="Blog"
            subtitle="Reflections on creativity, technology, and the work in between."
          />
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map((post) => (
            <FadeIn key={post.id}>
              <BlogCard post={post} />
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update blog detail page**

Replace `app/(site)/blog/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import TagBadge from "@/components/tag-badge";
import { RichText } from "@/components/rich-text";
import { getBlogPostBySlug, getAllBlogSlugs } from "@/lib/payload/queries";
import type { MediaUpload } from "@/lib/payload/types";
import { formatDate } from "@/lib/utils";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.meta?.title ?? post.title,
    description: post.meta?.description ?? post.excerpt,
    openGraph: {
      type: "article",
      title: post.meta?.title ?? post.title,
      description: post.meta?.description ?? post.excerpt ?? undefined,
      publishedTime: post.date ?? undefined,
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const cover =
    typeof post.coverImage === "object" && post.coverImage
      ? post.coverImage
      : null;
  const tags = post.tags?.map((t) => t.tag) ?? [];

  return (
    <article className="pt-24 pb-16">
      {cover?.url ? (
        <div className="relative aspect-[21/9] w-full">
          <Image
            src={cover.sizes?.hero?.url ?? cover.url}
            alt={cover.alt}
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="aspect-[21/9] bg-gray-200 w-full flex items-center justify-center text-gray-400 text-lg font-medium">
          {post.title}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/blog"
          className="text-sm text-gray-500 hover:text-brick transition-colors inline-block mb-8"
        >
          &larr; Back to Blog
        </Link>

        {post.date && (
          <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">
            {formatDate(post.date)}
          </p>
        )}

        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
          {post.title}
        </h1>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {tags.map((tag) => (
              <TagBadge key={tag} label={tag} />
            ))}
          </div>
        )}

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
          {post.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {post.body && <RichText data={post.body} />}
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/blog-card.tsx "app/(site)/blog/"
git commit -m "feat: wire blog pages to Payload CMS"
```

---

## Task 14: Wire up About page

**Files:**
- Modify: `app/(site)/about/page.tsx`

- [ ] **Step 1: Update about page to fetch from Payload**

Replace `app/(site)/about/page.tsx`:

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import SectionHeading from "@/components/section-heading";
import FadeIn from "@/components/fade-in";
import { RichText } from "@/components/rich-text";
import { getSiteSettings } from "@/lib/payload/queries";
import type { MediaUpload } from "@/lib/payload/types";

export const metadata: Metadata = {
  title: "About",
  description:
    "Omar Kamel — AI Creative & Production Lead with 20+ years across Cairo, Italy, and Dubai. Currently at Optix/Saatchi.",
};

const skills = [
  {
    category: "AI Tools",
    items: [
      "Runway",
      "Midjourney",
      "ComfyUI",
      "Stable Diffusion",
      "ElevenLabs",
      "Suno",
    ],
  },
  {
    category: "Production",
    items: [
      "After Effects",
      "Premiere Pro",
      "DaVinci Resolve",
      "Cinema 4D",
      "Nuke",
    ],
  },
  {
    category: "Creative",
    items: [
      "Photoshop",
      "Illustrator",
      "Figma",
      "Clip Studio Paint",
      "Blender",
    ],
  },
  {
    category: "Development",
    items: ["Next.js", "React", "Python", "TypeScript", "Node.js"],
  },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();

  const photo =
    typeof settings.aboutPhoto === "object" && settings.aboutPhoto
      ? settings.aboutPhoto
      : null;

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            <div className="md:col-span-1">
              {photo?.url ? (
                <div className="relative aspect-[3/4] rounded-sm overflow-hidden">
                  <Image
                    src={photo.sizes?.card?.url ?? photo.url}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[3/4] bg-gray-200 rounded-sm flex items-center justify-center text-gray-400 text-sm">
                  Photo
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <SectionHeading title="About" />

              {settings.aboutBio ? (
                <RichText data={settings.aboutBio} />
              ) : (
                <div className="space-y-5 text-gray-700 leading-relaxed">
                  <p>
                    I&apos;m Omar Kamel — AI Creative &amp; Production Lead at
                    Optix/Saatchi &amp; Saatchi, where I help regional and global
                    brands navigate the rapidly evolving intersection of
                    artificial intelligence and creative production.
                  </p>
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="border-t border-gray-200 pt-16">
            <h2 className="font-serif text-3xl font-bold mb-10">
              Skills &amp; Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {skills.map((group) => (
                <div key={group.category}>
                  <h3 className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-4">
                    {group.category}
                  </h3>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="text-sm text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(site)/about/page.tsx"
git commit -m "feat: wire about page to Payload CMS"
```

---

## Task 15: Update sitemap, RSS feed, and robots.txt

**Files:**
- Modify: `app/sitemap.ts`, `app/feed.xml/route.ts`, `app/robots.ts`

- [ ] **Step 1: Update sitemap**

Replace `app/sitemap.ts`:

```typescript
import { MetadataRoute } from "next";
import {
  getAllWorkSlugs,
  getAllProjectSlugs,
  getAllBlogSlugs,
} from "@/lib/payload/queries";

const baseUrl = "https://omarkamel.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [workSlugs, projectSlugs, blogSlugs] = await Promise.all([
    getAllWorkSlugs(),
    getAllProjectSlugs(),
    getAllBlogSlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/work`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/projects`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const workPages: MetadataRoute.Sitemap = workSlugs.map((slug) => ({
    url: `${baseUrl}/work/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const projectPages: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...workPages, ...projectPages, ...blogPages];
}
```

- [ ] **Step 2: Update RSS feed**

Replace `app/feed.xml/route.ts`:

```typescript
import { getAllBlogPosts } from "@/lib/payload/queries";

const baseUrl = "https://omarkamel.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getAllBlogPosts();

  const items = posts
    .map((post) => {
      const link = `${baseUrl}/blog/${post.slug}`;
      const pubDate = post.date ? new Date(post.date).toUTCString() : "";
      const description = post.excerpt ? escapeXml(post.excerpt) : "";
      const title = escapeXml(post.title);

      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ""}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Omar Kamel</title>
    <link>${baseUrl}</link>
    <description>AI Creative &amp; Production Lead — 20+ years crafting stories across film, music, brand, and emerging media.</description>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
```

- [ ] **Step 3: Update robots.txt**

Replace `app/robots.ts`:

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: "https://omarkamel.com/sitemap.xml",
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts "app/feed.xml/route.ts" app/robots.ts
git commit -m "feat: update sitemap, RSS, and robots to use Payload"
```

---

## Task 16: Remove dummy data and clean up

**Files:**
- Delete: `lib/dummy-data.ts`, `lib/sanity/` (if any remnants)
- Verify: no remaining imports from deleted files

- [ ] **Step 1: Delete dummy data file**

```bash
rm lib/dummy-data.ts
```

- [ ] **Step 2: Verify no remaining references to deleted files**

```bash
grep -r "dummy-data\|lib/sanity\|sanity/types\|@portabletext\|portable-text\|sanity\.config\|next-sanity\|/studio" --include="*.ts" --include="*.tsx" app/ components/ lib/ 2>/dev/null || echo "Clean — no stale references found"
```

Expected: "Clean — no stale references found"

If any references remain, fix them — they should be pointing to `@/lib/payload/queries` or `@/lib/payload/types` instead.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove dummy data and clean up stale references"
```

---

## Task 17: Set up Neon database and verify build

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Create a Neon Postgres database**

Go to https://neon.tech and create a free account/project. Copy the connection string (it looks like `postgresql://user:pass@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`).

- [ ] **Step 2: Set environment variables**

Update `.env.local` with:

```
DATABASE_URI=postgresql://...your-neon-connection-string...
PAYLOAD_SECRET=replace-with-a-random-32-char-string
BLOB_READ_WRITE_TOKEN=
RESEND_API_KEY=
CONTACT_EMAIL=omar@omarkamel.com
```

Generate a random secret with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- [ ] **Step 3: Generate Payload types and import map**

```bash
npx payload generate:types
npx payload generate:importmap
```

This creates `payload-types.ts` at the root and updates `app/(payload)/admin/importMap.js`.

- [ ] **Step 4: Run the dev server to trigger DB migration**

```bash
npm run dev
```

Payload will automatically create the database tables on first run. Visit `http://localhost:3000/admin` to create your admin user.

Expected: Admin panel loads. You can create an admin account. Collections (Work, Projects, Blog Posts, Media) and the Site Settings global appear in the sidebar.

- [ ] **Step 5: Verify the public site works**

Visit `http://localhost:3000`. Pages should load but show empty content (no content in the database yet). No errors.

- [ ] **Step 6: Commit generated files**

```bash
git add payload-types.ts "app/(payload)/admin/importMap.js"
git commit -m "chore: add Payload generated types and import map"
```

---

## Task 18: Seed content via admin panel

This is a manual step — not code.

- [ ] **Step 1: Add site settings**

Go to `http://localhost:3000/admin` → Site Settings. Fill in:
- Hero Headline: "Omar Kamel"
- Hero Tagline: "AI Creative & Production Lead — 20+ years crafting stories across film, music, brand, and emerging media."
- Social Links: LinkedIn, Instagram, X, YouTube (same URLs from dummy data)
- About Bio: paste the about text from the current about page

- [ ] **Step 2: Add work items**

Go to Work → Create. Add the 8 work items from the dummy data. For each:
- Title, slug, client, categories, tags, featured, sortOrder, date
- Upload a placeholder cover image (any image works for now)
- Add media embeds where applicable

- [ ] **Step 3: Add projects**

Go to Projects → Create. Add the 3 projects from dummy data.

- [ ] **Step 4: Add blog posts**

Go to Blog Posts → Create. Add the 4 blog posts from dummy data.

- [ ] **Step 5: Verify the site renders content**

Visit `http://localhost:3000` and navigate all pages. Content should appear from Payload.

---

## Task 19: Final verification and cleanup

- [ ] **Step 1: Run a production build**

```bash
npx next build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Verify all pages render**

```bash
npm start
```

Check each page:
- `/` — homepage with featured work, projects, recent posts
- `/work` — all work items, category filter works
- `/work/[any-slug]` — work detail with description, media, tags
- `/projects` — all projects
- `/projects/[any-slug]` — project detail
- `/blog` — all posts
- `/blog/[any-slug]` — full blog post
- `/about` — bio from CMS, skills grid
- `/contact` — form still works
- `/admin` — admin panel accessible, all collections visible
- `/sitemap.xml` — includes all content URLs
- `/feed.xml` — RSS feed with blog posts

- [ ] **Step 3: Verify no Sanity remnants**

```bash
grep -r "sanity" --include="*.ts" --include="*.tsx" --include="*.mjs" --include="*.json" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git 2>/dev/null | grep -v "docs/" || echo "Clean"
```

Expected: "Clean" (only docs/ references to Sanity should remain, which is fine — those are historical specs).

- [ ] **Step 4: Commit any final adjustments**

```bash
git add -A
git commit -m "chore: final Payload CMS migration cleanup"
```
