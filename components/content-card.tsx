import Link from "next/link";
import Image from "next/image";
import type { MediaUpload } from "@/lib/payload/types";

interface ContentCardProps {
  href: string;
  title: string;
  coverImage: MediaUpload | null;
  /** Top metadata label (e.g. client name for work, content type for projects) */
  label?: string | null;
  /** Tags or categories shown as chips on hover overlay */
  overlayTags?: string[] | null;
  /** Image sizes attribute for responsive loading */
  sizes?: string;
}

/**
 * Shared listing card for work and explore items. Dark surface with cyan
 * hover border, aspect-video cover image, metadata overlay on hover, and
 * title block below.
 */
export default function ContentCard({
  href,
  title,
  coverImage,
  label,
  overlayTags,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: ContentCardProps) {
  const cover = coverImage;
  const tags = overlayTags?.filter(Boolean) ?? [];

  return (
    <Link
      href={href}
      className="group block rounded-[2px] bg-[#141414] border border-[#1a1a1a] hover:border-cyan/50 hover:shadow-[0_0_20px_rgba(0,217,255,0.15)] transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden rounded-t-[2px]">
        {cover?.url ? (
          <Image
            src={cover.sizes?.card?.url ?? cover.url}
            alt={cover.alt ?? title}
            fill
            loading="lazy"
            sizes={sizes}
            className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-light-300 text-sm font-light px-4 text-center bg-[#111]">
            {title}
          </div>
        )}
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
        {label && (
          <p className="font-mono text-[10px] tracking-widest uppercase text-cyan">
            {label}
          </p>
        )}
        <h3 className="text-lg font-light text-light-100">{title}</h3>
      </div>
    </Link>
  );
}
