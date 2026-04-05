import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <svg
          width="180"
          height="180"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="13"
            cy="15"
            r="7.5"
            fill="none"
            stroke="#f5f5f5"
            strokeWidth="2.75"
          />
          <circle cx="25.5" cy="23" r="2.5" fill="#00d9ff" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
