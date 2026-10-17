/** schema.org helpers for a piece's player: a VideoObject (YouTube / Vimeo) or AudioObject (Spotify / SoundCloud). */
import { absUrl } from "@/lib/abs-url";
import { toEmbedUrl } from "@/lib/embed-url";
import { stripEmDashes } from "@/lib/seo-text";
import type { MediaEmbed, MediaUpload } from "@/lib/payload/types";

export function playerJsonLd(
  doc: { title: string; media?: MediaEmbed[] | null; date?: string | null; createdAt?: string | null },
  description: string,
  cover: MediaUpload | null,
) {
  const m = (doc.media ?? []).find((x) => toEmbedUrl(x.type, x.url));
  if (!m) return {};
  const embedUrl = toEmbedUrl(m.type, m.url)!;
  const date = doc.date ?? doc.createdAt ?? undefined;
  if (m.type === "youtube" || m.type === "vimeo") {
    return {
      video: {
        "@type": "VideoObject",
        name: stripEmDashes(doc.title),
        description,
        ...(cover?.url ? { thumbnailUrl: absUrl(cover.sizes?.hero?.url ?? cover.url) } : {}),
        ...(date ? { uploadDate: date } : {}),
        embedUrl,
        url: m.url,
      },
    };
  }
  return { audio: { "@type": "AudioObject", name: stripEmDashes(doc.title), description, embedUrl, url: m.url } };
}
