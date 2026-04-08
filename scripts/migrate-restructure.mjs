/**
 * Migration script for site restructuring (Tier 1 tasks):
 *
 * 1. Migrate 6 specific Projects into Work collection as "personal" work
 * 2. Hide the migrated Projects
 * 3. Delete all blog posts (content moved to karmamole.com)
 * 4. Create placeholder Work entries for AI-era clients (hidden, for Omar to fill in)
 * 5. Re-categorize any existing "Branding" work items to "Design"
 *
 * Usage:
 *   PAYLOAD_ADMIN_EMAIL=x PAYLOAD_ADMIN_PASSWORD=y node scripts/migrate-restructure.mjs
 *
 * Requires the dev server running at localhost:3000.
 */

const API = process.env.API_URL || "http://localhost:3099/api";

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
  if (!data.token) throw new Error("Login failed: " + JSON.stringify(data));
  return data.token;
}

async function create(token, collection, body) {
  const res = await fetch(`${API}/${collection}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.errors) {
    console.error(`  ERROR creating ${body.slug || body.title || body.name}:`, JSON.stringify(data.errors));
    return null;
  }
  return data.doc;
}

async function update(token, collection, id, body) {
  const res = await fetch(`${API}/${collection}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.errors) {
    console.error(`  ERROR updating ${id}:`, JSON.stringify(data.errors));
    return null;
  }
  return data.doc;
}

