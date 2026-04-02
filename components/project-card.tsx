import Link from "next/link";
import Image from "next/image";
import TagBadge from "./tag-badge";
import type { ProjectDoc } from "@/lib/payload/types";

interface ProjectCardProps {
  project: ProjectDoc;
}

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  archived: "bg-gray-100 text-gray-500",
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const logo = typeof project.logo === "object" && project.logo ? project.logo : null;
  const tags = project.tags?.map((t) => t.tag) ?? [];

  return (
    <Link href={`/projects/${project.slug}`} className="group block border border-gray-200 rounded-sm p-6 hover:border-brick/30 hover:shadow-sm transition-all">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
          {logo?.url ? (
            <Image src={logo.sizes?.thumbnail?.url ?? logo.url} alt={logo.alt} width={48} height={48} className="object-cover" />
          ) : (
            <span className="text-gray-500 font-semibold text-lg select-none">{project.title.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-xl font-semibold group-hover:text-brick transition-colors">{project.title}</h3>
            {project.status && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusStyles[project.status] ?? ""}`}>{project.status}</span>
            )}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (<TagBadge key={tag} label={tag} />))}
            </div>
          )}
          {project.links && project.links.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {project.links.map((link) => (<span key={link.url} className="text-xs text-gray-500 truncate">{link.label}</span>))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
