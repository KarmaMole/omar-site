import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "About Omar Kamel";

export default function AboutOg() {
  return renderOgCard({
    label: "ABOUT",
    title: "Omar Kamel",
    subtitle: "AI Creative & Production Lead",
  });
}
