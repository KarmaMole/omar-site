import type { Metadata } from "next";
import { FEED, OG_BASE, TWITTER_BASE } from "@/lib/meta-base";
import { notFound, permanentRedirect } from "next/navigation";
import JsonLd from "@/components/json-ld";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import DeckRoot from "@/components/deck/deck-root";
import { EndSlide, More } from "@/components/deck/parts";
import { Group } from "@/components/deck/archive";
import { DispatchCard } from "@/components/deck/dispatch-card";
import { clientLabel, coverOf, displayTitle } from "@/lib/deck";
import { splitBodyByEmbeds } from "@/lib/parse-embeds";
import { toEmbedUrl } from "@/lib/embed-url";
import { getBlogPostBySlug, getAllBlogSlugs, getRecentBlogPosts, getDeckWork } from "@/lib/payload/queries";
import { formatDateShort } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";
import { PERSON_REF } from "@/lib/person";
import { absUrl } from "@/lib/abs-url";
import { stripEmDashes } from "@/lib/seo-text";
import { sourceSerif } from "@/lib/fonts";

interface DispatchPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DispatchPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  // Throwing here (not just in the page) makes missing slugs a real 404
  if (!post) notFound();
  // CMS meta.title often already contains brand suffix, so bypass the layout
  // template with `absolute` when it's set. Otherwise fall back to post.title
  // and let the template add the brand.
  const title = post.meta?.title
    ? { absolute: post.meta.title }
    : post.title;
  const ogTitle = post.meta?.title ?? post.title;
  // Defensive trim: catches trailing whitespace on older posts whose
  // descriptions were sliced mid-word before the word-boundary fix.
  const rawDescription = post.meta?.description ?? post.excerpt ?? undefined;
  const description = rawDescription ? stripEmDashes(rawDescription.trimEnd()) : undefined;
  return {
    title,
    description,
    alternates: {
      types: FEED,
      canonical: `/dispatch/${slug}`,
    },
    openGraph: {
      ...OG_BASE,
      type: "article",
      title: ogTitle,
      description,
      url: `/dispatch/${slug}`,
      publishedTime: post.date ?? undefined,
      modifiedTime: post.updatedAt ?? undefined,
      authors: [SITE_URL + "/about"],
      ...(post.categories?.length ? { tags: post.categories } : {}),
    },
    twitter: {
      ...TWITTER_BASE,
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}

export const revalidate = 60;

// The page title is already the h1, so an h1 inside the markdown body is demoted
// to h2 (some older posts open with their own "# Title").
const markdownComponents: Components = {
  h1: ({ node, ...props }) => {
    void node;
    return <h2 {...props} />;
  },
};

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function DispatchPostPage({ params }: DispatchPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();
  // Dispatches published elsewhere have no body here; send readers (and crawlers) to the publication
  if (post.isExternal && post.publicationUrl) permanentRedirect(post.publicationUrl);

  const cover = typeof post.coverImage === "object" && post.coverImage ? post.coverImage : null;
  const tags = post.tags?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];

  // Resolve image-N references in markdown body
  let body = post.body ?? "";
  if (body && post.images?.length) {
    post.images.forEach((entry, i) => {
      const img = typeof entry.image === "object" && entry.image ? entry.image : null;
      if (!img?.url) return;
      const url = img.sizes?.hero?.url ?? img.url;
      body = body.replaceAll(`(image-${i + 1})`, `(${url})`);
    });
  }

  const words = (post.body ?? "").split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 230));

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: stripEmDashes(post.title),
    ...(post.excerpt ? { description: stripEmDashes(post.excerpt) } : {}),
    ...(post.date ? { datePublished: post.date } : {}),
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    ...(cover?.url ? { image: absUrl(cover.url) } : {}),
    author: PERSON_REF,
    publisher: PERSON_REF,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/dispatch/${slug}` },
    ...(post.categories?.length ? { articleSection: post.categories } : {}),
    ...(tags.length ? { keywords: tags } : {}),
    wordCount: words,
    url: `${SITE_URL}/dispatch/${slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Dispatch", item: `${SITE_URL}/dispatch` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/dispatch/${slug}` },
    ],
  };

  const [recent, work] = await Promise.all([getRecentBlogPosts(40), getDeckWork()]);
  const idx = recent.findIndex((p) => p.slug === slug);
  const next = recent.length > 1 ? recent[(idx + 1) % recent.length] : null;
  /* keep reading: the next dispatch, then the two sharing the most topics with this one */
  const cats = new Set(post.categories ?? []);
  const alike = recent
    .filter((p) => p.slug !== slug && p.slug !== next?.slug)
    .map((p, k) => ({ p, k, n: (p.categories ?? []).filter((c) => cats.has(c)).length }))
    .sort((a, b) => b.n - a.n || a.k - b.k)
    .slice(0, 2)
    .map((x) => x.p);
  const keep = [next, ...alike].filter((p): p is NonNullable<typeof p> => !!p);
  /* from the work: pieces this dispatch names, then the newest AI production */
  const text = `${post.title} ${post.body ?? ""} ${post.tags ?? ""}`.toLowerCase();
  const esc = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const has = (t: string) => new RegExp(`\\b${esc(t.toLowerCase())}\\b`).test(text);
  /* a piece counts as named when its title and its client both appear (titles alone are often generic words) */
  const named = work.filter((w) => {
    const label = clientLabel(w.client);
    return label ? label.length >= 3 && has(label) && has(displayTitle(w.title, label)) : w.title.length >= 8 && has(w.title);
  });
  const newestAi = [...work]
    .filter((w) => w.categories?.includes("AI Production"))
    .sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));
  const fromWork = [...new Map([...named, ...newestAi].map((w) => [w.slug, w])).values()].slice(0, 3);

  return (
    <DeckRoot mode="doc">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <section className="slide title-slide a-title" data-title={post.title}>
        <header className="head">
          <span className="no">Dispatch{post.date ? ` · ${formatDateShort(post.date)}` : ""}</span>
          <h1>{post.title}</h1>
          {post.excerpt ? <p className={`stand ${sourceSerif.className}`}>{stripEmDashes(post.excerpt)}</p> : null}
          <div className="meta">
            <span><b>Omar Kamel</b></span>
            <span>{minutes} min read</span>
            {post.categories?.length ? <span>{post.categories.join(" · ")}</span> : null}
          </div>
        </header>
        {cover?.url ? (
          <figure className="a-cover" style={{ ["--r" as string]: cover.width && cover.height ? (cover.width / cover.height).toFixed(4) : "1.7778" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover.sizes?.hero?.url ?? cover.url} alt={cover.alt ?? ""} fetchPriority="high" />
          </figure>
        ) : null}
      </section>
      <div className="wrap">
        {post.body ? (
          <article className={`prose-long serif ${sourceSerif.className}`}>
            {splitBodyByEmbeds(body).map((seg, i) =>
              seg.kind === "text" ? (
                <Markdown key={i} remarkPlugins={[remarkGfm]} components={markdownComponents}>{seg.content}</Markdown>
              ) : (
                <div key={i} className={`embed${seg.embed.type === "spotify" || seg.embed.type === "soundcloud" ? " audio" : ""}`}>
                  <iframe src={toEmbedUrl(seg.embed.type, seg.embed.url)} title={post.title} loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />
                </div>
              ),
            )}
          </article>
        ) : null}
        {tags.length > 0 ? <p className="a-tags">{tags.join(" · ")}</p> : null}
        <div className="a-end">
          <More href="/dispatch">All dispatches</More>
          <More href="/feed.xml" external>Follow by RSS</More>
        </div>
        {keep.length > 0 ? (
          <section className="yr keep">
            <header><h2>Keep Reading</h2><span className="count">{String(keep.length).padStart(2, "0")} dispatches</span></header>
            <ol className="dgrid">{keep.map((p) => <DispatchCard key={p.id} post={p} />)}</ol>
          </section>
        ) : null}
        {fromWork.length > 0 ? (
          <Group title="From the Work" sub={named.length ? "the pieces this dispatch is about, then the newest" : "the newest ai production"} count={fromWork.length} start={0}
            items={fromWork.map((w) => {
              const label = clientLabel(w.client);
              return { key: w.slug, href: `/work/${w.slug}`, cover: coverOf(w), client: label, title: displayTitle(w.title, label), sub: (w.categories ?? []).join(", ").toLowerCase(), cats: [] };
            })} />
        ) : null}
      </div>
      <EndSlide />
    </DeckRoot>
  );
}
