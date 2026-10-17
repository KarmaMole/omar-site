/**
 * One Person node for the whole site. Home and About publish it in full under PERSON_ID;
 * everything else (work, studio, articles, the WebSite) points at it by @id.
 */
import { SITE_URL } from "@/lib/constants";
import { absUrl } from "@/lib/abs-url";
import type { MediaUpload } from "@/lib/payload/types";

export const PERSON_ID = `${SITE_URL}/#person`;
export const PERSON_REF = { "@type": "Person", "@id": PERSON_ID, name: "Omar Kamel", url: SITE_URL } as const;

export function personJsonLd(sameAs: string[], photo: MediaUpload | null) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Omar Kamel",
    alternateName: "Karmamole",
    jobTitle: "AI Creative & Production Lead",
    description: "AI Creative & Production Lead with 20+ years across Cairo, Italy and Dubai: films, AI production, web and app builds, and writing.",
    url: SITE_URL,
    ...(photo?.url ? { image: absUrl(photo.sizes?.hero?.url ?? photo.url) } : {}),
    worksFor: {
      "@type": "Organization",
      name: "Optix",
      parentOrganization: { "@type": "Organization", name: "Publicis Groupe" },
    },
    homeLocation: { "@type": "Place", name: "Dubai, United Arab Emirates" },
    knowsAbout: [
      "AI Video Generation", "AI Image Generation", "Generative AI Production", "Creative Direction",
      "Film Production", "Video Editing", "Music Production", "Web Development", "App Development", "ComfyUI",
    ],
    sameAs,
  };
}

/** Home > Page breadcrumbs for a top-level page. */
export function crumbs(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name, item: `${SITE_URL}${path}` },
    ],
  };
}
