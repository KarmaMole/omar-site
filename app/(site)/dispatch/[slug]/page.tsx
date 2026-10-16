import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/json-ld";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import DeckRoot from "@/components/deck/deck-root";
import { More } from "@/components/deck/parts";
import { splitBodyByEmbeds } from "@/lib/parse-embeds";
import { toEmbedUrl } from "@/lib/embed-url";
import { getBlogPostBySlug, getAllBlogSlugs, getRecentBlogPosts } from "@/lib/payload/queries";
import { formatDateShort } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";
import { absUrl } from "@/lib/abs-url";
import { stripEmDashes } from "@/lib/seo-text";
import { dispatchHref } from "@/lib/dispatch-link";

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
      canonical: `/dispatch/${slug}`,
    },
    openGraph: {
      type: "article",
      title: ogTitle,
      description,
      url: `/dispatch/${slug}`,
      publishedTime: post.date ?? undefined,
    },
    twitter: {
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

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(post.date ? { datePublished: post.date } : {}),
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    ...(cover?.url ? { image: absUrl(cover.url) } : {}),
    author: {
      "@type": "Person",
      name: "Omar Kamel",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Omar Kamel",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.svg`,
      },
    },
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

  const words = (post.body ?? "").split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 230));
  const recent = await getRecentBlogPosts(20);
  const idx = recent.findIndex((p) => p.slug === slug);
  const next = recent.length > 1 ? recent[(idx + 1) % recent.length] : null;
  const nextLink = next ? dispatchHref(next) : null;

  return (
    <DeckRoot mode="doc">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <section className="slide title-slide a-title" data-title={post.title}>
        <header className="head">
          <span className="no">Dispatch{post.date ? ` · ${formatDateShort(post.date)}` : ""}</span>
          <h1>{post.title}</h1>
          {post.excerpt ? <p className="stand">{stripEmDashes(post.excerpt)}</p> : null}
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
          <article className="prose-long">
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
          {next && nextLink ? <More href={nextLink.href} external={nextLink.external}>Next: {next.title}</More> : null}
        </div>
      </div>
    </DeckRoot>
  );
}
