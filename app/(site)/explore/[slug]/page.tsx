import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { RichText } from "@/components/rich-text";
import MediaEmbedComponent from "@/components/media-embed";
import { getProjectBySlug, getAllProjectSlugs } from "@/lib/payload/queries";

interface ExploreDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ExploreDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const cover =
    typeof project.coverImage === "object" && project.coverImage
      ? project.coverImage
      : null;
  return {
    title: project.title,
    description: `${project.title} — ${project.contentType ?? "project"} by Omar Kamel.`,
    openGraph: {
      type: "article",
      title: project.title,
      ...(cover?.url
        ? {
            images: [
              {
                url: cover.url,
                width: cover.width ?? undefined,
                height: cover.height ?? undefined,
                alt: cover.alt ?? project.title,
              },
            ],
          }
        : {}),
    },
  };
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ExploreDetailPage({ params }: ExploreDetailPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const cover = typeof project.coverImage === "object" ? project.coverImage : null;
  const logo = typeof project.logo === "object" && project.logo ? project.logo : null;
  const gallery = project.gallery?.filter(
    (img): img is Extract<typeof img, { url: string }> =>
      typeof img === "object" && img !== null && "url" in img
  ) ?? [];

  return (
    <div className="pt-24 pb-16">
      {cover?.url ? (
        <div className="relative aspect-[21/9] w-full">
          <Image src={cover.sizes?.hero?.url ?? cover.url} alt={cover.alt} fill className="object-cover" priority />
        </div>
      ) : null}

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/explore"
          className="font-mono text-xs tracking-wider uppercase text-light-300 hover:text-cyan transition-colors inline-block mb-8"
        >
          &larr; Back to Explore
        </Link>

        <div className="flex items-center gap-4 mb-6">
          {logo?.url && (
            <div className="flex-shrink-0 w-14 h-14 bg-[#111] border border-[#1a1a1a] rounded-[2px] flex items-center justify-center overflow-hidden">
              <Image
                src={logo.sizes?.thumbnail?.url ?? logo.url}
                alt={logo.alt}
                width={56}
                height={56}
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-light-100">{project.title}</h1>
            {project.status && (
              <span className="font-mono text-[10px] tracking-widest uppercase text-cyan mt-1 inline-block">
                {project.status}
              </span>
            )}
          </div>
        </div>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {project.tags.map((t) => (
              <span
                key={t.tag}
                className="font-mono text-[10px] tracking-widest uppercase text-light-300/70 border border-dark-100 px-2.5 py-1"
              >
                {t.tag}
              </span>
            ))}
          </div>
        )}

        {project.description ? <RichText data={project.description} className="mb-10" /> : null}

        {gallery.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {gallery.map((img, i) => (
              <div key={img.id ?? i} className="relative aspect-[16/10] overflow-hidden rounded-[2px]">
                <Image src={img.sizes?.hero?.url ?? img.url} alt={img.alt ?? ""} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}

        {project.media && project.media.length > 0 && (
          <div className="space-y-6 mb-10">
            {project.media.map((embed, i) => (
              <MediaEmbedComponent key={i} embed={embed} />
            ))}
          </div>
        )}

        {project.links && project.links.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {project.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-cyan text-cyan px-6 py-2.5 text-sm font-mono hover:bg-cyan hover:text-black transition-colors rounded-[2px]"
              >
                {link.label} &rarr;
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
