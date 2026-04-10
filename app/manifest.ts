import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Omar Kamel: AI Creative & Production Lead",
    short_name: "Omar Kamel",
    description:
      "AI Creative & Production Lead with 20+ years across Cairo, Italy, and Dubai. Specializing in AI video/image generation, creative production, and digital content.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
