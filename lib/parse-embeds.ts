import type { MediaEmbed } from "@/lib/payload/types";
import { hostMatches } from "@/lib/embed-url";

export function matchEmbedUrl(rawUrl: string): MediaEmbed | null {
  const url = rawUrl.trim();
  if (!url) return null;

  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }

  if (host === "youtu.be" || hostMatches(host, "youtube.com") || hostMatches(host, "youtube-nocookie.com")) {
    return { type: "youtube", url };
  }
  if (hostMatches(host, "vimeo.com")) {
    return { type: "vimeo", url };
  }
  if (hostMatches(host, "soundcloud.com")) {
    return { type: "soundcloud", url };
  }
  if (hostMatches(host, "spotify.com")) {
    return { type: "spotify", url };
  }
  return null;
}

export type BodySegment =
  | { kind: "text"; content: string }
  | { kind: "embed"; embed: MediaEmbed };

// Matches a line containing only [URL] (optional surrounding whitespace).
// Uses multiline mode so ^/$ anchor per-line.
const EMBED_LINE_RE = /^[ \t]*\[(https?:\/\/[^\s\]]+)\][ \t]*$/gm;

export function splitBodyByEmbeds(body: string): BodySegment[] {
  if (!body) return [];

  const segments: BodySegment[] = [];
  let lastIndex = 0;
  EMBED_LINE_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = EMBED_LINE_RE.exec(body)) !== null) {
    const embed = matchEmbedUrl(match[1]);
    if (!embed) continue;

    const textChunk = body.slice(lastIndex, match.index);
    if (textChunk.trim().length > 0) {
      segments.push({ kind: "text", content: textChunk });
    }
    segments.push({ kind: "embed", embed });
    lastIndex = match.index + match[0].length;
  }

  const tail = body.slice(lastIndex);
  if (tail.trim().length > 0) {
    segments.push({ kind: "text", content: tail });
  }

  return segments;
}
