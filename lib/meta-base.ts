/**
 * A page's `openGraph`, `twitter` or `alternates` replaces the layout's rather than merging with it,
 * so every page spreads these back in.
 */
export const OG_BASE = { type: "website", locale: "en_US", siteName: "Omar Kamel" } as const;
export const TWITTER_BASE = { card: "summary_large_image", creator: "@omarkamel" } as const;
export const FEED = { "application/rss+xml": "/feed.xml" };
