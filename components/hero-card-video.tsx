"use client";

import { useState } from "react";
import type { MediaEmbed } from "@/lib/payload/types";

function getEmbedUrl(embed: MediaEmbed): string {
  const { type, url } = embed;
  if (type === "youtube") {
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&]+)/);
    const id = match?.[1] ?? "";
    return `https://www.youtube.com/embed/${id}?autoplay=1`;
  }
  if (type === "vimeo") {
    const match = url.match(/vimeo\.com\/(\d+)/);
    const id = match?.[1] ?? "";
    return `https://player.vimeo.com/video/${id}?autoplay=1`;
  }
  return url;
}

interface HeroCardVideoProps {
  embed: MediaEmbed;
  /** Title announced by screen readers when the iframe receives focus */
  title?: string;
}

export default function HeroCardVideo({ embed, title }: HeroCardVideoProps) {
  const [playing, setPlaying] = useState(false);

  if (!playing) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPlaying(true);
        }}
        className="absolute inset-0 z-20 flex items-center justify-center group/play"
        aria-label="Play video"
      >
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/60 border-2 border-white/80 flex items-center justify-center backdrop-blur-sm group-hover/play:bg-cyan/80 group-hover/play:border-cyan transition-all duration-300">
          <svg
            viewBox="0 0 24 24"
            fill="white"
            className="w-6 h-6 md:w-8 md:h-8 ml-1"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </button>
    );
  }

  return (
    <div className="absolute inset-0 z-20">
      <iframe
        src={getEmbedUrl(embed)}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={title ?? `${embed.type} video`}
      />
    </div>
  );
}
