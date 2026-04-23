import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const runtime = "edge";
export const revalidate = 86400;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Selected Work by Omar Kamel";

export default function WorkIndexOg() {
  return renderOgCard({
    label: "WORK",
    title: "Selected Work",
    subtitle: "20+ years of production and direction",
  });
}
