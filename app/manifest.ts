import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Omar Kamel: AI Creative & Production Lead",
    short_name: "Omar Kamel",
    description:
      "AI Creative & Production Lead with 20+ years across Cairo, Italy, and Dubai. Films, AI production, builds and writing.",
    start_url: "/",
    display: "standalone",
    background_color: "#E7E2D6",
    theme_color: "#E7E2D6",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
