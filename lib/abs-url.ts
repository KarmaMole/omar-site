import { SITE_URL } from "@/lib/constants";

/**
 * Returns an absolute URL. Absolute http(s) URLs pass through untouched;
 * site-relative paths (e.g. "/media/foo.webp") are prefixed with SITE_URL.
 * Use for JSON-LD `image` values and feed enclosures.
 */
export function absUrl(url: string): string {
  if (url.startsWith("http")) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}
