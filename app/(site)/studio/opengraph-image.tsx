import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "The Studio by Omar Kamel";

export default function StudioIndexOg() {
  return renderOgCard({
    label: "STUDIO",
    title: "The Studio",
    subtitle: "Self-directed projects, music, and experiments",
  });
}
