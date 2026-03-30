import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TagBadge from "@/components/tag-badge";
import { dummyBlogPosts } from "@/lib/dummy-data";
import { formatDate } from "@/lib/utils";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = dummyBlogPosts.find((p) => p.slug.current === slug);
  if (!post) return {};
  return {
    title: post.seo?.metaTitle ?? post.title,
    description: post.seo?.metaDescription ?? post.excerpt,
    openGraph: {
      type: "article",
      title: post.seo?.metaTitle ?? post.title,
      description: post.seo?.metaDescription ?? post.excerpt,
      publishedTime: post.date,
    },
  };
}

export function generateStaticParams() {
  return dummyBlogPosts.map((p) => ({ slug: p.slug.current }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = dummyBlogPosts.find((p) => p.slug.current === slug);
  if (!post) notFound();

  return (
    <article className="pt-24 pb-16">
      {/* Full-width cover placeholder */}
      <div className="aspect-[21/9] bg-gray-200 w-full flex items-center justify-center text-gray-400 text-lg font-medium">
        {post.title}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="text-sm text-gray-500 hover:text-brick transition-colors inline-block mb-8"
        >
          &larr; Back to Blog
        </Link>

        {/* Date */}
        {post.date && (
          <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">
            {formatDate(post.date)}
          </p>
        )}

        {/* Title */}
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
          {post.title}
        </h1>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {post.tags.map((tag) => (
              <TagBadge key={tag} label={tag} />
            ))}
          </div>
        )}

        {/* Body content */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
          {post.excerpt && <p className="text-xl text-gray-600 leading-relaxed">{post.excerpt}</p>}

          <p>
            There is a particular kind of clarity that only comes from time in the field — years of
            decisions made under real constraints, with real clients, on real deadlines. That
            experience doesn&apos;t make you arrogant about what&apos;s new; it makes you more
            precise about what actually matters versus what is noise dressed as signal.
          </p>

          <h2 className="font-serif text-2xl font-bold mt-10 mb-4">
            The Shift Beneath the Surface
          </h2>

          <blockquote className="border-l-4 border-brick pl-6 text-gray-600 italic my-8">
            &ldquo;The tools change. The instinct for what makes something work — that&apos;s the
            constant.&rdquo;
          </blockquote>

          <p>
            Generative AI did not arrive quietly. But the professionals who are navigating it well
            are not the ones who abandoned their craft for prompts — they are the ones who brought
            their craft into the prompt. Taste, structure, pacing, restraint: these remain the
            differentiators. The machine handles the render; you still have to know what to render.
          </p>
        </div>
      </div>
    </article>
  );
}
