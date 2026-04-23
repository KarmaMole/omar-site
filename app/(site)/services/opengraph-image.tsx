import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const runtime = "edge";
export const revalidate = 86400;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Services by Omar Kamel";

export default function ServicesOg() {
  return renderOgCard({
    label: "SERVICES",
    title: "Services",
    subtitle: "AI production, direction, and digital builds",
  });
}
