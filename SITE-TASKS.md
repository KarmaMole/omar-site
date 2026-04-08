# SITE-TASKS.md — omarkamel.com Restructuring Plan

This file describes all pending restructuring tasks for omarkamel.com. Each task is independently actionable. Do NOT execute all at once — work through them by tier priority, confirming with Omar before making irreversible content/data changes.

## Architecture Reference

- **Framework:** Next.js 15 (App Router)
- **CMS:** Payload CMS (`payload.config.ts`, collections in `/collections/`)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel
- **Key files:**
  - Navigation: `components/nav.tsx` (contains `navItems` array)
  - Work page: `app/(site)/work/page.tsx` (uses `getAllWork` query, filterable by category)
  - Explore page: `app/(site)/explore/page.tsx` (uses `getAllProjects` query)
  - Services page: `app/(site)/services/page.tsx` (exists but NOT in nav)
  - Work collection: `collections/Work.ts` (categories: Commercial, Branding, Corporate, Documentary, Awareness, Design, Digital)
  - Projects collection: `collections/Projects.ts` (contentType: music, visual, comics, film, ai, writing, photography, research)
  - Blog collection: `collections/BlogPosts.ts`
  - Blog pages: `app/(site)/blog/` and `app/(site)/writing/`
  - Queries: `lib/payload/queries.ts`

---

## TIER 1 — THIS WEEK (highest impact)

### Task 1: Restructure the Work Section

**Goal:** Add subcategories so AI-era work and personal productions sit alongside client work in a single filterable grid.

**Steps:**

1. **Keep the page title "Work".** The subtitle or intro text can mention "selected work" but the `<h1>` and nav label stay as "Work".

2. **Add a `workType` field to the Work collection.** In `collections/Work.ts`, add a new select field:
   ```
   {
     name: "workType",
     type: "select",
     options: [
       { label: "Client Work", value: "client" },
       { label: "Personal Work", value: "personal" },
     ],
     defaultValue: "client",
     admin: { position: "sidebar" },
   }
   ```

3. **Single grid with filter tabs.** Do NOT split into two separate grids. Keep the existing filterable grid layout. Add "Client Work" and "Personal Work" as filter options alongside the category filters. Users can filter by type, by category, or both.

4. **Replace the category list.** Update `collections/Work.ts` categories to this approved list:
   - Commercial
   - Corporate
   - Documentary
   - AI Production
   - Design
   - Digital
   - Awareness

   Remove: Branding (fold existing Branding items into Design or Commercial as appropriate).

5. **Migrate these items from the Projects collection into the Work collection as Personal Work** (workType: "personal"). Create new Work entries for each:

   | Title | Role Credits | Category |
   |---|---|---|
   | The Strangers (AI sci-fi trailer) | Direction, AI Pipeline Design, Post-Production | AI Production |
   | Storm (AI short film) | Direction, AI Pipeline Design, Post-Production | AI Production |
   | America's Emperor / Joshua Norton (AI doc essay) | Direction, Research, AI Pipeline, Post-Production | AI Production, Documentary |
   | AI Music Videos: Serene, El Mohim, El Zaman | Direction, Composition, AI Video Production | AI Production |
   | Text-to-Image Exhibition (D-CAF Cairo) | Direction, AI Pipeline, Installation Design | AI Production |
   | Deforum Prompt Keyframe Assistant | Development, Open-Source Tool, AI Animation Pipeline | AI Production, Digital |

   For Personal Work items, display role credits instead of client name. Add a `roleCredits` text field to `collections/Work.ts` if one doesn't exist.

6. **Push AI-era client work to the top.** Ensure these clients appear prominently: Saudia Airlines, GMC, ADCB, FAB, e&, Core42. Use `sortOrder` or `featured` flag. If these entries don't exist yet, flag to Omar that they need to be added via the CMS.

7. **Remove migrated items from the Projects collection** (or mark hidden) so they no longer appear on the Explore/Personal page.

---

### Task 2: Rename "Explore" to "Studio"

**Goal:** Rebrand the Explore section as "Studio" — a clean showcase of Omar's non-professional creative work.

**Steps:**

1. **Change the route schema entirely.** Rename `app/(site)/explore/` to `app/(site)/studio/`. This is a clean rename — no redirects, just change the route.

2. **Update the nav.** In `components/nav.tsx`, change `{ href: "/explore", label: "Explore" }` to `{ href: "/studio", label: "Studio" }`.

3. **Update page metadata and heading.** Change `metadata.title` to "Studio" and update the page heading.

