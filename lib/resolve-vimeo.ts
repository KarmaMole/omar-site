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

      // Already a numeric URL
      if (/vimeo\.com\/\d+/.test(item.url)) return item;

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
