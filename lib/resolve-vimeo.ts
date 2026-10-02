import { parseVimeo } from "./embed-url";

/**
 * Resolves Vimeo vanity URLs to numeric IDs via the oEmbed API.
 * Called in beforeChange hooks so the database always stores numeric URLs.
 * Unlisted privacy hashes (vimeo.com/ID/HASH or ?h=HASH) are preserved,
 * otherwise the video would not play.
 */
export async function resolveVimeoUrls(
  media: { type: string; url: string; id?: string }[] | undefined | null
): Promise<{ type: string; url: string; id?: string }[] | undefined | null> {
  if (!media?.length) return media;

  return Promise.all(
    media.map(async (item) => {
      if (item.type !== "vimeo") return item;

      // Extract numeric ID (and unlisted hash) from any Vimeo URL format
      // (/manage/videos/ID, /video/ID, /ID, /ID/HASH, player ?h=HASH)
      const parsed = parseVimeo(item.url);
      if (parsed) {
        const clean = parsed.hash
          ? `https://vimeo.com/${parsed.id}/${parsed.hash}`
          : `https://vimeo.com/${parsed.id}`;
        return { ...item, url: clean };
      }

      try {
        const res = await fetch(
          `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(item.url)}`
        );
        const data = await res.json();
        if (data.video_id) {
          return { ...item, url: `https://vimeo.com/${data.video_id}` };
        }
      } catch {
        // If resolution fails, keep the original URL
      }
      return item;
    })
  );
}
