# Dispatch "Generate All" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sidebar button to the Payload admin dispatch editor that auto-generates excerpt, tags, SEO description, and cover image using Claude + fal.ai Nano Banana Pro.

**Architecture:** A Next.js API route handles server-side AI calls (Claude for text, fal.ai for images). A custom Payload admin `ui` field renders the button in the sidebar. The button reads the current form state, calls the API route, and populates fields via Payload's `dispatchFields`.

**Tech Stack:** Anthropic SDK (`@anthropic-ai/sdk`), fal.ai client (`@fal-ai/client`), Payload CMS v3 admin hooks (`@payloadcms/ui`), Next.js App Router API routes.

**Spec:** `docs/superpowers/specs/2026-04-09-dispatch-generate-all-design.md`

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Anthropic SDK and fal.ai client**

```bash
cd "C:/Users/user/Desktop/Claude Projects/omar-site"
npm install @anthropic-ai/sdk @fal-ai/client
```

- [ ] **Step 2: Verify both packages are in package.json**

```bash
cat package.json | grep -E "anthropic|fal"
```

Expected:
```
"@anthropic-ai/sdk": "^...",
"@fal-ai/client": "^..."
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @anthropic-ai/sdk and @fal-ai/client dependencies"
```

---

### Task 2: Create the API route

**Files:**
- Create: `app/(site)/api/generate-dispatch-meta/route.ts`

This route lives under `(site)` rather than `(payload)` because the `(payload)` catch-all route would intercept it. It's a standard Next.js API route that uses Payload's local API for auth and media upload.

- [ ] **Step 1: Create the route file**

Create `app/(site)/api/generate-dispatch-meta/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import * as fal from '@fal-ai/client'
import { getPayload } from 'payload'
import config from '@payload-config'

fal.config({ credentials: process.env.FAL_KEY })

const IMAGE_PROMPT_TEMPLATE = `A New Yorker-style black-and-white ink illustration. In the center of the frame, SUBJECT is shown ACTION. The image should express METAPHOR in a quiet, understated way.

Composition: The entire composition is compact and self-contained in the middle of the frame, with generous empty negative space surrounding it. No important element should touch the edges or rise too high in the frame unless explicitly intended.

Lighting: Soft, flat editorial lighting with subtle cross-hatched shadows and restrained tonal contrast. The image should feel calm, observational, and slightly austere rather than dramatic.