4. **Curate the content order.** The Studio section should show (in this order):
   - Music albums (first — strongest, most unique)
   - Photography
   - PKD alt book covers
   - Ninja Bunnies
   
   Items migrated to Work (Task 1) must no longer appear here. 6DOF Reviews should NOT appear here — it already lives in Transmissions on the homepage.

5. **Add a brief framing line** as section intro. Something short and unpretentious — no title or employer mention. Example direction: "Self-directed projects — films, music, comics, and tools built because production is the craft, not just the job." Confirm final copy with Omar.

6. **Ordering:** If the Projects collection doesn't have a `sortOrder` field, add one. Set sort orders to match the display order above.

---

### Task 3: Link the Services Page in Navigation

**Goal:** The services page exists at `app/(site)/services/page.tsx` but is not linked in the nav.

**Steps:**

1. In `components/nav.tsx`, add Services to the `navItems` array. Final nav order:
   ```js
   const navItems = [
     { href: "/", label: "Home" },
     { href: "/work", label: "Work" },
     { href: "/services", label: "Services" },
     { href: "/studio", label: "Studio" },
     { href: "/dispatch", label: "Dispatch" },
     { href: "/about", label: "About" },
   ];
   ```

2. The services page currently has `robots: { index: false, follow: false }` in its metadata. Remove this or set `index: true` so search engines can find it.

---

### Task 4: Rename "Writing" to "Dispatch" and Reset Content

**Goal:** Rebrand the writing/blog section as "Dispatch" — professional articles about AI production, workflows, and industry. Delete all existing blog content (old personal/cultural essays are being moved to karmamole.com).

**Steps:**

1. **Rename the route.** Change `app/(site)/writing/` (or `app/(site)/blog/`) to `app/(site)/dispatch/`.

2. **Update nav** to `{ href: "/dispatch", label: "Dispatch" }`.

3. **Delete all existing blog post content** from the BlogPosts collection in Payload CMS. All of it. Omar is starting fresh.

4. **Update page metadata and heading** to "Dispatch".

5. **Remind Omar (via Maestro) to write articles for this section.** Suggested starter topics:
   - How AI pipelines actually work in ad production (workflow breakdown)
   - What AI can and can't do in creative production right now (honest take)
   - The gap between AI hype and production reality
   - Building custom ComfyUI workflows for client work
   
   These should be flagged as a recurring task for Omar.

---

## TIER 2 — THIS MONTH

### Task 5: Homepage Client Logos — Prioritize AI-Era Clients

**Goal:** Ensure AI-era clients are featured prominently on the homepage.

**Steps:**

1. Check `app/(site)/page.tsx` for how client logos are rendered. They likely come from a Clients collection.

2. Add a `featured` or `sortOrder` field to the Clients collection if one doesn't exist.

3. Ensure these clients appear first: **Saudia Airlines, GMC, ADCB, FAB, e&, Core42**.

4. Traditional clients (Coca-Cola, Christie's, Ferrero Rocher, etc.) can remain but should not lead.

---

### Task 6: SEO Optimization

**Goal:** Improve discoverability for key search terms.

**Steps:**

1. **Meta titles and descriptions.** Update metadata on key pages to target:
   - "AI creative director Dubai"
   - "AI production lead"
   - "generative AI advertising"
   - "AI creative production"
   
   Pages to update: homepage, Work, Services, About.

2. **Alt text.** Ensure all project cover images have meaningful alt text.

3. **Structured data.** Consider adding JSON-LD for Person and Organization schemas on the About page.

4. Verify `sitemap.ts`, `robots.ts`, and OpenGraph metadata are correct after all route changes.

---

## TIER 3 — THIS QUARTER

### Task 7: Add Social Proof / Testimonials

**Goal:** Add a testimonials section (homepage or About page).

**Steps:**

1. Create a `Testimonials` collection in Payload with fields: quote, attribution (name, title, company), optional photo.
2. Add a testimonials component to the homepage or About page.
3. Blocked until Omar provides actual testimonials.

---

## Important Notes

- All content is managed via Payload CMS at `/admin`. Some tasks require CMS data changes (creating/reordering entries), not just code changes.
- The migration of items from Projects to Work (Task 1) means creating new Work documents in Payload and hiding/deleting the old Project documents.
- After completing Tier 1, update the README.md to reflect the new site structure.
- Test all changes locally before deploying.
- The README currently mentions Sanity CMS — this is outdated. The CMS is Payload. Fix the README.
