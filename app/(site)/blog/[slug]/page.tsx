import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Source_Serif_4 } from "next/font/google";
import JsonLd from "@/components/json-ld";
import FadeIn from "@/components/fade-in";
import PageTransition from "@/components/page-transition";
import TagBadge from "@/components/tag-badge";
import { RichText } from "@/components/rich-text";
import { getBlogPostBySlug, getAllBlogSlugs, getRecentBlogPosts } from "@/lib/payload/queries";
import MoreItems from "@/components/more-items";
import { formatDate } from "@/lib/utils";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
});

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  const cover =
    typeof post.coverImage === "object" && post.coverImage
      ? post.coverImage
      : null;
  return {
    title: post.meta?.title ?? post.title,
    description: post.meta?.description ?? post.excerpt,
    openGraph: {
      type: "article",
      title: post.meta?.title ?? post.title,
      description: post.meta?.description ?? post.excerpt ?? undefined,
      publishedTime: post.date ?? undefined,
      ...(cover?.url
        ? {
            images: [
              {
                url: cover.url,
                width: cover.width ?? undefined,
                height: cover.height ?? undefined,
                alt: cover.alt ?? post.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta?.title ?? post.title,
      description: post.meta?.description ?? post.excerpt ?? undefined,
      ...(cover?.url ? { images: [cover.url] } : {}),
    },
  };
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const cover = typeof post.coverImage === "object" && post.coverImage ? post.coverImage : null;
  const tags = post.tags?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];

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
      url: "https://omarkamel.com",
    },
    publisher: {
      "@type": "Person",
      name: "Omar Kamel",
      url: "https://omarkamel.com",
    },
    url: `https://omarkamel.com/blog/${slug}`,
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <PageTransition>
      <article className="pt-24 pb-16">
      {cover?.url && (
        <div className="relative aspect-[21/9] w-full bg-dark-200">
          <Image src={cover.sizes?.hero?.url ?? cover.url} alt={cover.alt ?? post.title} fill className="object-cover" priority />
        </div>
      )}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/writing" className="font-mono text-xs tracking-wider uppercase text-light-300 hover:text-cyan transition-colors inline-block mb-8">&larr; Back to Writing</Link>
        {post.date && <p className="text-sm uppercase tracking-widest text-light-300 font-mono mb-4">{formatDate(post.date)}</p>}
        <FadeIn>
        <h1 className={`${sourceSerif.className} text-4xl md:text-5xl font-bold text-light-100 mb-6`}>{post.title}</h1>
        </FadeIn>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {tags.map((tag) => (<TagBadge key={tag} label={tag} href={`/writing?tag=${encodeURIComponent(tag)}`} />))}
          </div>
        )}
        {post.body ? <RichText data={post.body} className={`${sourceSerif.className} prose prose-invert prose-lg max-w-none text-light-200 leading-relaxed`} /> : null}
        <MoreWriting currentSlug={slug} />
      </div>
    </article>
    </PageTransition>
    </>
  );
}

async function MoreWriting({ currentSlug }: { currentSlug: string }) {
  // Pull a wider window so rotation has room to show different neighbors
  // instead of always the same top 3.
  const recent = await getRecentBlogPosts(20);
  const idx = recent.findIndex((p) => p.slug === currentSlug);
  const rotated =
    idx >= 0 ? [...recent.slice(idx + 1), ...recent.slice(0, idx)] : recent;
  const others = rotated.slice(0, 3);
  return (
    <MoreItems
      items={others.map((p) => ({
        slug: p.slug,
        title: p.title,
        coverImage: p.coverImage,
        href: `/blog/${p.slug}`,
        subtitle: p.date ? new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : undefined,
      }))}
      label="More Writing"
      viewAllHref="/writing"
      viewAllLabel="All Writing"
    />
  );
}
