import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import JsonLd from "@/components/json-ld";
import MediaEmbedComponent from "@/components/media-embed";
import { RichText } from "@/components/rich-text";
import { getWorkBySlug, getAllWorkSlugs, getAllWork } from "@/lib/payload/queries";
import MoreItems from "@/components/more-items";
import GalleryGrid from "@/components/gallery-grid";
import { formatDate } from "@/lib/utils";

interface WorkDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) return {};
  const cover =
    typeof work.coverImage === "object" && work.coverImage
      ? work.coverImage
      : null;
  return {
    title: work.client ? `${work.title} -- ${work.client}` : work.title,
    description: `${work.title}${work.client ? ` for ${work.client}` : work.roleCredits ? ` - ${work.roleCredits}` : ""}. ${work.categories?.join(", ") ?? ""}`,
    openGraph: {
      type: "article",
      title: work.client ? `${work.title} - ${work.client}` : work.title,
      description: `${work.title}${work.client ? ` for ${work.client}` : work.roleCredits ? ` - ${work.roleCredits}` : ""}. ${work.categories?.join(", ") ?? ""}`,
      ...(cover?.url
        ? {
            images: [
              {
                url: cover.url,
                width: cover.width ?? undefined,
                height: cover.height ?? undefined,
                alt: cover.alt ?? work.title,
              },
            ],
          }
        : {}),
    },
  };
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllWorkSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) notFound();

  const cover = typeof work.coverImage === "object" ? work.coverImage : null;

  const workJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: work.title,
    description: `${work.title}${work.client ? ` for ${work.client}` : ""}`,
    ...(cover?.url ? { image: cover.url } : {}),
    ...(work.date ? { datePublished: work.date } : {}),
    author: {
      "@type": "Person",
      name: "Omar Kamel",
      url: "https://omarkamel.com",
    },
    ...(work.categories?.length ? { keywords: work.categories } : {}),
    url: `https://omarkamel.com/work/${slug}`,
  };

  return (
    <>
    <JsonLd data={workJsonLd} />
    <div className="pt-24 pb-16 animate-fade-in">
      {cover?.url && (
        <div className="relative aspect-[21/9] w-full bg-dark-200">
          <Image
            src={cover.sizes?.hero?.url ?? cover.url}
            alt={cover.alt ?? work.title}
            fill
            sizes="(max-width: 1024px) 100vw, calc(100vw - 80px)"
            className="object-cover"
            priority
          />
        </div>
      )}
      <div className={`max-w-3xl mx-auto px-6 ${cover?.url ? "py-12" : "pt-20 pb-12"}`}>
        <Link href="/work" className="font-mono text-xs tracking-wider uppercase text-light-300 hover:text-cyan transition-colors inline-block mb-8">&larr; Back to Work</Link>
        {(work.client || work.roleCredits) && (
          <p className="text-sm uppercase tracking-widest text-light-300 font-mono mb-2">
            {work.client || work.roleCredits}
          </p>
        )}
        <h1 className="text-4xl md:text-5xl font-light text-light-100 mb-4">{work.title}</h1>
        {work.date && <p className="text-sm text-light-300 font-mono mb-6">{formatDate(work.date)}</p>}
        <div className="mb-8" />
        {work.description ? <RichText data={work.description} className="mb-10" /> : null}
        {work.gallery && Array.isArray(work.gallery) && work.gallery.length > 0 && (
          <GalleryGrid
            images={work.gallery.filter(
              (img): img is Extract<typeof img, { url: string }> =>
                typeof img === "object" && img !== null && "url" in img
            )}
            title={work.title}
          />
        )}
        {work.media && work.media.length > 0 && (
          <div className="space-y-6 mb-10">
            {work.media.map((embed) => (<MediaEmbedComponent key={embed.url} embed={embed} />))}
          </div>
        )}
        {work.externalLink && (
          <a href={work.externalLink} target="_blank" rel="noopener noreferrer" className="inline-block border border-cyan text-cyan px-6 py-2.5 text-sm font-mono hover:bg-cyan hover:text-black transition-colors rounded-[2px]">
            View Project &rarr;
          </a>
        )}
        <MoreWork currentSlug={slug} />
      </div>
    </div>
    </>
  );
}

async function MoreWork({ currentSlug }: { currentSlug: string }) {
  const allWork = await getAllWork();
  // Rotate the list starting after the current item so each work detail
  // page shows a different set of neighbors instead of always the top 3.
  const idx = allWork.findIndex((w) => w.slug === currentSlug);
  const rotated =
    idx >= 0 ? [...allWork.slice(idx + 1), ...allWork.slice(0, idx)] : allWork;
  const others = rotated.slice(0, 3);
  return (
    <MoreItems
      items={others.map((w) => ({
        slug: w.slug,
        title: w.title,
        coverImage: w.coverImage,
        href: `/work/${w.slug}`,
        subtitle: w.client || w.roleCredits || undefined,
      }))}
      label="More Work"
      viewAllHref="/work"
      viewAllLabel="View All Work"
    />
  );
}
