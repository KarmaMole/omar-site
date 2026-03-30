import type { PortableTextBlock } from "@portabletext/types";

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

export interface MediaEmbed {
  type: "youtube" | "vimeo" | "soundcloud" | "spotify";
  url: string;
}

export interface Work {
  _id: string;
  title: string;
  slug: { current: string };
  client?: string;
  description?: PortableTextBlock[];
  coverImage?: SanityImage;
  categories?: string[];
  tags?: string[];
  media?: MediaEmbed[];
  externalLink?: string;
  featured?: boolean;
  sortOrder?: number;
  date?: string;
}

export interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  description?: PortableTextBlock[];
  coverImage?: SanityImage;
  logo?: SanityImage;
  status?: "active" | "archived" | "paused";
  links?: { label: string; url: string }[];
  tags?: string[];
  featured?: boolean;
  sortOrder?: number;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  coverImage?: SanityImage;
  body?: PortableTextBlock[];
  excerpt?: string;
  date?: string;
  tags?: string[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImage;
  };
}

export interface SiteSettings {
  heroHeadline?: string;
  heroTagline?: string;
  heroBackground?: SanityImage;
  aboutBio?: PortableTextBlock[];
  aboutPhoto?: SanityImage;
  profilePhoto?: SanityImage;
  socialLinks?: { platform: string; url: string }[];
  googleAnalyticsId?: string;
}