Color accent: Include a single subtle cyan (#00d9ff) element as the only color in the image, placed deliberately to draw the eye and reinforce the central idea.

Style: Minimalist pen-and-ink editorial illustration with fine cross-hatching, delicate stippling, crisp linework, and visible paper grain; quiet, intelligent, slightly ironic tone reminiscent of classic New Yorker-style conceptual illustration.

Fidelity: Clean anatomy, accurate perspective, balanced spacing, clear silhouette hierarchy, controlled detail, and strong visual clarity.

Negative prompt: photographic realism, painterly rendering, extra figures, cluttered background, chaotic composition, distorted anatomy, warped objects, unreadable text, heavy shading, excessive detail, bright colors, dramatic action.`

export async function POST(req: NextRequest) {
  // Auth check: verify Payload user
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, body } = await req.json()
  if (!title || !body) {
    return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
  }

  // Step 1: Call Claude for text generation + image prompt
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const claudeResponse = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: `You are a writing assistant for Omar Kamel's editorial blog "Dispatches". Generate metadata for a blog post. Return ONLY valid JSON with these fields:
- "excerpt": 1-2 punchy sentences summarizing the post, suitable for a card layout
- "tags": comma-separated tags (e.g. "AEgypt, Technology, Culture"). Use existing tag conventions: short, capitalized topic words
- "description": SEO meta description, max 155 characters, compelling for search results
- "subject": a short description of the main visual subject/scene from the article (for an illustration)
- "action": what the subject is doing, visually clear and specific
- "metaphor": the core metaphor, contradiction, or irony of the article

Return ONLY the JSON object, no markdown fences.`,
    messages: [
      {
        role: 'user',
        content: `Title: ${title}\n\nArticle:\n${body.slice(0, 8000)}`,
      },
    ],
  })

  const claudeText = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : ''
  let generated: {
    excerpt: string
    tags: string
    description: string
    subject: string
    action: string
    metaphor: string
  }

  try {
    generated = JSON.parse(claudeText)
  } catch {
    return NextResponse.json({ error: 'Failed to parse Claude response', raw: claudeText }, { status: 502 })
  }

  // Step 2: Build image prompt and call fal.ai Nano Banana Pro
  const imagePrompt = IMAGE_PROMPT_TEMPLATE
    .replace('SUBJECT', generated.subject)
    .replace('ACTION', generated.action)
    .replace('METAPHOR', generated.metaphor)

  let imageUrl: string
  try {
    const falResult = await fal.subscribe('fal-ai/nano-banana-pro', {
      input: {
        prompt: imagePrompt,
        aspect_ratio: '16:9',
        resolution: '2K',
        output_format: 'png',
        num_images: 1,
      },
    })

    const images = (falResult as { data: { images: { url: string }[] } }).data.images
    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No image returned from fal.ai' }, { status: 502 })
    }
    imageUrl = images[0].url
  } catch (err) {
    return NextResponse.json(
      { error: 'Image generation failed', detail: String(err) },
      { status: 502 },
    )
  }

  // Step 3: Download image and upload to Payload media collection
  const imageResponse = await fetch(imageUrl)
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const fileName = `dispatch-cover-${slug}.png`

  const mediaDoc = await payload.create({
    collection: 'media',
    data: {
      alt: `Cover illustration for: ${title}`,
    },
    file: {
      data: imageBuffer,
      mimetype: 'image/png',
      name: fileName,
      size: imageBuffer.length,
    },
  })

  return NextResponse.json({
    excerpt: generated.excerpt,
    tags: generated.tags,
    description: generated.description,
    coverImageId: mediaDoc.id,
    imagePrompt,
  })
}
```

- [ ] **Step 2: Verify the route file exists**

```bash
ls app/\(site\)/api/generate-dispatch-meta/route.ts
```

- [ ] **Step 3: Commit**

```bash
git add app/\(site\)/api/generate-dispatch-meta/route.ts
git commit -m "feat: add /api/generate-dispatch-meta route for AI generation"
```

---

### Task 3: Create the admin button component

**Files:**
- Create: `components/admin/generate-all-button.tsx`

This is a Payload `ui` field component that renders in the sidebar. It reads `title` and `body` from the form, calls the API route, and populates `excerpt`, `tags`, `meta.description`, `coverImage`, and `meta.image` via `dispatchFields`.

- [ ] **Step 1: Create the component file**

Create `components/admin/generate-all-button.tsx`:

```tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { useAllFormFields, useDocumentInfo } from '@payloadcms/ui'

type GenerateResponse = {
  excerpt: string
  tags: string
  description: string
  coverImageId: string
  imagePrompt: string
}

type Snapshot = {
  excerpt: unknown
  tags: unknown
  'meta.description': unknown
  coverImage: unknown
  'meta.image': unknown
}

const FIELDS_TO_POPULATE = ['excerpt', 'tags', 'meta.description', 'coverImage', 'meta.image'] as const

export default function GenerateAllButton() {
  const [fields, dispatchFields] = useAllFormFields()
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [showUndo, setShowUndo] = useState(false)
  const snapshotRef = useRef<Snapshot | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getFieldValue = useCallback(
    (path: string): unknown => {
      return fields[path]?.value ?? null
    },
    [fields],
  )

  const setFieldValue = useCallback(
    (path: string, value: unknown) => {
      dispatchFields({
        type: 'UPDATE',
        path,
        value,
      })
    },
    [dispatchFields],
  )

  const handleGenerate = async () => {
    const title = getFieldValue('title') as string
    const body = getFieldValue('body') as string

    if (!title || !body) {
      setStatus('error')
      setErrorMsg('Title and body are required before generating.')
      return
    }

    // Snapshot current values for undo
    snapshotRef.current = {
      excerpt: getFieldValue('excerpt'),
      tags: getFieldValue('tags'),
      'meta.description': getFieldValue('meta.description'),
      coverImage: getFieldValue('coverImage'),
      'meta.image': getFieldValue('meta.image'),
    }

    setStatus('generating')
    setErrorMsg('')

    try {
      const res = await fetch('/api/generate-dispatch-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, body }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const data: GenerateResponse = await res.json()

      // Populate fields
      setFieldValue('excerpt', data.excerpt)
      setFieldValue('tags', data.tags)
      setFieldValue('meta.description', data.description)
      setFieldValue('coverImage', data.coverImageId)
      setFieldValue('meta.image', data.coverImageId)

      setStatus('done')
      setShowUndo(true)

      // Auto-hide undo after 8 seconds
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
      undoTimerRef.current = setTimeout(() => {
        setShowUndo(false)
        snapshotRef.current = null
      }, 8000)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Generation failed')
    }
  }

  const handleUndo = () => {
    if (!snapshotRef.current) return
    for (const path of FIELDS_TO_POPULATE) {
      setFieldValue(path, snapshotRef.current[path])
    }
    setShowUndo(false)
    setStatus('idle')
    snapshotRef.current = null
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      {status === 'idle' && (
        <button
          type="button"
          onClick={handleGenerate}
          style={{
            width: '100%',
            padding: '0.6rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            background: 'rgba(0, 217, 255, 0.12)',
            border: '1px solid rgba(0, 217, 255, 0.4)',
            borderRadius: '4px',
            color: '#00d9ff',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 217, 255, 0.22)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 217, 255, 0.12)'
          }}
        >
          Generate All
        </button>
      )}

      {status === 'generating' && (
        <div
          style={{
            width: '100%',
            padding: '0.6rem 1rem',
            fontSize: '0.85rem',
            fontFamily: 'inherit',
            background: 'rgba(0, 217, 255, 0.08)',
            border: '1px solid rgba(0, 217, 255, 0.25)',
            borderRadius: '4px',
            color: '#00d9ff',
            textAlign: 'center',
          }}
        >
          Generating...
        </div>
      )}

      {status === 'done' && showUndo && (
        <div
          style={{
            width: '100%',
            padding: '0.6rem 1rem',
            fontSize: '0.85rem',
            fontFamily: 'inherit',
            background: 'rgba(0, 217, 255, 0.08)',
            border: '1px solid rgba(0, 217, 255, 0.25)',
            borderRadius: '4px',
            color: '#00d9ff',
            textAlign: 'center',
          }}
        >
          Generated!{' '}
          <button
            type="button"
            onClick={handleUndo}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff6b6b',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: 'inherit',
              fontSize: '0.85rem',
              padding: 0,
            }}
          >
            Undo?
          </button>
        </div>
      )}

      {status === 'done' && !showUndo && (
        <button
          type="button"
          onClick={() => setStatus('idle')}
          style={{
            width: '100%',
            padding: '0.6rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            background: 'rgba(0, 217, 255, 0.12)',
            border: '1px solid rgba(0, 217, 255, 0.4)',
            borderRadius: '4px',
            color: '#00d9ff',
            cursor: 'pointer',
          }}
        >
          Re-generate All
        </button>
      )}

      {status === 'error' && (
        <div>
          <div
            style={{
              padding: '0.5rem',
              fontSize: '0.8rem',
              color: '#ff6b6b',
              marginBottom: '0.4rem',
            }}
          >
            {errorMsg}
          </div>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '4px',
              color: '#ff6b6b',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/generate-all-button.tsx
git commit -m "feat: add GenerateAllButton admin component"
```

---

### Task 4: Wire up the button in the BlogPosts collection and import map

**Files:**
- Modify: `collections/BlogPosts.ts`
- Modify: `app/(payload)/admin/importMap.js`

- [ ] **Step 1: Add the UI field to BlogPosts collection**

In `collections/BlogPosts.ts`, add a new `ui` field in the `fields` array, right after the `date` field (which is also in the sidebar). Insert this field after the `date` field block (after line 92):

```typescript
    {
      name: "generateAll",
      type: "ui",
      admin: {
        position: "sidebar",
        components: {
          Field: "@/components/admin/generate-all-button#default",
        },
      },
    },
```

- [ ] **Step 2: Register the component in importMap.js**

In `app/(payload)/admin/importMap.js`, add the import at the top (after the existing copy-image-ref import on line 33):

```javascript
import { default as default_generate_all_button } from '@/components/admin/generate-all-button'
```

And add the mapping inside the `importMap` object (after the copy-image-ref entry on line 69):

```javascript
  "@/components/admin/generate-all-button#default": default_generate_all_button,
```

- [ ] **Step 3: Commit**

```bash
git add collections/BlogPosts.ts app/\(payload\)/admin/importMap.js
git commit -m "feat: wire GenerateAllButton into dispatch sidebar and import map"
```

---

### Task 5: Test end-to-end

**Files:** None (manual testing)

- [ ] **Step 1: Start the dev server**

```bash
cd "C:/Users/user/Desktop/Claude Projects/omar-site"
npm run dev
```

- [ ] **Step 2: Open the admin panel and create a new dispatch**

Navigate to `http://localhost:3000/admin/collections/blog-posts/create`.

Verify:
- The "Generate All" button appears in the sidebar (below date)
- The Inline Images section appears between Body and Excerpt (existing issue to debug separately if still missing)

- [ ] **Step 3: Test the generation flow**

1. Enter a title and paste some article body text
2. Click "Generate All"
3. Verify the button shows "Generating..." spinner state
4. After completion, verify these fields are populated:
   - `excerpt` — 1-2 sentences
   - `tags` — comma-separated
   - SEO `meta.description` — in the SEO section at the bottom
   - `coverImage` — shows an uploaded image
   - `meta.image` — same image in SEO section
5. Verify the "Generated! Undo?" toast appears
6. Click "Undo?" and verify all fields revert to their previous (empty) state

- [ ] **Step 4: Test error states**

1. Click "Generate All" with empty title/body — should show error message
2. Click "Retry" — should return to idle state

- [ ] **Step 5: Save the dispatch and verify on the frontend**

1. Fill in the remaining required fields (slug, date)
2. Save the dispatch
3. Navigate to `http://localhost:3000/dispatch/[slug]`
4. Verify the cover image, excerpt, and meta tags render correctly

- [ ] **Step 6: Commit any fixes from testing**

```bash
git add -A
git commit -m "fix: adjustments from end-to-end testing"
```