async function findAll(token, collection, query = "") {
  const res = await fetch(`${API}/${collection}?limit=500${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.docs || [];
}

async function deleteDoc(token, collection, id) {
  const res = await fetch(`${API}/${collection}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

// ── Projects to migrate into Work as personal work ──────────────────

const projectsToMigrate = [
  {
    matchTitle: "The Strangers",
    workData: {
      title: "The Strangers",
      slug: "the-strangers",
      workType: "personal",
      roleCredits: "Direction, AI Pipeline Design, Post-Production",
      categories: ["AI Production"],
      sortOrder: 200,
    },
  },
  {
    matchTitle: "Storm",
    workData: {
      title: "Storm",
      slug: "storm-ai-short",
      workType: "personal",
      roleCredits: "Direction, AI Pipeline Design, Post-Production",
      categories: ["AI Production"],
      sortOrder: 199,
    },
  },
  {
    // Match partial - the title in CMS may vary
    matchPattern: /joshua.*norton|america.*emperor/i,
    workData: {
      title: "America's Emperor / Joshua Norton",
      slug: "americas-emperor-joshua-norton",
      workType: "personal",
      roleCredits: "Direction, Research, AI Pipeline, Post-Production",
      categories: ["AI Production", "Documentary"],
      sortOrder: 198,
    },
  },
  {
    matchPattern: /serene|el mohim|el zaman|ai music video/i,
    workData: {
      title: "AI Music Videos: Serene, El Mohim, El Zaman",
      slug: "ai-music-videos",
      workType: "personal",
      roleCredits: "Direction, Composition, AI Video Production",
      categories: ["AI Production"],
      sortOrder: 197,
    },
  },
  {
    matchPattern: /text.to.image|d-caf|dcaf/i,
    workData: {
      title: "Text-to-Image Exhibition (D-CAF Cairo)",
      slug: "text-to-image-exhibition",
      workType: "personal",
      roleCredits: "Direction, AI Pipeline, Installation Design",
      categories: ["AI Production"],
      sortOrder: 196,
    },
  },
  {
    matchPattern: /deforum|prompt.*keyframe/i,
    workData: {
      title: "Deforum Prompt Keyframe Assistant",
      slug: "deforum-prompt-keyframe-assistant",
      workType: "personal",
      roleCredits: "Development, Open-Source Tool, AI Animation Pipeline",
      categories: ["AI Production", "Digital"],
      sortOrder: 195,
    },
  },
];

// ── Placeholder client work entries (hidden until Omar adds details) ──

const aiEraClientPlaceholders = [
  {
    title: "Saudia Airlines - AI Campaign",
    slug: "saudia-airlines-ai",
    client: "Saudia Airlines",
    workType: "client",
    categories: ["Commercial", "AI Production"],
    hidden: true,
    featured: false,
    sortOrder: 300,
  },
  {
    title: "GMC - AI Production",
    slug: "gmc-ai-production",
    client: "GMC",
    workType: "client",
    categories: ["Commercial", "AI Production"],
    hidden: true,
    featured: false,
    sortOrder: 299,
  },
  {
    title: "ADCB - AI Campaign",
    slug: "adcb-ai-campaign",
    client: "ADCB",
    workType: "client",
    categories: ["Commercial", "AI Production"],
    hidden: true,
    featured: false,
    sortOrder: 298,
  },
  {
    title: "FAB - AI Production",
    slug: "fab-ai-production",
    client: "FAB",
    workType: "client",
    categories: ["Commercial", "AI Production"],
    hidden: true,
    featured: false,
    sortOrder: 297,
  },
  {
    title: "e& - AI Campaign",
    slug: "etisalat-ai-campaign",
    client: "e&",
    workType: "client",
    categories: ["Commercial", "AI Production"],
    hidden: true,
    featured: false,
    sortOrder: 296,
  },
  {
    title: "Core42 - AI Production",
    slug: "core42-ai-production",
    client: "Core42",
    workType: "client",
    categories: ["Commercial", "AI Production"],
    hidden: true,
    featured: false,
    sortOrder: 295,
  },
];

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log("Logging in...");
  const token = await login();
  console.log("Logged in.\n");

  // ── Step 1: Migrate Projects to Work ──────────────────────────

  console.log("=== Step 1: Migrate Projects to Work ===\n");
  const allProjects = await findAll(token, "projects");
  console.log(`Found ${allProjects.length} projects in CMS.\n`);

  for (const migration of projectsToMigrate) {
    const project = allProjects.find((p) => {
      if (migration.matchTitle) return p.title === migration.matchTitle;
      if (migration.matchPattern) return migration.matchPattern.test(p.title);
      return false;
    });

    if (project) {
      console.log(`  Found project: "${project.title}" (id: ${project.id})`);

      // Copy over coverImage, description, media, gallery, tags from original
      const workEntry = {
        ...migration.workData,
        coverImage: typeof project.coverImage === "object" ? project.coverImage.id : project.coverImage,
        description: project.description,
        media: project.media,
        tags: project.tags,
      };

      // Copy gallery if exists
      if (project.gallery && project.gallery.length > 0) {
        workEntry.gallery = project.gallery.map((g) =>
          typeof g === "object" ? g.id : g
        );
      }

      const created = await create(token, "work", workEntry);
      if (created) {
        console.log(`  -> Created Work entry: "${created.title}" (id: ${created.id})`);

        // Hide the original project
        await update(token, "projects", project.id, { hidden: true });
        console.log(`  -> Hidden original project (id: ${project.id})\n`);
      }
    } else {
      console.log(`  WARNING: No matching project found for: ${migration.workData.title}`);
      console.log(`    Creating Work entry without migrated data...\n`);

      const created = await create(token, "work", migration.workData);
      if (created) {
        console.log(`  -> Created Work entry (no cover/media): "${created.title}" (id: ${created.id})\n`);
      }
    }
  }

  // ── Step 2: Re-categorize Branding items ──────────────────────

  console.log("=== Step 2: Re-categorize Branding items ===\n");
  const allWork = await findAll(token, "work");

  for (const work of allWork) {
    if (work.categories && work.categories.includes("Branding")) {
      const newCategories = work.categories
        .filter((c) => c !== "Branding")
        .concat("Design");
      // Deduplicate
      const unique = [...new Set(newCategories)];

      await update(token, "work", work.id, { categories: unique });
      console.log(`  Re-categorized "${work.title}": Branding -> Design`);
    }
  }
  console.log("");

  // ── Step 3: Create AI-era client placeholders ─────────────────

  console.log("=== Step 3: Create AI-era client placeholders (hidden) ===\n");

  for (const placeholder of aiEraClientPlaceholders) {
    // Check if it already exists
    const existing = allWork.find(
      (w) => w.slug === placeholder.slug || w.client === placeholder.client
    );
    if (existing) {
      console.log(`  Skipping "${placeholder.title}" - similar entry already exists (${existing.title})`);
      continue;
    }

    const created = await create(token, "work", placeholder);
    if (created) {
      console.log(`  Created placeholder: "${created.title}" (hidden, id: ${created.id})`);
    }
  }
  console.log("");

  // ── Step 4: Delete all blog posts ─────────────────────────────

  console.log("=== Step 4: Delete all blog posts ===\n");
  const allPosts = await findAll(token, "blog-posts");
  console.log(`Found ${allPosts.length} blog posts to delete.\n`);

  for (const post of allPosts) {
    const ok = await deleteDoc(token, "blog-posts", post.id);
    console.log(`  ${ok ? "Deleted" : "FAILED"}: "${post.title}" (id: ${post.id})`);
  }
  console.log("");

  // ── Step 5: Set workType on existing Work items ───────────────

  console.log("=== Step 5: Set workType='client' on existing Work items ===\n");
  // Refresh the list after creating new entries
  const updatedWork = await findAll(token, "work");

  for (const work of updatedWork) {
    if (!work.workType) {
      await update(token, "work", work.id, { workType: "client" });
      console.log(`  Set workType=client: "${work.title}"`);
    }
  }
  console.log("");

  console.log("=== Migration complete! ===");
  console.log("Next steps:");
  console.log("  1. Check /work to verify migrated items appear correctly");
  console.log("  2. Check /studio to verify migrated items no longer show");
  console.log("  3. Unhide AI-era client placeholders in /admin after adding details");
  console.log("  4. Set sort orders in /admin to push AI-era work to the top");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
