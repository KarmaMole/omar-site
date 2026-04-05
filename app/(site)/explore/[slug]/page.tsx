import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import JsonLd from "@/components/json-ld";
import FadeIn from "@/components/fade-in";
import PageTransition from "@/components/page-transition";
import { RichText } from "@/components/rich-text";
import MediaEmbedComponent from "@/components/media-embed";
import GalleryGrid from "@/components/gallery-grid";
import { getProjectBySlug, getAllProjectSlugs, getAllProjects } from "@/lib/payload/queries";
import MoreItems from "@/components/more-items";

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
      description: `${project.title} — ${project.contentType ?? "project"} by Omar Kamel.`,
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

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: `${project.title} — ${project.contentType ?? "project"} by Omar Kamel.`,
    ...(cover?.url ? { image: cover.url } : {}),
    author: {
      "@type": "Person",
      name: "Omar Kamel",
      url: "https://omarkamel.com",
    },
    url: `https://omarkamel.com/explore/${slug}`,
  };

  return (
    <>
    <JsonLd data={projectJsonLd} />
    <PageTransition>
    <div className="pt-24 pb-16">
      {cover?.url ? (
        <div className="relative aspect-[21/9] w-full bg-dark-200">
          <Image src={cover.sizes?.hero?.url ?? cover.url} alt={cover.alt ?? project.title} fill className="object-cover" priority />
        </div>
      ) : null}

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/explore"
          className="font-mono text-xs tracking-wider uppercase text-light-300 hover:text-cyan transition-colors inline-block mb-8"
        >
          &larr; Back to Explore
        </Link>

        <FadeIn>
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
          </div>
        </div>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {project.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] tracking-widest uppercase text-light-300/70 border border-dark-100 px-2.5 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        </FadeIn>

        <FadeIn>
        {project.description ? <RichText data={project.description} className="mb-10" /> : null}
        </FadeIn>

        {gallery.length > 0 && <GalleryGrid images={gallery} title={project.title} />}

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
        <MoreExplorations currentSlug={slug} />
      </div>
    </div>
    </PageTransition>
    </>
  );
}

async function MoreExplorations({ currentSlug }: { currentSlug: string }) {
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
        href: `/explore/${p.slug}`,
      }))}
      label="More Explorations"
      viewAllHref="/explore"
      viewAllLabel="View All"
    />
  );
}
