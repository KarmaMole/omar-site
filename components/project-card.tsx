import Image from "next/image";
import TagBadge from "./tag-badge";
import type { ProjectDoc } from "@/lib/payload/types";

interface ProjectCardProps {
  project: ProjectDoc;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const logo =
    typeof project.logo === "object" && project.logo ? project.logo : null;
  const tags = project.tags?.map((t) => t.tag) ?? [];

  return (
    <div className="group block rounded-[2px] bg-[#141414] border border-[#1a1a1a] p-6 hover:border-cyan/50 hover:shadow-[0_0_20px_rgba(0,217,255,0.08)] transition-all duration-300">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-[#111] border border-[#1a1a1a] rounded-[2px] flex items-center justify-center overflow-hidden">
          {logo?.url ? (
            <Image
              src={logo.sizes?.thumbnail?.url ?? logo.url}
              alt={logo.alt}
              width={48}
              height={48}
              loading="lazy"
              className="object-cover"
            />
          ) : (
            <span className="text-light-300 font-mono text-lg select-none">
              {project.title.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-light text-lg text-light-100 group-hover:text-cyan transition-colors duration-200">
            {project.title}
          </h3>
          {project.status && (
            <span className="font-mono text-[10px] tracking-widest uppercase text-cyan">
              {project.status}
            </span>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (
                <TagBadge key={tag} label={tag} href={`/explore?tag=${encodeURIComponent(tag)}`} />
              ))}
            </div>
          )}
          {project.links && project.links.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {project.links.map((link) => (
                <span
                  key={link.url}
                  className="font-mono text-xs text-cyan hover:text-white transition-colors duration-200 underline underline-offset-2 decoration-cyan/30 hover:decoration-white/50"
                >
                  {link.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
