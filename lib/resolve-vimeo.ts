/**
 * Resolves Vimeo vanity URLs to numeric IDs via the oEmbed API.
 * Called in beforeChange hooks so the database always stores numeric URLs.
 */
export async function resolveVimeoUrls(
  media: { type: string; url: string; id?: string }[] | undefined | null
): Promise<{ type: string; url: string; id?: string }[] | undefined | null> {
  if (!media?.length) return media;

  return Promise.all(
    media.map(async (item) => {
      if (item.type !== "vimeo") return item;

      // Extract numeric ID from any Vimeo URL format (/manage/videos/ID, /video/ID, /ID)
      const numericMatch = item.url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
      if (numericMatch) {
        // Normalize to clean format
        return { ...item, url: `https://vimeo.com/${numericMatch[1]}` };
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
