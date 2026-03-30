import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TagBadge from "@/components/tag-badge";
import MediaEmbedComponent from "@/components/media-embed";
import { dummyWork } from "@/lib/dummy-data";
import { formatDate } from "@/lib/utils";

interface WorkDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = dummyWork.find((w) => w.slug.current === slug);
  if (!work) return {};
  return {
    title: work.client ? `${work.title} — ${work.client}` : work.title,
    description: `${work.title}${work.client ? ` for ${work.client}` : ""}. ${work.categories?.join(", ") ?? ""}`,
  };
}

export function generateStaticParams() {
  return dummyWork.map((w) => ({ slug: w.slug.current }));
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;
  const work = dummyWork.find((w) => w.slug.current === slug);
  if (!work) notFound();

  return (
    <div className="pt-24 pb-16">
      {/* Full-width cover placeholder */}
      <div className="aspect-[21/9] bg-gray-200 w-full flex items-center justify-center text-gray-400 text-lg font-medium">
        {work.title}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/work"
          className="text-sm text-gray-500 hover:text-brick transition-colors inline-block mb-8"
        >
          &larr; Back to Work
        </Link>

        {/* Client */}
        {work.client && (
          <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
            {work.client}
          </p>
        )}

        {/* Title */}
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
          {work.title}
        </h1>

        {/* Date */}
        {work.date && (
          <p className="text-sm text-gray-500 mb-6">{formatDate(work.date)}</p>
        )}

        {/* Categories */}
        {work.categories && work.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {work.categories.map((cat) => (
              <TagBadge key={cat} label={cat} variant="category" />
            ))}
          </div>
        )}

        {/* Tags */}
        {work.tags && work.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {work.tags.map((tag) => (
              <TagBadge key={tag} label={tag} />
            ))}
          </div>
        )}

        {/* Placeholder description */}
        <p className="text-gray-600 leading-relaxed mb-10">
          This project represents a significant milestone in the intersection of
          creative vision and technological execution. Built with a focus on
          narrative impact, the work spans multiple disciplines and pushes the
          boundaries of what AI-assisted production can achieve at a professional
          level.
        </p>

        {/* Media embeds */}
        {work.media && work.media.length > 0 && (
          <div className="space-y-6 mb-10">
            {work.media.map((embed, i) => (
              <MediaEmbedComponent key={i} embed={embed} />
            ))}
          </div>
        )}

        {/* External link */}
        {work.externalLink && (
          <a
            href={work.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-brick text-brick px-6 py-2.5 text-sm font-medium hover:bg-brick hover:text-white transition-colors rounded-sm"
          >
            View Project &rarr;
          </a>
        )}
      </div>
    </div>
  );
}
