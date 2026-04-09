import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import JsonLd from "@/components/json-ld";
import { RichText } from "@/components/rich-text";
import MediaEmbedComponent from "@/components/media-embed";
import GalleryGrid from "@/components/gallery-grid";
import { getProjectBySlug, getAllProjectSlugs, getAllProjects } from "@/lib/payload/queries";
import MoreItems from "@/components/more-items";

interface StudioDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StudioDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const cover =
    typeof project.coverImage === "object" && project.coverImage
      ? project.coverImage
      : null;
  return {
    title: project.title,
    description: `${project.title} - ${project.categories?.join(", ") ?? "project"} by Omar Kamel.`,
    openGraph: {
      type: "article",
      title: project.title,
      description: `${project.title} - ${project.categories?.join(", ") ?? "project"} by Omar Kamel.`,
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

export default async function StudioDetailPage({ params }: StudioDetailPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const cover = typeof project.coverImage === "object" ? project.coverImage : null;
  const logo = typeof project.logo === "object" && project.logo ? project.logo : null;
  const gallery = project.gallery?.filter(
    (img): img is Extract<typeof img, { url: string }> =>
      typeof img === "object" && img !== null && "url" in img
  ) ?? [];

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: `${project.title} - ${project.categories?.join(", ") ?? "project"} by Omar Kamel.`,
    ...(cover?.url ? { image: cover.url } : {}),
    author: {
      "@type": "Person",
      name: "Omar Kamel",
      url: "https://omarkamel.com",
    },
    url: `https://omarkamel.com/studio/${slug}`,
  };

  return (
    <>
    <JsonLd data={projectJsonLd} />
    <div className="pt-24 pb-16 animate-fade-in">
      {cover?.url ? (
        <div className="relative aspect-[21/9] w-full bg-dark-200">
          <Image
            src={cover.sizes?.hero?.url ?? cover.url}
            alt={cover.alt ?? project.title}
            fill
            sizes="(max-width: 1024px) 100vw, calc(100vw - 80px)"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      <div className={`max-w-3xl mx-auto px-6 ${cover?.url ? "py-12" : "pt-20 pb-12"}`}>
        <Link
          href="/studio"
          className="font-mono text-xs tracking-wider uppercase text-light-300 hover:text-cyan transition-colors inline-block mb-8"
        >
          &larr; Back to Studio
        </Link>

        <div className="flex items-center gap-4 mb-6">
          {logo?.url && (
            <div className="flex-shrink-0 w-14 h-14 bg-[#111] border border-white/[0.07] rounded-[2px] flex items-center justify-center overflow-hidden">
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
            <h1 className="text-4xl md:text-5xl font-light text-light-100">{project.title}</h1>
          </div>
        </div>

        {project.tags && project.tags.length > 0 && (
          <div className="mb-8">
            <p className="font-mono text-[10px] tracking-widest uppercase text-light-300/70">
              {project.tags.split(",").map((t) => t.trim()).filter(Boolean).join(" / ")}
            </p>
          </div>
        )}

        {project.description ? <RichText data={project.description} className="mb-10" /> : null}

        {gallery.length > 0 && <GalleryGrid images={gallery} title={project.title} />}

        {project.media && project.media.length > 0 && (
          <div className="space-y-6 mb-10">
            {project.media.map((embed) => (
              <MediaEmbedComponent key={embed.url} embed={embed} />
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
        <MoreStudio currentSlug={slug} />
      </div>
    </div>
    </>
  );
}

async function MoreStudio({ currentSlug }: { currentSlug: string }) {
  const allProjects = await getAllProjects();
  // Rotate the list starting after the current item so each detail page
  // shows a different set of neighbors instead of always the top 3.
  const idx = allProjects.findIndex((p) => p.slug === currentSlug);
  const rotated =
    idx >= 0
      ? [...allProjects.slice(idx + 1), ...allProjects.slice(0, idx)]
      : allProjects;
  const others = rotated.slice(0, 3);
  return (
    <MoreItems
      items={others.map((p) => ({
        slug: p.slug,
        title: p.title,
        coverImage: p.coverImage,
        href: `/studio/${p.slug}`,
      }))}
      label="More from the Studio"
      viewAllHref="/studio"
      viewAllLabel="View All"
    />
  );
}
