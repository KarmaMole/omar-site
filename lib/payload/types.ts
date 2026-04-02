export interface MediaUpload {
  id: string;
  alt: string;
  url: string;
  width?: number;
  height?: number;
  sizes?: {
    thumbnail?: { url: string; width: number; height: number };
    card?: { url: string; width: number; height: number };
    hero?: { url: string; width: number; height: number };
  };
}

export interface MediaEmbed {
  type: "youtube" | "vimeo" | "soundcloud" | "spotify";
  url: string;
}

export interface WorkDoc {
  id: string;
  title: string;
  slug: string;
  client?: string | null;
  description?: unknown;
  coverImage: MediaUpload | string;
  categories?: string[] | null;
  tags?: { tag: string }[] | null;
  media?: MediaEmbed[] | null;
  externalLink?: string | null;
  featured?: boolean | null;
  sortOrder?: number | null;
  date?: string | null;
}

export interface ProjectDoc {
  id: string;
  title: string;
  slug: string;
  description?: unknown;
  coverImage: MediaUpload | string;
  logo?: MediaUpload | string | null;
  status?: "active" | "paused" | "archived" | null;
  links?: { label: string; url: string }[] | null;
  tags?: { tag: string }[] | null;
  featured?: boolean | null;
  sortOrder?: number | null;
}

export interface BlogPostDoc {
  id: string;
  title: string;
  slug: string;
  coverImage?: MediaUpload | string | null;
  body?: unknown;
  excerpt?: string | null;
  date?: string | null;
  tags?: { tag: string }[] | null;
  meta?: {
    title?: string | null;
    description?: string | null;
    image?: MediaUpload | string | null;
  } | null;
}

export interface SiteSettingsDoc {
  heroHeadline?: string | null;
  heroTagline?: string | null;
  heroBackground?: MediaUpload | string | null;
  aboutBio?: unknown;
  aboutPhoto?: MediaUpload | string | null;
  profilePhoto?: MediaUpload | string | null;
  socialLinks?: { platform: string; url: string }[] | null;
  googleAnalyticsId?: string | null;
}
