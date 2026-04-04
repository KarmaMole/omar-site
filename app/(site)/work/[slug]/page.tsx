import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import JsonLd from "@/components/json-ld";
import MediaEmbedComponent from "@/components/media-embed";
import { RichText } from "@/components/rich-text";
import { getWorkBySlug, getAllWorkSlugs } from "@/lib/payload/queries";
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
    title: work.client ? `${work.title} — ${work.client}` : work.title,
    description: `${work.title}${work.client ? ` for ${work.client}` : ""}. ${work.categories?.join(", ") ?? ""}`,
    openGraph: {
      type: "article",
      title: work.client ? `${work.title} — ${work.client}` : work.title,
      description: `${work.title}${work.client ? ` for ${work.client}` : ""}. ${work.categories?.join(", ") ?? ""}`,
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
    url: `https://omarkamel.com/work/${slug}`,
  };

  return (
    <>
    <JsonLd data={workJsonLd} />
    <div className="pt-24 pb-16">
      {cover?.url ? (
        <div className="relative aspect-[21/9] w-full">
          <Image src={cover.sizes?.hero?.url ?? cover.url} alt={cover.alt} fill className="object-cover" priority />
        </div>
      ) : (
        <div className="aspect-[21/9] bg-dark-100 w-full flex items-center justify-center text-light-300 text-lg font-medium">{work.title}</div>
      )}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/work" className="font-mono text-xs tracking-wider uppercase text-light-300 hover:text-cyan transition-colors inline-block mb-8">&larr; Back to Work</Link>
        {work.client && <p className="text-sm uppercase tracking-widest text-light-300 font-mono mb-2">{work.client}</p>}
        <h1 className="text-4xl md:text-5xl font-bold text-light-100 mb-4">{work.title}</h1>
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
            {work.media.map((embed, i) => (<MediaEmbedComponent key={i} embed={embed} />))}
          </div>
        )}
        {work.externalLink && (
          <a href={work.externalLink} target="_blank" rel="noopener noreferrer" className="inline-block border border-cyan text-cyan px-6 py-2.5 text-sm font-mono hover:bg-cyan hover:text-black transition-colors rounded-[2px]">
            View Project &rarr;
          </a>
        )}
      </div>
    </div>
    </>
  );
}
