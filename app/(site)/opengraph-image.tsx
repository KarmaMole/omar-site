import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Omar Kamel — AI Creative & Production Lead";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Accent glow */}
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
        {/* Label */}
        <div
          style={{
            fontSize: "14px",
            letterSpacing: "0.3em",
            textTransform: "uppercase" as const,
            color: "#00d9ff",
            marginBottom: "24px",
            fontFamily: "monospace",
          }}
        >
          AI Creative & Production
        </div>
        {/* Name */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: "24px",
          }}
        >
          Omar Kamel
        </div>
        {/* Subtitle */}
        <div
          style={{
            fontSize: "20px",
            color: "rgba(245, 245, 245, 0.5)",
            lineHeight: 1.5,
            maxWidth: "600px",
          }}
        >
          20+ years crafting stories across film, music, brand, and emerging
          media.
        </div>
        {/* Bottom line */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "80px",
            fontSize: "14px",
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
            color: "rgba(0, 217, 255, 0.6)",
            fontFamily: "monospace",
          }}
        >
          omarkamel.com
        </div>
      </div>
    ),
    { ...size }
  );
}
