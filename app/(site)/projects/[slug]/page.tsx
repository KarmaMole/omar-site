import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import TagBadge from "@/components/tag-badge";
import { RichText } from "@/components/rich-text";
import { getProjectBySlug, getAllProjectSlugs } from "@/lib/payload/queries";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  archived: "bg-gray-100 text-gray-500",
};

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const tags = project.tags?.map((t) => t.tag) ?? [];
  return { title: project.title, description: `${project.title} — ${tags.join(", ")}` };
}

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

  return (
    <div className="pt-24 pb-16">
      {cover?.url ? (
        <div className="relative aspect-[21/9] w-full">
          <Image src={cover.sizes?.hero?.url ?? cover.url} alt={cover.alt} fill className="object-cover" priority />
        </div>
      ) : (
        <div className="aspect-[21/9] bg-gray-200 w-full flex items-center justify-center text-gray-400 text-lg font-medium">{project.title}</div>
      )}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/projects" className="text-sm text-gray-500 hover:text-brick transition-colors inline-block mb-8">&larr; Back to Projects</Link>
        <div className="flex items-center gap-5 mb-6">
          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
            {logo?.url ? (
              <Image src={logo.sizes?.thumbnail?.url ?? logo.url} alt={logo.alt} width={64} height={64} className="object-cover" />
            ) : (
              <span className="text-gray-500 font-semibold text-2xl select-none">{project.title.charAt(0)}</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-4xl md:text-5xl font-bold">{project.title}</h1>
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
        {project.links && project.links.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {project.links.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-block border border-brick text-brick px-5 py-2 text-sm font-medium hover:bg-brick hover:text-white transition-colors rounded-sm">
                {link.label} &rarr;
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
