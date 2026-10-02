import { notFound } from "next/navigation";

/**
 * Catch-all so unknown URLs render the branded (site)/not-found.tsx instead of
 * Next's bare default 404. Real routes always win over a catch-all, so /admin,
 * /api, /play, /feed.xml, /sitemap.xml, /robots.txt and the OG image routes are
 * not shadowed.
 */
export default function MissingPage() {
  notFound();
}
