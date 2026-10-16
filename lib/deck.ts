/**
 * Display helpers for the Deck design (CLIENT | PROJECT heads, lowercase subtitles,
 * "My Work |" credits). Pure functions over CMS docs; no I/O.
 */
import type { MediaEmbed, MediaUpload, ProjectDoc, WorkDoc } from "@/lib/payload/types";
import { lexicalToPlainText, stripEmDashes } from "@/lib/seo-text";
import { toEmbedUrl } from "@/lib/embed-url";

/** Silent loops cut from the films themselves (public/deck/<name>.mp4 + .jpg poster). */
const LOOPS: Record<string, string> = {
  "storm-ai-short": "storm",
  "serene-music-video": "serene",
  "more-fool-you-revelators": "more-fool-you",
  "human-crafted": "human-crafted",
};

export function loopFor(slug: string): { src: string; poster: string } | null {
  const n = LOOPS[slug];
  return n ? { src: `/deck/${n}.mp4`, poster: `/deck/${n}.jpg` } : null;
}

/** Short client name for heads and labels; the full name stays in the credits. */
export function clientLabel(client: string | null | undefined): string {
  const c = (client ?? "").trim();
  if (!c) return "";
  if (/^Mansour Manufacturing/i.test(c)) return "Mansour M&D";
  return c.split(/ \| | \/ /)[0].trim();
}

/** Title without a repeated client prefix ("Schneider Electric, Life Is On" under Schneider Electric). */
export function displayTitle(title: string, label: string): string {
  let t = title.trim();
  if (label === "Mansour M&D") t = t.replace(/^MMD\s+/, "");
  for (const pre of [`${label}, `, `${label} `]) {
    if (label && t.startsWith(pre) && t.length > pre.length + 3) t = t.slice(pre.length);
  }
  return t;
}

export function yearOf(date: string | null | undefined): string {
  return date ? new Date(date).toLocaleDateString("en-US", { year: "numeric", timeZone: "Asia/Dubai" }) : "";
}

export function coverOf(doc: { coverImage?: MediaUpload | string | null }): MediaUpload | null {
  return doc.coverImage && typeof doc.coverImage === "object" ? doc.coverImage : null;
}

export function ratioOf(m: MediaUpload | null, fallback = 16 / 9): number {
  return m?.width && m?.height ? m.width / m.height : fallback;
}

/** Best URL for a size class: hero (1920) for the stage, card (800) for thumbnails. */
export function srcOf(m: MediaUpload | null, size: "hero" | "card" = "hero"): string {
  if (!m) return "";
  return (size === "card" ? m.sizes?.card?.url : m.sizes?.hero?.url) ?? m.url;
}

/** The first playable video (YouTube / Vimeo) or audio player (Spotify / SoundCloud). */
export function primaryEmbed(media: MediaEmbed[] | null | undefined): { src: string; label: string; href: string; kind: MediaEmbed["type"] } | null {
  for (const m of media ?? []) {
    const src = toEmbedUrl(m.type, m.url, { autoplay: true });
    if (!src) continue;
    const label = m.type === "spotify" || m.type === "soundcloud" ? "Listen" : "Watch the film";
    return { src, label, href: m.url, kind: m.type };
  }
  return null;
}

export function embedSiteName(kind: MediaEmbed["type"]): string {
  return { youtube: "YouTube", vimeo: "Vimeo", spotify: "Spotify", soundcloud: "SoundCloud" }[kind];
}

export function plainText(rich: unknown): string {
  return stripEmDashes(lexicalToPlainText(rich));
}

export function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/).filter(Boolean);
}

/** Lowercase subtitle: categories (or tags) and the year. */
export function subtitleOf(doc: { categories?: string[] | null; date?: string | null }): string {
  const cats = (doc.categories ?? []).map((c) => c.toLowerCase()).join(", ");
  const y = yearOf(doc.date);
  return [cats, y].filter(Boolean).join(", ");
}

/** CLIENT | PROJECT for a work item; without a client, TITLE | first category. */
export function headOf(doc: WorkDoc | ProjectDoc): { client: string; project: string } {
  const label = "client" in doc ? clientLabel(doc.client) : "";
  if (label) return { client: label, project: displayTitle(doc.title, label) };
  return { client: doc.title, project: doc.categories?.[0] ?? "" };
}

export function credit(roles: string | null | undefined): string {
  const r = (roles ?? "").trim();
  return r ? (r.endsWith(".") ? r : `${r}.`) : "";
}

export const pad = (n: number) => String(n).padStart(2, "0");

export const SOCIAL = [
  { name: "LinkedIn", url: "https://www.linkedin.com/in/omarkamel" },
  { name: "Instagram", url: "https://www.instagram.com/karmamole" },
  { name: "YouTube", url: "https://www.youtube.com/@omarkamel" },
  { name: "X", url: "https://x.com/omarkamel" },
  { name: "GitHub", url: "https://github.com/KarmaMole" },
];

/** Client logo files in public/logos, matched by client name. */
const LOGOS: Record<string, string> = {
  Core42: "core42.svg", "e&": "eand.svg", FAB: "fab.svg", ADCB: "adcb.svg", GMC: "gmc.svg",
  "Saudia Airlines": "saudia-airlines.svg", "5D Egypt": "5d-egypt.png", Sudan365: "sudan365.png",
  "Orient Productions": "orient-productions.png", "Pulse Music World": "pulse-music-world.png",
  Photopia: "photopia.png", "Modern Media Factory": "modern-media-factory.svg", "Publicis Groupe": "publicis-groupe.svg",
  "Studio Emad Eddin": "studio-emad-eddin.png", "Transparency International": "transparency-international.svg",
  "Ford Foundation": "ford-foundation.svg", "Schneider Electric": "schneider-electric.svg", Centrepoint: "centrepoint.svg",
  "Christie's Education": "christie-s-education.svg", Tanagra: "tanagra.svg", Cartier: "cartier.svg",
  Swarovski: "swarovski.svg", "Metro Markets": "metro-markets.svg", "Mansour Holdings": "mansour-holdings.svg",
  "Coca-Cola": "coca-cola.svg",
};
export function logoFor(name: string): { src: string; slug: string } | null {
  const f = LOGOS[name.trim()];
  return f ? { src: `/logos/${f}`, slug: f.replace(/\.(svg|png)$/, "") } : null;
}
