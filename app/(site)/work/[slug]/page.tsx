import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import JsonLd from "@/components/json-ld";
import ShareRow from "@/components/share-row";
import MediaEmbedComponent from "@/components/media-embed";
import { RichText } from "@/components/rich-text";
import { getWorkBySlug, getAllWorkSlugs, getAllWork } from "@/lib/payload/queries";
import MoreItems from "@/components/more-items";
import GalleryGrid from "@/components/gallery-grid";
import { formatDate } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";
import { absUrl } from "@/lib/abs-url";
import { describeFromRichText } from "@/lib/seo-text";
import type { WorkDoc } from "@/lib/payload/types";

interface WorkDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** "Title for Client", or just the title when there is no client. */
function workTitle(work: WorkDoc): string {
  return work.client ? `${work.title} for ${work.client}` : work.title;
}

/** CMS rich text first (trimmed at a word boundary); templated fallback otherwise. */
function workDescription(work: WorkDoc): string {
  const fallback = [workTitle(work), work.roleCredits, work.categories?.join(", ")]
    .filter((part): part is string => Boolean(part && part.length > 0))
    .join(". ");
  return describeFromRichText(work.description, fallback);
}

export async function generateMetadata({ params }: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  // Throwing here (not just in the page) makes missing slugs a real 404
  if (!work) notFound();
  const title = workTitle(work);
  const description = workDescription(work);
  return {
    title,
    description,
    alternates: {
      canonical: `/work/${slug}`,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/work/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
    description: workDescription(work),
    ...(cover?.url ? { image: absUrl(cover.url) } : {}),
    ...(work.date ? { datePublished: work.date } : {}),
    author: {
      "@type": "Person",
      name: "Omar Kamel",
      url: SITE_URL,
    },
    ...(work.categories?.length ? { keywords: work.categories } : {}),
    url: `${SITE_URL}/work/${slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Work", item: `${SITE_URL}/work` },
      { "@type": "ListItem", position: 3, name: work.title, item: `${SITE_URL}/work/${slug}` },
    ],
  };

  return (
    <>
    <JsonLd data={workJsonLd} />
    <JsonLd data={breadcrumbJsonLd} />
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
        {work.description ? <RichText data={work.description} className="mb-10" embedTitle={work.title} /> : null}
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
            {work.media.map((embed) => (<MediaEmbedComponent key={embed.url} embed={embed} title={work.title} />))}
          </div>
        )}
        {work.externalLink && (
          <a href={work.externalLink} target="_blank" rel="noopener noreferrer" className="inline-block border border-cyan text-cyan px-6 py-2.5 text-sm font-mono hover:bg-cyan hover:text-black transition-colors rounded-[2px]">
            View Project &rarr;
          </a>
        )}
        <ShareRow title={workTitle(work)} url={`${SITE_URL}/work/${slug}`} />
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
