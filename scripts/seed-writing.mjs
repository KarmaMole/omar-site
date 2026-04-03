/**
 * Import KarmaMole WordPress posts into Payload CMS blog-posts collection.
 * Usage: node scripts/seed-writing.mjs
 */

import { readFileSync } from "fs";

const API = "http://localhost:3000/api";
const XML_PATH = "C:/Users/user/Desktop/karmamole.WordPress.2026-04-03.xml";

async function login() {
  const res = await fetch(`${API}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.PAYLOAD_ADMIN_EMAIL,
      password: process.env.PAYLOAD_ADMIN_PASSWORD,
    }),
  });
  const data = await res.json();
  if (!data.token) throw new Error("Login failed");
  return data.token;
}

async function create(token, body) {
  const res = await fetch(`${API}/blog-posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.errors) {
    console.error(`  ERROR [${body.slug}]:`, JSON.stringify(data.errors).slice(0, 200));
    return null;
  }
  return data.doc;
}

/**
 * Convert WordPress HTML content to Payload Lexical rich text.
 * Handles paragraphs, headings, lists, blockquotes, links, emphasis, strong, images.
 */
function wpToLexical(html) {
  if (!html || !html.trim()) return null;

  // Strip WP block comments
  let clean = html.replace(/<!-- \/?wp:.*?-->/gs, "").trim();

  // Split into block-level elements
  const blocks = [];
  const blockRegex = /<(p|h[1-6]|blockquote|ul|ol|figure|img|hr)([\s>])/gi;

  // Simple approach: split by closing tags and process
  const parts = clean.split(/\n\n+/);

  for (let part of parts) {
    part = part.trim();
    if (!part) continue;

    // Heading
    const headingMatch = part.match(/^<h([1-6])[^>]*>(.*?)<\/h\1>/is);
    if (headingMatch) {
      const level = parseInt(headingMatch[1]);
      const text = stripHtml(headingMatch[2]);
      if (text) {
        blocks.push({
          type: "heading",
          tag: `h${level}`,
          children: parseInline(headingMatch[2]),
        });
      }
      continue;
    }

    // Blockquote
    const bqMatch = part.match(/^<blockquote[^>]*>(.*?)<\/blockquote>/is);
    if (bqMatch) {
      const inner = bqMatch[1].replace(/<\/?p[^>]*>/gi, "").trim();
      if (inner) {
        blocks.push({
          type: "quote",
          children: [
            {
              type: "paragraph",
              children: parseInline(inner),
            },
          ],
        });
      }
      continue;
    }

    // Unordered list
    const ulMatch = part.match(/^<ul[^>]*>(.*?)<\/ul>/is);
    if (ulMatch) {
      const listItems = [...ulMatch[1].matchAll(/<li[^>]*>(.*?)<\/li>/gis)];
      if (listItems.length > 0) {
        blocks.push({
          type: "list",
          tag: "ul",
          listType: "bullet",
          children: listItems.map((li) => ({
            type: "listitem",
            children: parseInline(li[1].replace(/<\/?p[^>]*>/gi, "").trim()),
          })),
        });
      }
      continue;
    }

    // Ordered list
    const olMatch = part.match(/^<ol[^>]*>(.*?)<\/ol>/is);
    if (olMatch) {
      const listItems = [...olMatch[1].matchAll(/<li[^>]*>(.*?)<\/li>/gis)];
      if (listItems.length > 0) {
        blocks.push({
          type: "list",
          tag: "ol",
          listType: "number",
          children: listItems.map((li) => ({
            type: "listitem",
            children: parseInline(li[1].replace(/<\/?p[^>]*>/gi, "").trim()),
          })),
        });
      }
      continue;
    }

    // HR
    if (part.match(/^<hr\s*\/?>/i)) {
      blocks.push({ type: "horizontalrule", children: [] });
      continue;
    }

    // Paragraph (or bare text)
    let pContent = part;
    const pMatch = part.match(/^<p[^>]*>(.*?)<\/p>/is);
    if (pMatch) {
      pContent = pMatch[1];
    }

    // Skip embeds (figures with iframes, twitter embeds, etc.)
    if (pContent.match(/<iframe|<figure|<div class="wp-block-embed/i)) continue;

    const text = stripHtml(pContent);
    if (text) {
      blocks.push({
        type: "paragraph",
        children: parseInline(pContent),
      });
    }
  }

  if (blocks.length === 0) {
    // Fallback: just put the plain text in a paragraph
    const plain = stripHtml(clean);
    if (!plain) return null;
    blocks.push({
      type: "paragraph",
      children: [{ type: "text", text: plain }],
    });
  }

  return {
    root: {
      type: "root",
      children: blocks,
    },
  };
}

function parseInline(html) {
  if (!html) return [{ type: "text", text: "" }];

  const children = [];
  // Simple regex-based inline parser
  let remaining = html;

  // Process inline elements
  const inlineRegex =
    /<(strong|b|em|i|a|code|span)([^>]*)>(.*?)<\/\1>/gis;

  let lastIndex = 0;
  const tempDiv = remaining;

  // Flatten approach: strip tags and create text nodes with formatting
  // For simplicity, extract text with basic formatting
  const result = [];

  // Split by tags and process
  const tagRegex = /<\/?(?:strong|b|em|i|a|code|br|span)[^>]*>/gi;
  const segments = remaining.split(tagRegex);
  const tags = remaining.match(tagRegex) || [];

  let bold = false;
  let italic = false;
  let tagIdx = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = decodeHtmlEntities(segments[i].replace(/<[^>]+>/g, ""));
    if (seg) {
      const node = { type: "text", text: seg };
      if (bold) node.format = (node.format || 0) | 1; // bold = 1
      if (italic) node.format = (node.format || 0) | 2; // italic = 2
      result.push(node);
    }

    // Process the tag after this segment
    if (tagIdx < tags.length) {
      const tag = tags[tagIdx].toLowerCase();
      if (tag.startsWith("<strong") || tag.startsWith("<b>") || tag.startsWith("<b "))
        bold = true;
      else if (tag === "</strong>" || tag === "</b>") bold = false;
      else if (tag.startsWith("<em") || tag.startsWith("<i>") || tag.startsWith("<i "))
        italic = true;
      else if (tag === "</em>" || tag === "</i>") italic = false;
      else if (tag === "<br>" || tag === "<br/>") {
        result.push({ type: "linebreak" });
      }
      tagIdx++;
    }
  }

  return result.length > 0 ? result : [{ type: "text", text: stripHtml(html) || "" }];
}

function stripHtml(html) {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, "").trim());
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#8230;/g, "…")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D");
}

