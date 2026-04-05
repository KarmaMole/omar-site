import Link from "next/link";
import Image from "next/image";
import HeroCardVideo from "@/components/hero-card-video";
import type { MediaUpload, MediaEmbed } from "@/lib/payload/types";

interface HeroCardProps {
  href: string;
  title: string;
  coverImage: MediaUpload | null;
  coverAlt?: string;
  /** Small uppercase mono eyebrow above the title (client, content type, etc.) */
  eyebrow?: string | null;
  /** Optional secondary line below the title (e.g. categories) */
  bottomMeta?: string | null;
  /** "lg" for hero cards (p-8/12, large title), "sm" for grid cards (p-6/8, smaller title) */
  size?: "lg" | "sm";
  /** Aspect ratio of the card. Defaults to 21/9 for lg and 4/3 for sm */
  aspect?: "video" | "21/9" | "4/3";
  priority?: boolean;
  /** Optional video embed to render as a play-on-click overlay */
  videoEmbed?: MediaEmbed | null;
  /** next/image sizes attribute */
  sizes?: string;
}

const aspectClass = {
  video: "aspect-video",
  "21/9": "aspect-[21/9]",
  "4/3": "aspect-[4/3]",
} as const;

/**
 * Shared hero/feature card used across the homepage for featured work,
 * featured explorations, and the recent work grid. Full-bleed cover image
 * with dark gradient overlay and bottom-left text block. Hover scale on
 * the cover, optional video embed overlay.
 */
export default function HeroCard({
  href,
  title,
  coverImage,
  coverAlt,
  eyebrow,
  bottomMeta,
  size = "lg",
  aspect,
  priority = false,
  videoEmbed,
  sizes,
}: HeroCardProps) {
  const finalAspect = aspect ?? (size === "lg" ? "21/9" : "4/3");
  const aspectCls = aspectClass[finalAspect];
  const padding = size === "lg" ? "p-8 lg:p-12" : "p-6 lg:p-8";
  const titleSize =
    size === "lg"
      ? "text-3xl md:text-5xl"
      : "text-xl md:text-2xl";
  const eyebrowSize =
    size === "lg"
      ? "text-xs tracking-[0.2em] mb-2"
      : "text-[10px] tracking-[0.2em] mb-1";
  const defaultSizes = size === "lg" ? "100vw" : "(max-width: 768px) 100vw, 50vw";

  return (
    <div
      className={`relative overflow-hidden bg-dark-200 border border-transparent hover:border-cyan/20 transition-all duration-500 hover:shadow-[0_4px_20px_rgba(0,217,255,0.1)] ${aspectCls}`}
    >
      <Link href={href} className="group block absolute inset-0">
        {coverImage?.url ? (
          <Image
            src={coverImage.sizes?.hero?.url ?? coverImage.url}
            alt={coverAlt ?? coverImage.alt ?? title}
            fill
            className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
            sizes={sizes ?? defaultSizes}
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-dark-200 to-dark-100" />
        )}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            size === "lg"
              ? "from-black/80 via-black/20 to-transparent"
              : "from-black/70 via-black/10 to-transparent"
          }`}
        />
        <div className={`absolute bottom-0 left-0 ${padding}`}>
          {eyebrow && (
            <p
              className={`font-mono uppercase text-cyan ${eyebrowSize}`}
            >
              {eyebrow}
            </p>
          )}
          <h3 className={`${titleSize} font-light tracking-tight text-white`}>
            {title}
          </h3>
          {bottomMeta && (
            <p className="font-mono text-xs tracking-[0.15em] uppercase text-light-300 mt-3">
              {bottomMeta}
            </p>
          )}
        </div>
      </Link>
      {videoEmbed && <HeroCardVideo embed={videoEmbed} title={title} />}
    </div>
  );
}
