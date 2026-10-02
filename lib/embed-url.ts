/**
 * Turns a user-supplied media URL into an iframe-safe embed URL.
 * Pure functions, no I/O. Returns "" when a YouTube/Vimeo URL cannot be parsed
 * so callers can skip rendering instead of shipping a broken iframe.
 */

/** Strict hostname check: exact domain or a true subdomain of it. */
export function hostMatches(host: string, domain: string): boolean {
  const h = host.toLowerCase();
  return h === domain || h.endsWith(`.${domain}`);
}

function safeUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
}

const YT_ID_RE = /^[A-Za-z0-9_-]{6,32}$/;

/** "90", "90s", "1m30s", "1h2m3s" -> seconds. */
function parseTimestamp(value: string | null): number | null {
  if (!value) return null;
  if (/^\d+$/.test(value)) return Number(value);
  const m = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!m || (!m[1] && !m[2] && !m[3])) return null;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

export function parseYouTube(raw: string): { id: string; start: number | null } | null {
  const u = safeUrl(raw);
  if (!u) return null;
  const host = u.hostname.toLowerCase();

  let id: string | null = null;
  if (host === "youtu.be") {
    id = u.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (hostMatches(host, "youtube.com") || hostMatches(host, "youtube-nocookie.com")) {
    if (u.pathname === "/watch" || u.pathname === "/watch/") {
      id = u.searchParams.get("v");
    } else {
      const m = u.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/);
      id = m?.[1] ?? null;
    }
  }
  if (!id || !YT_ID_RE.test(id)) return null;
  const start = parseTimestamp(u.searchParams.get("t") ?? u.searchParams.get("start"));
  return { id, start };
}

export function parseVimeo(raw: string): { id: string; hash: string | null } | null {
  const u = safeUrl(raw);
  if (!u) return null;
  const host = u.hostname.toLowerCase();
  if (!hostMatches(host, "vimeo.com")) return null;

  const segs = u.pathname.split("/").filter(Boolean);
  const idx = segs.findIndex((s) => /^\d+$/.test(s));
  if (idx === -1) return null;
  const id = segs[idx];

  // Unlisted videos carry a privacy hash either as ?h=HASH or /ID/HASH.
  let hash: string | null = u.searchParams.get("h");
  if (!hash) {
    const next = segs[idx + 1];
    if (next && /^[0-9a-f]{8,}$/i.test(next)) hash = next;
  }
  if (hash && !/^[A-Za-z0-9]+$/.test(hash)) hash = null;
  return { id, hash };
}

export interface EmbedUrlOptions {
  autoplay?: boolean;
}

export function toEmbedUrl(type: string, url: string, options: EmbedUrlOptions = {}): string {
  if (type === "youtube") {
    const yt = parseYouTube(url);
    if (!yt) return "";
    const params = new URLSearchParams();
    if (options.autoplay) params.set("autoplay", "1");
    if (yt.start) params.set("start", String(yt.start));
    const qs = params.toString();
    return `https://www.youtube.com/embed/${yt.id}${qs ? `?${qs}` : ""}`;
  }

  if (type === "vimeo") {
    const vm = parseVimeo(url);
    if (!vm) return "";
    const params = new URLSearchParams();
    if (vm.hash) params.set("h", vm.hash);
    if (options.autoplay) params.set("autoplay", "1");
    const qs = params.toString();
    return `https://player.vimeo.com/video/${vm.id}${qs ? `?${qs}` : ""}`;
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
