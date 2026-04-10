import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { fal } from '@fal-ai/client'
import { getPayload } from 'payload'
import config from '@payload-config'

fal.config({ credentials: process.env.FAL_KEY })

const IMAGE_PROMPT_TEMPLATE = `A New Yorker-style black-and-white ink illustration. In the center of the frame, SUBJECT is shown ACTION. The image should express METAPHOR in a quiet, understated way.

Composition: The entire composition is compact and self-contained in the center of the frame, with generous empty negative space on ALL sides — top, bottom, left, and right. No element (including text, labels, captions, or any detail) should touch or extend beyond any edge of the frame. Leave at least 15% padding on every side.

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
- "categories": an array of 1-3 categories from ONLY these options: "AI Production", "Workflows", "Industry", "Tools", "Case Studies". Pick the most relevant ones.
- "tags": comma-separated additional topic tags beyond the categories (e.g. "ComfyUI, Image Generation, Egypt"). Do NOT repeat category names here.
- "seoTitle": SEO title, max 46 characters (will have " | Omar Kamel" appended). Shorten/rephrase the article title to fit. Must be under 46 characters.
- "description": SEO meta description, STRICTLY max 150 characters. Count carefully. Compelling for search results.
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

  let claudeText = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : ''
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

  // Enforce limits server-side as a safety net. Cut at word boundaries
  // so descriptions never end mid-word (e.g. "sustainable AI ").
  const truncateAtWord = (text: string, maxLen: number): string => {
    if (text.length <= maxLen) return text
    const slice = text.slice(0, maxLen)
    const lastSpace = slice.lastIndexOf(' ')
    return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trimEnd()
  }
  const seoTitle = `${truncateAtWord(generated.seoTitle, 46)} | Omar Kamel`
  const description = truncateAtWord(generated.description, 150)

  return NextResponse.json({
    excerpt: generated.excerpt,
    categories: generated.categories,
    tags: generated.tags,
    seoTitle,
    description,
    coverImageId: mediaDoc.id,
    imagePrompt,
  })
}
