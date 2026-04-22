import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import JsonLd from "@/components/json-ld";
import ShareRow from "@/components/share-row";
import TagBadge from "@/components/tag-badge";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MediaEmbedComponent from "@/components/media-embed";
import { splitBodyByEmbeds } from "@/lib/parse-embeds";
import { getBlogPostBySlug, getAllBlogSlugs, getRecentBlogPosts } from "@/lib/payload/queries";
import MoreItems from "@/components/more-items";
import { formatDate } from "@/lib/utils";
import { sourceSerif } from "@/lib/fonts";
import { SITE_URL } from "@/lib/constants";

interface DispatchPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DispatchPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
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
  const description = rawDescription?.trimEnd();
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

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function DispatchPostPage({ params }: DispatchPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const cover = typeof post.coverImage === "object" && post.coverImage ? post.coverImage : null;
  const categories = post.categories ?? [];
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
    ...(cover?.url ? { image: cover.url } : {}),
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

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <article className="pt-24 pb-16 animate-fade-in">
      {cover?.url && (
        <div className="relative aspect-[21/9] w-full bg-dark-200">
          <Image
            src={cover.sizes?.hero?.url ?? cover.url}
            alt={cover.alt ?? post.title}
            fill
            sizes="(max-width: 1024px) 100vw, calc(100vw - 80px)"
            className="object-cover"
            priority
          />
        </div>
      )}
      <div className={`max-w-3xl mx-auto px-6 ${cover?.url ? "py-12" : "pt-20 pb-12"}`}>
        <Link href="/dispatch" className="font-mono text-xs tracking-wider uppercase text-light-300 hover:text-cyan transition-colors inline-block mb-8">&larr; Back to Dispatch</Link>
        {post.date && <p className="text-sm uppercase tracking-widest text-light-300 font-mono mb-4">{formatDate(post.date)}</p>}
        <h1 className={`${sourceSerif.className} text-4xl md:text-6xl font-light text-light-100 leading-tight mb-6`}>{post.title}</h1>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {tags.map((tag) => (<TagBadge key={tag} label={tag} href={`/dispatch?tag=${encodeURIComponent(tag)}`} />))}
          </div>
        )}
        {post.body ? (
          <div className={`${sourceSerif.className} text-light-200`}>
            {splitBodyByEmbeds(body).map((seg, i) =>
              seg.kind === "text" ? (
                <div key={i} className="prose prose-lg prose-invert max-w-none leading-relaxed font-light">
                  <Markdown remarkPlugins={[remarkGfm]}>{seg.content}</Markdown>
                </div>
              ) : (
                <div key={i} className="my-8">
                  <MediaEmbedComponent embed={seg.embed} />
                </div>
              ),
            )}
          </div>
        ) : null}
        <ShareRow title={post.title} url={`${SITE_URL}/dispatch/${slug}`} />
        <MoreDispatch currentSlug={slug} />
      </div>
    </article>
    </>
  );
}

async function MoreDispatch({ currentSlug }: { currentSlug: string }) {
  const recent = await getRecentBlogPosts(20);
  const idx = recent.findIndex((p) => p.slug === currentSlug);
  const rotated =
    idx >= 0 ? [...recent.slice(idx + 1), ...recent.slice(0, idx)] : recent;
  const others = rotated.slice(0, 3);
  return (
    <MoreItems
      variant="text"
      items={others.map((p) => ({
        slug: p.slug,
        title: p.title,
        href: `/dispatch/${p.slug}`,
        subtitle: p.date ? new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : undefined,
        excerpt: p.excerpt ?? null,
      }))}
      label="More Dispatch"
      viewAllHref="/dispatch"
      viewAllLabel="All Dispatch"
    />
  );
}
