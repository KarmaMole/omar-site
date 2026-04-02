import type { MediaEmbed } from "@/lib/dummy-data";

function getEmbedUrl(embed: MediaEmbed): string {
  const { type, url } = embed;

  if (type === "youtube") {
    // Handle both youtube.com/watch?v=ID and youtu.be/ID formats
    const match =
      url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&]+)/);
    const id = match?.[1] ?? "";
    return `https://www.youtube.com/embed/${id}`;
  }

  if (type === "vimeo") {
    const match = url.match(/vimeo\.com\/(\d+)/);
    const id = match?.[1] ?? "";
    return `https://player.vimeo.com/video/${id}`;
  }

  if (type === "soundcloud") {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%238B2500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false`;
  }

  if (type === "spotify") {
    // Convert open.spotify.com/track/ID → open.spotify.com/embed/track/ID
    // Guard against already-embedded URLs
    if (url.includes("/embed/")) return url;
    return url.replace("open.spotify.com/", "open.spotify.com/embed/");
  }

  return url;
}

const AUDIO_TYPES: MediaEmbed["type"][] = ["soundcloud", "spotify"];

interface MediaEmbedProps {
  embed: MediaEmbed;
}

export default function MediaEmbedComponent({ embed }: MediaEmbedProps) {
  const embedUrl = getEmbedUrl(embed);
  const isAudio = AUDIO_TYPES.includes(embed.type);

  return (
    <div className={isAudio ? "h-20 w-full" : "aspect-video w-full"}>
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title={`${embed.type} embed`}
      />
    </div>
  );
}
