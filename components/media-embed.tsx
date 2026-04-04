"use client";

import { useState, useEffect } from "react";
import type { MediaEmbed } from "@/lib/payload/types";

function getEmbedUrl(embed: MediaEmbed): string | null {
  const { type, url } = embed;

  if (type === "youtube") {
    const match =
      url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&]+)/);
    const id = match?.[1] ?? "";
    return `https://www.youtube.com/embed/${id}`;
  }

  if (type === "vimeo") {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
    // Vanity URL — needs async resolution
    return null;
  }

  if (type === "soundcloud") {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%238B2500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false`;
  }

  if (type === "spotify") {
    const base = url.includes("/embed/")
      ? url
      : url.replace("open.spotify.com/", "open.spotify.com/embed/");
    const sep = base.includes("?") ? "&" : "?";
    return base.includes("theme=") ? base : `${base}${sep}theme=0`;
  }

  return url;
}

interface MediaEmbedProps {
  embed: MediaEmbed;
}

export default function MediaEmbedComponent({ embed }: MediaEmbedProps) {
  const staticUrl = getEmbedUrl(embed);
  const [embedUrl, setEmbedUrl] = useState(staticUrl);

  useEffect(() => {
    if (staticUrl || embed.type !== "vimeo") return;

    // Resolve Vimeo vanity URL via oEmbed API
    fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(embed.url)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.video_id) {
          setEmbedUrl(
            `https://player.vimeo.com/video/${data.video_id}`
          );
        }
      })
      .catch(() => {
        // Fallback: just use the original URL
        setEmbedUrl(embed.url);
      });
  }, [staticUrl, embed.type, embed.url]);

  if (!embedUrl) {
    return (
      <div className="aspect-video w-full bg-dark-100 animate-pulse" />
    );
  }

  const isSpotify = embed.type === "spotify";
  const isSoundcloud = embed.type === "soundcloud";

  return (
    <div
      className={
        isSpotify
          ? "w-full h-[352px] rounded-xl overflow-hidden"
          : isSoundcloud
            ? "h-20 w-full"
            : "aspect-video w-full"
      }
    >
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title={`${embed.type} embed`}
      />
    </div>
  );
}
