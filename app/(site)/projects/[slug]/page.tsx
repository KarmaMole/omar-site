import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import JsonLd from "@/components/json-ld";
import TagBadge from "@/components/tag-badge";
import MediaEmbedComponent from "@/components/media-embed";
import { RichText } from "@/components/rich-text";
import { getProjectBySlug, getAllProjectSlugs } from "@/lib/payload/queries";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

const statusStyles: Record<string, string> = {
  active: "bg-cyan/10 text-cyan border border-cyan/30",
  paused: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
  archived: "bg-dark-100 text-light-300 border border-[#1a1a1a]",
};

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const tags = project.tags?.map((t) => t.tag) ?? [];
  const cover =
    typeof project.coverImage === "object" && project.coverImage
      ? project.coverImage
      : null;
  return {
    title: project.title,
    description: `${project.title} — ${tags.join(", ")}`,
    openGraph: {
      type: "article",
      title: project.title,
      description: `${project.title} — ${tags.join(", ")}`,
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

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const cover = typeof project.coverImage === "object" ? project.coverImage : null;
  const logo = typeof project.logo === "object" && project.logo ? project.logo : null;
  const tags = project.tags?.map((t) => t.tag) ?? [];

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: `${project.title} — ${tags.join(", ")}`,
    ...(cover?.url ? { image: cover.url } : {}),
    author: {
      "@type": "Person",
      name: "Omar Kamel",
      url: "https://omarkamel.com",
    },
    url: `https://omarkamel.com/projects/${slug}`,
  };

  return (
    <>
    <JsonLd data={projectJsonLd} />
    <div className="pt-24 pb-16">
      {cover?.url ? (
        <div className="relative aspect-[21/9] w-full">
          <Image src={cover.sizes?.hero?.url ?? cover.url} alt={cover.alt} fill className="object-cover" priority />
        </div>
      ) : (
        <div className="aspect-[21/9] bg-dark-100 w-full flex items-center justify-center text-light-300 text-lg font-medium">{project.title}</div>
      )}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/explore" className="text-sm text-light-300 hover:text-cyan transition-colors inline-block mb-8">&larr; Back to Explore</Link>
        <div className="flex items-center gap-5 mb-6">
          <div className="flex-shrink-0 w-16 h-16 bg-dark-100 rounded-[2px] flex items-center justify-center overflow-hidden border border-[#1a1a1a]">
            {logo?.url ? (
              <Image src={logo.sizes?.thumbnail?.url ?? logo.url} alt={logo.alt} width={64} height={64} className="object-cover" />
            ) : (
              <span className="text-light-300 font-semibold text-2xl select-none">{project.title.charAt(0)}</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-bold text-light-100">{project.title}</h1>
            {project.status && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${statusStyles[project.status] ?? ""}`}>{project.status}</span>
            )}
          </div>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map((tag) => (<TagBadge key={tag} label={tag} />))}
          </div>
        )}
        {project.description ? <RichText data={project.description} className="mb-10" /> : null}
        {project.gallery && Array.isArray(project.gallery) && project.gallery.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {project.gallery.map((img, i) => {
              if (typeof img !== "object" || !img?.url) return null;
              return (
                <div key={img.id ?? i} className="relative aspect-[16/10] overflow-hidden rounded-[2px]">
                  <Image src={img.sizes?.hero?.url ?? img.url} alt={img.alt ?? ""} fill className="object-cover" />
                </div>
              );
            })}
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
          <div className="flex flex-wrap gap-3">
            {project.links.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-block border border-cyan text-cyan px-5 py-2 text-sm font-mono hover:bg-cyan hover:text-black transition-colors rounded-[2px]">
                {link.label} &rarr;
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
