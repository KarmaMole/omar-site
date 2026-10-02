"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaEmbed } from "@/lib/payload/types";
import { toEmbedUrl } from "@/lib/embed-url";

interface HeroCardVideoProps {
  embed: MediaEmbed;
  /** Item title, used for the play button label and the iframe title */
  title?: string;
}

/**
 * Centred play control that sits on top of a HeroCard. Only the button itself
 * is interactive, so the rest of the card keeps linking to the detail page.
 */
export default function HeroCardVideo({ embed, title }: HeroCardVideoProps) {
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // The play button unmounts on click; hand focus to the player so keyboard
  // users are not dropped back at the top of the page.
  useEffect(() => {
    if (playing) iframeRef.current?.focus();
  }, [playing]);

  const src = toEmbedUrl(embed.type, embed.url, { autoplay: true });
  if (!src) return null;

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/60 border-2 border-white/80 flex items-center justify-center backdrop-blur-sm hover:bg-cyan/80 hover:border-cyan transition-all duration-300"
        aria-label={title ? `Play video: ${title}` : "Play video"}
      >
        <svg
          viewBox="0 0 24 24"
          fill="white"
          className="w-6 h-6 md:w-8 md:h-8 ml-1"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="absolute inset-0 z-20">
      <iframe
        ref={iframeRef}
        src={src}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={title || "Video"}
      />
    </div>
  );
}
