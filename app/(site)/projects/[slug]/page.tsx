import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TagBadge from "@/components/tag-badge";
import { dummyProjects } from "@/lib/dummy-data";
import type { Project } from "@/lib/dummy-data";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

const statusStyles: Record<NonNullable<Project["status"]>, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  archived: "bg-gray-100 text-gray-500",
};

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = dummyProjects.find((p) => p.slug.current === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: `${project.title} — ${project.tags?.join(", ") ?? ""}`,
  };
}

export function generateStaticParams() {
  return dummyProjects.map((p) => ({ slug: p.slug.current }));
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = dummyProjects.find((p) => p.slug.current === slug);
  if (!project) notFound();

  return (
    <div className="pt-24 pb-16">
      {/* Full-width cover placeholder */}
      <div className="aspect-[21/9] bg-gray-200 w-full flex items-center justify-center text-gray-400 text-lg font-medium">
        {project.title}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/projects"
          className="text-sm text-gray-500 hover:text-brick transition-colors inline-block mb-8"
        >
          &larr; Back to Projects
        </Link>

        {/* Logo placeholder + title row */}
        <div className="flex items-center gap-5 mb-6">
          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-500 font-semibold text-2xl select-none">
            {project.title.charAt(0)}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-4xl md:text-5xl font-bold">
              {project.title}
            </h1>
            {project.status && (
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${statusStyles[project.status]}`}
              >
                {project.status}
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {project.tags.map((tag) => (
              <TagBadge key={tag} label={tag} />
            ))}
          </div>
        )}

        {/* Placeholder description */}
        <p className="text-gray-600 leading-relaxed mb-10">
          This project sits at the crossroads of curiosity and craft. Built and
          maintained independently, it reflects a long-standing commitment to
          exploring emerging formats and publishing honest, in-depth work for
          communities that care about quality over noise.
        </p>

        {/* Links */}
        {project.links && project.links.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {project.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-brick text-brick px-5 py-2 text-sm font-medium hover:bg-brick hover:text-white transition-colors rounded-sm"
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
