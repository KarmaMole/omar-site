import Image from "next/image";
import Link from "next/link";
import type { ProjectDoc } from "@/lib/payload/types";

interface ProjectCardProps {
  project: ProjectDoc;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const cover =
    typeof project.coverImage === "object" && project.coverImage
      ? project.coverImage
      : null;
  const tags = project.tags?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];

  return (
    <Link
      href={`/explore/${project.slug}`}
      className="group block rounded-[2px] bg-[#141414] border border-[#1a1a1a] hover:border-cyan/50 hover:shadow-[0_0_20px_rgba(0,217,255,0.15)] transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden rounded-t-[2px]">
        {cover?.url ? (
          <Image
            src={cover.sizes?.card?.url ?? cover.url}
            alt={cover.alt}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-light-300 text-sm font-light px-4 text-center bg-[#111]">
            {project.title}
          </div>
        )}
        {/* Tags overlay on hover */}
        {tags.length > 0 && (
          <div className="absolute inset-0 bg-black/30 md:bg-black/0 md:group-hover:bg-black/40 transition-all duration-300 flex items-end p-4">
            <div className="flex flex-wrap gap-1.5 md:translate-y-4 opacity-100 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] tracking-widest uppercase text-cyan bg-black/50 px-2 py-0.5 border border-cyan/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="p-4 space-y-1">
        {project.contentType && (
          <p className="font-mono text-[10px] tracking-widest uppercase text-cyan">
            {project.contentType === "music" ? "Music" : project.contentType === "visual" ? "Visual" : project.contentType === "comics" ? "Comics" : project.contentType === "film" ? "Film" : project.contentType === "ai" ? "AI" : project.contentType === "writing" ? "Writing" : project.contentType === "photography" ? "Photography" : project.contentType}
          </p>
        )}
        <h3 className="text-lg font-light text-light-100">{project.title}</h3>
      </div>
    </Link>
  );
}
