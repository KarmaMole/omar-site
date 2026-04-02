import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import TagBadge from "@/components/tag-badge";
import MediaEmbedComponent from "@/components/media-embed";
import { RichText } from "@/components/rich-text";
import { getWorkBySlug, getAllWorkSlugs } from "@/lib/payload/queries";
import { formatDate } from "@/lib/utils";

interface WorkDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) return {};
  return {
    title: work.client ? `${work.title} — ${work.client}` : work.title,
    description: `${work.title}${work.client ? ` for ${work.client}` : ""}. ${work.categories?.join(", ") ?? ""}`,
  };
}

export async function generateStaticParams() {
  const slugs = await getAllWorkSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) notFound();

  const cover = typeof work.coverImage === "object" ? work.coverImage : null;
  const tags = work.tags?.map((t) => t.tag) ?? [];

  return (
    <div className="pt-24 pb-16">
      {cover?.url ? (
        <div className="relative aspect-[21/9] w-full">
          <Image src={cover.sizes?.hero?.url ?? cover.url} alt={cover.alt} fill className="object-cover" priority />
        </div>
      ) : (
        <div className="aspect-[21/9] bg-gray-200 w-full flex items-center justify-center text-gray-400 text-lg font-medium">{work.title}</div>
      )}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/work" className="text-sm text-gray-500 hover:text-brick transition-colors inline-block mb-8">&larr; Back to Work</Link>
        {work.client && <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">{work.client}</p>}
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{work.title}</h1>
        {work.date && <p className="text-sm text-gray-500 mb-6">{formatDate(work.date)}</p>}
        {work.categories && work.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {work.categories.map((cat) => (<TagBadge key={cat} label={cat} variant="category" />))}
          </div>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map((tag) => (<TagBadge key={tag} label={tag} />))}
          </div>
        )}
        {work.description && <RichText data={work.description} className="mb-10" />}
        {work.media && work.media.length > 0 && (
          <div className="space-y-6 mb-10">
            {work.media.map((embed, i) => (<MediaEmbedComponent key={i} embed={embed} />))}
          </div>
        )}
        {work.externalLink && (
          <a href={work.externalLink} target="_blank" rel="noopener noreferrer" className="inline-block border border-brick text-brick px-6 py-2.5 text-sm font-medium hover:bg-brick hover:text-white transition-colors rounded-sm">
            View Project &rarr;
          </a>
        )}
      </div>
    </div>
  );
}
