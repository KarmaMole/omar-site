import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import TagBadge from "@/components/tag-badge";
import { RichText } from "@/components/rich-text";
import { getBlogPostBySlug, getAllBlogSlugs } from "@/lib/payload/queries";
import { formatDate } from "@/lib/utils";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.meta?.title ?? post.title,
    description: post.meta?.description ?? post.excerpt,
    openGraph: {
      type: "article",
      title: post.meta?.title ?? post.title,
      description: post.meta?.description ?? post.excerpt ?? undefined,
      publishedTime: post.date ?? undefined,
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const cover = typeof post.coverImage === "object" && post.coverImage ? post.coverImage : null;
  const tags = post.tags?.map((t) => t.tag) ?? [];

  return (
    <article className="pt-24 pb-16">
      {cover?.url ? (
        <div className="relative aspect-[21/9] w-full">
          <Image src={cover.sizes?.hero?.url ?? cover.url} alt={cover.alt} fill className="object-cover" priority />
        </div>
      ) : (
        <div className="aspect-[21/9] bg-gray-200 w-full flex items-center justify-center text-gray-400 text-lg font-medium">{post.title}</div>
      )}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/blog" className="text-sm text-gray-500 hover:text-brick transition-colors inline-block mb-8">&larr; Back to Blog</Link>
        {post.date && <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">{formatDate(post.date)}</p>}
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {tags.map((tag) => (<TagBadge key={tag} label={tag} />))}
          </div>
        )}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
          {post.excerpt && <p className="text-xl text-gray-600 leading-relaxed">{post.excerpt}</p>}
          {post.body ? <RichText data={post.body} /> : null}
        </div>
      </div>
    </article>
  );
}