function extractExcerpt(html, maxLen = 200) {
  const plain = stripHtml(
    html
      .replace(/<!-- .*?-->/gs, "")
      .replace(/<[^>]+>/g, " ")
  ).replace(/\s+/g, " ").trim();
  if (plain.length <= maxLen) return plain;
  return plain.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// ─── Parse XML ──────────────────────────────────────────────────

function parseItems(xml) {
  const items = xml.split("<item>").slice(1);
  const posts = [];
  const slugsSeen = new Set();

  for (const item of items) {
    const type =
      item.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]>/)?.[1];
    if (type !== "post") continue;

    const status =
      item.match(/<wp:status><!\[CDATA\[(.*?)\]\]>/)?.[1];
    if (status !== "publish") continue;

    const title =
      item.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] || "Untitled";
    const content =
      item.match(/<content:encoded><!\[CDATA\[(.*?)\]\]>/s)?.[1] || "";
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
    const wpSlug =
      item.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]>/)?.[1];

    // Categories and tags
    const categories = [
      ...item.matchAll(
        /<category domain="category"[^>]*><!\[CDATA\[(.*?)\]\]>/g
      ),
    ].map((m) => m[1]);
    const tags = [
      ...item.matchAll(
        /<category domain="post_tag"[^>]*><!\[CDATA\[(.*?)\]\]>/g
      ),
    ].map((m) => m[1]);

    let slug = wpSlug || slugify(title);
    // Ensure unique slug
    if (slugsSeen.has(slug)) {
      let i = 2;
      while (slugsSeen.has(`${slug}-${i}`)) i++;
      slug = `${slug}-${i}`;
    }
    slugsSeen.add(slug);

    const date = pubDate ? new Date(pubDate).toISOString() : null;
    const excerpt = extractExcerpt(content);
    const body = wpToLexical(content);

    posts.push({
      title,
      slug,
      date,
      excerpt,
      body,
      tags: tags.length > 0
        ? tags.map((t) => ({ tag: t }))
        : categories.length > 0
        ? categories.map((c) => ({ tag: c }))
        : [],
    });
  }

  // Sort by date (oldest first)
  posts.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  return posts;
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  console.log("Reading XML...");
  const xml = readFileSync(XML_PATH, "utf8");

  console.log("Parsing posts...");
  const posts = parseItems(xml);
  console.log(`Found ${posts.length} published posts.\n`);

  console.log("Logging in...");
  const token = await login();
  console.log("Authenticated.\n");

  console.log(`Importing ${posts.length} posts into blog-posts...`);
  let count = 0;
  let errors = 0;

  for (const post of posts) {
    const doc = await create(token, post);
    if (doc) {
      count++;
      console.log(`  ✓ ${post.title}`);
    } else {
      errors++;
    }
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`DONE: ${count} posts imported, ${errors} errors`);
  console.log(`═══════════════════════════════════════`);
}

main().catch(console.error);
