import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Dispatch by Omar Kamel";

export default function DispatchIndexOg() {
  return renderOgCard({
    label: "DISPATCH",
    title: "Field Notes",
    subtitle: "On AI production and creative workflows",
  });
}
