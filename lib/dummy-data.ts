import type { SiteSettings, Work, Project, BlogPost } from "./sanity/types";

// ─── Site Settings ────────────────────────────────────────────────────────────

export const dummySettings: SiteSettings = {
  heroHeadline: "Omar Kamel",
  heroTagline:
    "AI Creative & Production Lead — 20+ years crafting stories across film, music, brand, and emerging media.",
  socialLinks: [
    { platform: "LinkedIn", url: "https://www.linkedin.com/in/omarkamel" },
    { platform: "Instagram", url: "https://www.instagram.com/karmamole" },
    { platform: "Twitter", url: "https://twitter.com/omarkamel" },
    { platform: "YouTube", url: "https://www.youtube.com/@6DOFReviews" },
  ],
};

// ─── Work ─────────────────────────────────────────────────────────────────────

export const dummyWork: Work[] = [
  {
    _id: "work-1",
    title: "Reimagined Horizons",
    slug: { current: "saudia-reimagined-horizons" },
    client: "Saudia Airlines",
    categories: ["AI & Production"],
    tags: ["AI", "Brand Film", "Aviation", "Identity"],
    featured: true,
    sortOrder: 1,
    date: "2024-03-15",
    externalLink: "https://www.saudia.com",
  },
  {
    _id: "work-2",
    title: "Future of Terrain",
    slug: { current: "gmc-future-of-terrain" },
    client: "GMC",
    categories: ["AI & Production", "Video Production"],
    tags: ["AI", "Automotive", "Campaign", "Video"],
    featured: true,
    sortOrder: 2,
    date: "2024-01-20",
  },
  {
    _id: "work-3",
    title: "Digital Transformation Campaign",
    slug: { current: "adcb-digital-transformation" },
    client: "ADCB",
    categories: ["AI & Production"],
    tags: ["AI", "Finance", "Campaign", "Brand Strategy"],
    featured: true,
    sortOrder: 3,
    date: "2023-11-10",
  },
  {
    _id: "work-4",
    title: "Echoes of Tomorrow",
    slug: { current: "echoes-of-tomorrow" },
    client: undefined,
    categories: ["AI Films"],
    tags: ["AI Film", "Short Film", "Sci-Fi", "Generative"],
    featured: true,
    sortOrder: 4,
    date: "2024-05-01",
    media: [
      {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ],
  },
  {
    _id: "work-5",
    title: "Signal Decay",
    slug: { current: "signal-decay-album" },
    client: undefined,
    categories: ["Music"],
    tags: ["Music", "Electronic", "Album", "AI-assisted"],
    featured: true,
    sortOrder: 5,
    date: "2023-09-01",
    media: [
      {
        type: "spotify",
        url: "https://open.spotify.com/album/placeholder",
      },
    ],
  },
  {
    _id: "work-6",
    title: "Intelligence Unleashed",
    slug: { current: "core42-intelligence-unleashed" },
    client: "Core42",
    categories: ["AI & Production"],
    tags: ["AI", "Tech", "Brand Film", "Enterprise"],
    featured: true,
    sortOrder: 6,
    date: "2024-02-14",
  },
  {
    _id: "work-7",
    title: "The Last Archive",
    slug: { current: "the-last-archive" },
    client: undefined,
    categories: ["Comics & Writing"],
    tags: ["Comics", "Arabic", "Graphic Novel", "Sci-Fi"],
    featured: false,
    sortOrder: 7,
    date: "2023-06-20",
  },
  {
    _id: "work-8",
    title: "Refreshed Visions",
    slug: { current: "coca-cola-refreshed-visions" },
    client: "Coca-Cola",
    categories: ["Video Production"],
    tags: ["Video", "FMCG", "Brand Campaign", "Regional"],
    featured: false,
    sortOrder: 8,
    date: "2023-04-05",
  },
];

// ─── Projects ─────────────────────────────────────────────────────────────────

export const dummyProjects: Project[] = [
  {
    _id: "project-1",
    title: "6DOF Reviews",
    slug: { current: "6dof-reviews" },
    status: "active",
    tags: ["VR", "XR", "Reviews", "YouTube", "6DOF"],
    links: [
      { label: "Website", url: "https://6dof.reviews" },
      { label: "YouTube", url: "https://www.youtube.com/@6DOFReviews" },
    ],
    featured: true,
    sortOrder: 1,
  },
  {
    _id: "project-2",
    title: "Human Impact News",
    slug: { current: "humanimpact-news" },
    status: "active",
    tags: ["Journalism", "AI", "Media", "News"],
    links: [{ label: "Website", url: "https://humanimpact.news" }],
    featured: true,
    sortOrder: 2,
  },
  {
    _id: "project-3",
    title: "AI Production Toolkit",
    slug: { current: "ai-production-toolkit" },
    status: "active",
    tags: ["AI", "Tools", "Open Source", "Production"],
    links: [
      { label: "GitHub", url: "https://github.com/omarkamel/ai-production-toolkit" },
    ],
    featured: true,
    sortOrder: 3,
  },
];

// ─── Blog Posts ───────────────────────────────────────────────────────────────

export const dummyBlogPosts: BlogPost[] = [
  {
    _id: "post-1",
    title: "The AI Shift in Production: What 20 Years Taught Me",
    slug: { current: "ai-shift-in-production" },
    excerpt:
      "After two decades in creative production — from broadcast to brand films — the arrival of generative AI isn't a disruption. It's a continuation. Here's what I've learned navigating that evolution.",
    date: "2024-04-10T09:00:00Z",
    tags: ["AI", "Production", "Career", "Reflection"],
  },
  {
    _id: "post-2",
    title: "Prompting for Film: A Director's Perspective on Generative Tools",
    slug: { current: "prompting-for-film" },
    excerpt:
      "Directing an AI-generated short film is less about clicking buttons and more about developing a visual language with the machine. These are the frameworks that work for me.",
    date: "2024-03-01T09:00:00Z",
    tags: ["AI Films", "Directing", "Generative AI", "Workflow"],
  },
  {
    _id: "post-3",
    title: "Arabic Comics in the Digital Age: Why I Started The Last Archive",
    slug: { current: "arabic-comics-digital-age" },
    excerpt:
      "Arabic graphic storytelling has a rich history that rarely gets told outside the region. The Last Archive is my attempt to change that — one panel at a time.",
    date: "2023-12-15T09:00:00Z",
    tags: ["Comics", "Arabic", "Writing", "Storytelling"],
  },
  {
    _id: "post-4",
    title: "Building a Career at the Intersection of Art and Technology",
    slug: { current: "career-art-technology-intersection" },
    excerpt:
      "Nobody told me that being a creative technologist was a career path. I accidentally built one anyway. Here's the honest map of how that happened and what it actually looks like day to day.",
    date: "2023-10-05T09:00:00Z",
    tags: ["Career", "Creative Technology", "AI", "Personal"],
  },
];
