import type { MediaEmbed } from "@/lib/payload/types";
import { toEmbedUrl } from "@/lib/embed-url";

interface MediaEmbedProps {
  embed: MediaEmbed;
  /** Accessible title for the iframe, usually the item title */
  title?: string;
}

export default function MediaEmbedComponent({ embed, title }: MediaEmbedProps) {
  const embedUrl = toEmbedUrl(embed.type, embed.url);
  if (!embedUrl) return null;

  const isSpotify = embed.type === "spotify";
  const isSoundcloud = embed.type === "soundcloud";
  const fallbackTitle = isSpotify || isSoundcloud ? "Audio player" : "Video";

  return (
    <div
      className={
        isSpotify
          ? "w-full h-[352px] rounded-xl overflow-hidden"
          : isSoundcloud
            ? "h-[166px] w-full"
            : "aspect-video w-full"
      }
    >
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title={title || fallbackTitle}
      />
    </div>
  );
}
