import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const runtime = "nodejs";
export const revalidate = 86400;
export const alt = "Omar Kamel: AI Creative & Production Lead";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OGImage() {
  return renderOgCard({
    label: "Omar Kamel",
    title: "AI Creative & Production Lead",
    subtitle: "Twenty years across Cairo, Italy and Dubai",
  });
}
