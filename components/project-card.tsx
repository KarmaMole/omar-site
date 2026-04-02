import Link from "next/link";
import TagBadge from "./tag-badge";
import { Project } from "@/lib/dummy-data";

interface ProjectCardProps {
  project: Project;
}

const statusStyles: Record<NonNullable<Project["status"]>, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  archived: "bg-gray-100 text-gray-500",
};

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug.current}`}
      className="group block border border-gray-200 rounded-sm p-6 hover:border-brick/30 hover:shadow-sm transition-all"
    >
      <div className="flex gap-4">
        {/* Logo / icon placeholder */}
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-500 font-semibold text-lg select-none">
          {project.title.charAt(0)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title + status badge */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-xl font-semibold group-hover:text-brick transition-colors">
              {project.title}
            </h3>
            {project.status && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusStyles[project.status]}`}
              >
                {project.status}
              </span>
            )}
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {project.tags.map((tag) => (
                <TagBadge key={tag} label={tag} />
              ))}
            </div>
          )}

          {/* External links */}
          {project.links && project.links.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {project.links.map((link) => (
                <span
                  key={link.url}
                  className="text-xs text-gray-500 truncate"
                >
                  {link.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
