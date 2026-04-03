/**
 * Fix missing categories: re-reads the WordPress XML, extracts categories
 * for each post, and adds them as tags to the matching Payload blog post.
 *
 * Usage: node scripts/fix-categories.mjs
 */

import { readFileSync } from "fs";

const API = "http://localhost:3000/api";
const XML_PATH = "C:/Users/user/Desktop/karmamole.WordPress.2026-04-03.xml";

async function login() {
  const res = await fetch(`${API}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "editor@6dofreviews.com",
      password: "Zadokite!13",
    }),
  });
  const data = await res.json();
  if (!data.token) throw new Error("Login failed");
  return data.token;
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

// Parse XML to get slug → categories mapping
function parseCategories(xml) {
  const items = xml.split("<item>").slice(1);
  const map = new Map();
  const slugsSeen = new Set();

  for (const item of items) {
    const type = item.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]>/)?.[1];
    if (type !== "post") continue;
    const status = item.match(/<wp:status><!\[CDATA\[(.*?)\]\]>/)?.[1];
    if (status !== "publish") continue;

    const title = item.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] || "Untitled";
    const wpSlug = item.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]>/)?.[1];

    let slug = wpSlug || slugify(title);
    if (slugsSeen.has(slug)) {
      let i = 2;
      while (slugsSeen.has(`${slug}-${i}`)) i++;
      slug = `${slug}-${i}`;
    }
    slugsSeen.add(slug);

    const categories = [
      ...item.matchAll(/<category domain="category"[^>]*><!\[CDATA\[(.*?)\]\]>/g),
    ].map((m) => m[1]);

    if (categories.length > 0) {
      map.set(slug, categories);
    }
  }

  return map;
}

async function main() {
  console.log("Reading XML...");
  const xml = readFileSync(XML_PATH, "utf8");
  const categoryMap = parseCategories(xml);
  console.log(`Found categories for ${categoryMap.size} posts.\n`);

  console.log("Logging in...");
  const token = await login();

  // Fetch all blog posts from Payload
  console.log("Fetching all blog posts...");
  let allPosts = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${API}/blog-posts?limit=100&page=${page}&depth=0`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    allPosts = allPosts.concat(data.docs);
    if (!data.hasNextPage) break;
    page++;
  }
  console.log(`Fetched ${allPosts.length} posts.\n`);

  let updated = 0;
  let skipped = 0;

  for (const post of allPosts) {
    const categories = categoryMap.get(post.slug);
    if (!categories || categories.length === 0) {
      skipped++;
      continue;
    }

    // Get existing tags
    const existingTags = (post.tags || []).map((t) => t.tag);

    // Find which categories are missing
    const missing = categories.filter(
      (cat) => !existingTags.some((t) => t.toLowerCase() === cat.toLowerCase())
    );

    if (missing.length === 0) {
      skipped++;
      continue;
    }

    // Merge: existing tags + missing categories
    const newTags = [
      ...existingTags.map((t) => ({ tag: t })),
      ...missing.map((c) => ({ tag: c })),
    ];

    const res = await fetch(`${API}/blog-posts/${post.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tags: newTags }),
    });

    const data = await res.json();
    if (data.errors) {
      console.error(`  ERROR [${post.slug}]:`, JSON.stringify(data.errors).slice(0, 200));
    } else {
      updated++;
      console.log(`  ✓ ${post.title} — added: ${missing.join(", ")}`);
    }
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`DONE: ${updated} posts updated, ${skipped} skipped`);
  console.log(`═══════════════════════════════════════`);
}

main().catch(console.error);
