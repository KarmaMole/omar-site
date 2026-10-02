import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { fal } from '@fal-ai/client'
import { getPayload } from 'payload'
import config from '@payload-config'
import { DISPATCH_CATEGORIES } from '@/lib/categories'

fal.config({ credentials: process.env.FAL_KEY })

// Claude plus fal image generation can take a while
export const maxDuration = 300

const ALLOWED_CATEGORIES: readonly string[] = DISPATCH_CATEGORIES

// Defensive cleanup: the prompt forbids em-dashes, but never trust the model
const stripEmDashes = (text: unknown): string =>
  typeof text === 'string' ? text.replace(/\s*\u2014\s*/g, ', ') : ''

const IMAGE_PROMPT_TEMPLATE = `A New Yorker-style black-and-white ink illustration. In the center of the frame, SUBJECT is shown ACTION. The image should express METAPHOR in a quiet, understated way.

Composition: The entire composition is compact and self-contained in the center of the frame, with generous empty negative space on ALL sides \u2014 top, bottom, left, and right. No element (including text, labels, captions, or any detail) should touch or extend beyond any edge of the frame. Leave at least 15% padding on every side.

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

  let parsed: { title?: unknown; body?: unknown }
  try {
    parsed = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { title, body } = parsed
  if (typeof title !== 'string' || typeof body !== 'string' || !title.trim() || !body.trim()) {
    return NextResponse.json({ error: 'title and body are required strings' }, { status: 400 })
  }

  // Step 1: Call Claude for text generation + image prompt
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let claudeResponse: Awaited<ReturnType<typeof anthropic.messages.create>>
  try {
    claudeResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `You are a writing assistant for Omar Kamel's editorial blog "Dispatches". Generate metadata for a blog post. Return ONLY valid JSON with these fields:
- "excerpt": 1-2 punchy sentences summarizing the post, suitable for a card layout
- "categories": an array of 1-3 categories from ONLY these options: ${ALLOWED_CATEGORIES.map((c) => `"${c}"`).join(", ")}. Pick the most relevant ones.
- "tags": comma-separated additional topic tags beyond the categories (e.g. "ComfyUI, Image Generation, Egypt"). Do NOT repeat category names here.
- "seoTitle": SEO title, max 46 characters (will have " | Omar Kamel" appended). Shorten/rephrase the article title to fit. Must be under 46 characters.
- "description": SEO meta description, STRICTLY max 150 characters. Count carefully. Compelling for search results.
- "subject": a short description of the main visual subject/scene from the article (for an illustration)
- "action": what the subject is doing, visually clear and specific
- "metaphor": the core metaphor, contradiction, or irony of the article

Voice and style rules:
- The "excerpt" and "description" are written in Omar's first-person voice ("I", "my"). Never refer to "Omar" in the third person.
- Never use em-dashes in any field. Use commas, colons or full stops instead.

Return ONLY the JSON object, no markdown fences.`,
      messages: [
        {
          role: 'user',
          content: `Title: ${title}\n\nArticle:\n${body.slice(0, 8000)}`,
        },
      ],
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Text generation failed', detail: String(err) },
      { status: 502 },
    )
  }

  const firstBlock = claudeResponse.content[0]
  let claudeText = firstBlock && firstBlock.type === 'text' ? firstBlock.text : ''
  // Strip markdown fences if present
  claudeText = claudeText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()

  let generated: {
    excerpt: string
    categories: string[]
    tags: string
    seoTitle: string
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

  // Normalise model output: allowed categories only, no em-dashes
  generated.categories = Array.isArray(generated.categories)
    ? generated.categories.filter((c) => ALLOWED_CATEGORIES.includes(c))
    : []
  generated.excerpt = stripEmDashes(generated.excerpt)
  generated.tags = stripEmDashes(generated.tags)
  generated.seoTitle = stripEmDashes(generated.seoTitle)
  generated.description = stripEmDashes(generated.description)
  generated.subject = stripEmDashes(generated.subject)
  generated.action = stripEmDashes(generated.action)
  generated.metaphor = stripEmDashes(generated.metaphor)

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
  let imageBuffer: Buffer
  try {
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: `Image download failed with status ${imageResponse.status}` },
        { status: 502 },
      )
    }
    imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
  } catch (err) {
    return NextResponse.json(
      { error: 'Image download failed', detail: String(err) },
      { status: 502 },
    )
  }
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

  // Enforce limits server-side as a safety net. Prefer cutting at a sentence end
  // (if that keeps enough text), else at a word boundary, so descriptions never
  // end mid-word or on a dangling fragment (e.g. "sustainable AI ").
  const MIN_SENTENCE_CUT = 90
  const truncateAtWord = (text: string, maxLen: number): string => {
    if (text.length <= maxLen) return text
    const slice = text.slice(0, maxLen)
    const sentenceEnd = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('! '),
      slice.lastIndexOf('? '),
    )
    if (sentenceEnd + 1 >= MIN_SENTENCE_CUT) return slice.slice(0, sentenceEnd + 1)
    const lastSpace = slice.lastIndexOf(' ')
    const cut = (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trimEnd()
    // Drop trailing punctuation and joining words, then close with a full stop
    const cleaned = cut
      .replace(/[\s,;:]+$/, '')
      .replace(/\s+(and|or|but|the|a|an|of|to|for|in|on|with|about|that|which|as|by|from)$/i, '')
      .replace(/[\s,;:]+$/, '')
    return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`
  }
  const seoTitle = `${truncateAtWord(generated.seoTitle, 46)} | Omar Kamel`
  const description = truncateAtWord(generated.description, 150)
  const excerpt = truncateAtWord(generated.excerpt, 300)

  return NextResponse.json({
    excerpt,
    categories: generated.categories,
    tags: generated.tags,
    seoTitle,
    description,
    coverImageId: mediaDoc.id,
    imagePrompt,
  })
}
