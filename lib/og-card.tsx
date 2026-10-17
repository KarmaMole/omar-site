import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_URL } from "@/lib/constants";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

interface OgCardOptions {
  label: string; // e.g. "WORK", "DISPATCH", "STUDIO"
  title: string;
  subtitle?: string | null; // shown on cards without a cover only
  coverUrl?: string | null; // absolute URL; relative URLs will be prefixed
}

const STONE = "#1C1917";
const SAND = "#E7E2D6";
const SCARLET = "#E63946";
const MUTED = "#9A948C";

/* Geometry from the brand kit (06 OG Cards/_read me.txt), all from the 1200x630 frame. */
const PAD = 72;
const BLOCK = 330;
const MARK = 168;
const COLUMN = 1200 - BLOCK - PAD * 2; // 726

/**
 * Normalize a media URL for ImageResponse. ImageResponse fetches remote
 * images server-side, so relative URLs from Payload need to be absolute.
 */
function absoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

let assets: Promise<{ metropolis: Buffer; inter: Buffer; mark: string }> | null = null;
function loadAssets() {
  assets ??= Promise.all([
    readFile(join(process.cwd(), "assets/og/metropolis-semibold.ttf")),
    readFile(join(process.cwd(), "assets/og/inter-regular.ttf")),
    readFile(join(process.cwd(), "assets/og/mark.svg"), "utf8"),
  ]).then(([metropolis, inter, svg]) => ({
    metropolis,
    inter,
    mark: `data:image/svg+xml;base64,${Buffer.from(svg.replaceAll("#1C1917", SAND)).toString("base64")}`,
  }));
  return assets;
}

/** Title size that keeps the bottom-anchored block to three lines at most. */
function titleSize(title: string) {
  if (title.length <= 30) return 92;
  if (title.length <= 48) return 76;
  if (title.length <= 70) return 62;
  return 52;
}

/** Rough line count for the wash: Metropolis SemiBold averages ~0.56em per character. */
function lineCount(title: string, size: number) {
  const perLine = Math.floor(COLUMN / (size * 0.56));
  let lines = 1, run = 0;
  for (const w of title.split(/\s+/)) {
    if (run && run + 1 + w.length > perLine) { lines++; run = w.length; } else run += (run ? 1 : 0) + w.length;
  }
  return Math.min(lines, 3);
}

/**
 * The split card (Direction C, chosen 16 Oct 2026): a scarlet block with the sand mark on the
 * right, and on the left either stone with label / title / subtitle, or the cover held back by a
 * stone wash only where the words are (full strength up to 18px above the type, then a 150px fade).
 */
export async function renderOgCard({ label, title, subtitle, coverUrl }: OgCardOptions) {
  const { metropolis, inter, mark } = await loadAssets();
  const cover = absoluteUrl(coverUrl);
  const size = titleSize(title);
  const lines = lineCount(title, size);
  const typeBlock = 24 * 1.2 + 14 + lines * size * 1.05 + (!cover && subtitle ? 24 + 28 * 1.3 : 0);
  const solid = PAD + typeBlock + 18;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: STONE, fontFamily: "Inter" }}>
        <div style={{ position: "relative", width: 1200 - BLOCK, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: PAD }}>
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" width={1200 - BLOCK} height={630} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          )}
          {cover && (
            <div
              style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                background: `linear-gradient(to top, rgba(28,25,23,0.64) 0px, rgba(28,25,23,0.64) ${solid}px, rgba(28,25,23,0) ${solid + 150}px)`,
              }}
            />
          )}
          <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 24, lineHeight: 1.2, color: SCARLET, textTransform: "uppercase", marginBottom: 14 }}>{label}</div>
            <div style={{ fontFamily: "Metropolis", fontSize: size, lineHeight: 1.05, color: SAND, maxWidth: COLUMN, letterSpacing: "-0.005em", display: "flex" }}>
              {title}
            </div>
            {!cover && subtitle ? (
              <div style={{ marginTop: 24, fontSize: 28, lineHeight: 1.3, color: MUTED, maxWidth: COLUMN }}>{subtitle}</div>
            ) : null}
          </div>
        </div>
        <div style={{ width: BLOCK, height: "100%", backgroundColor: SCARLET, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark} alt="" width={MARK} height={MARK} />
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Metropolis", data: metropolis, weight: 600, style: "normal" },
        { name: "Inter", data: inter, weight: 400, style: "normal" },
      ],
    },
  );
}
