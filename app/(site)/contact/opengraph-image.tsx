import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const runtime = "edge";
export const revalidate = 86400;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Contact Omar Kamel";

export default function ContactOg() {
  return renderOgCard({
    label: "CONTACT",
    title: "Get in touch",
    subtitle: "Production enquiries and collaborations",
  });
}
