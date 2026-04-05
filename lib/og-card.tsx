import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

interface OgCardOptions {
  label: string; // e.g. "WORK", "WRITING", "EXPLORE"
  title: string;
  subtitle?: string | null; // e.g. client name, excerpt, content type
  coverUrl?: string | null; // absolute URL; relative URLs will be prefixed
}

/**
 * Normalize a media URL for ImageResponse. ImageResponse fetches remote
 * images server-side, so relative URLs from Payload need to be absolute.
 */
function absoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://omarkamel.com${url.startsWith("/") ? url : `/${url}`}`;
}

/**
 * Shared branded OG card used by per-route opengraph-image files.
 * Renders the cover image as a background (with dark gradient for legibility)
 * when available, otherwise falls back to the solid dark + cyan glow treatment
 * that matches the site's root OG image.
 */
export function renderOgCard({ label, title, subtitle, coverUrl }: OgCardOptions) {
  const cover = absoluteUrl(coverUrl);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          backgroundColor: "#0a0a0a",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.55,
            }}
          />
        )}

        {/* Dark gradient overlay for text legibility */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: cover
              ? "linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.95) 100%)"
              : "transparent",
          }}
        />

        {/* Cyan accent glow (only when no cover, matches root OG) */}
        {!cover && (
          <div
            style={{
              position: "absolute",
              top: "-100px",
              right: "-100px",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "rgba(0, 217, 255, 0.08)",
              filter: "blur(80px)",
            }}
          />
        )}

        {/* Top-left label */}
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "80px",
            fontSize: "14px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#00d9ff",
            fontFamily: "monospace",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#00d9ff",
            }}
          />
          {label}
        </div>

        {/* Main content (bottom-left) */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "0 80px 80px 80px",
            zIndex: 1,
          }}
        >
          {subtitle && (
            <div
              style={{
                fontSize: "22px",
                color: "rgba(245, 245, 245, 0.65)",
                marginBottom: "16px",
                fontFamily: "monospace",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {subtitle}
            </div>
          )}
          <div
            style={{
              fontSize: title.length > 60 ? "56px" : "72px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              maxWidth: "1040px",
              display: "flex",
              overflow: "hidden",
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom-right URL */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "80px",
            fontSize: "14px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(0, 217, 255, 0.7)",
            fontFamily: "monospace",
          }}
        >
          omarkamel.com
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
