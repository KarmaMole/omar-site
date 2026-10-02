import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";

const CONTENT_TAGS = ["work", "studio", "dispatch", "settings", "clients", "homepage"];

function revalidateAllContent() {
  for (const tag of CONTENT_TAGS) {
    try {
      revalidateTag(tag);
    } catch (err) {
      console.warn(`revalidateTag('${tag}') failed:`, err);
    }
  }
}

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  hooks: {
    // Media is referenced by most content, so any change refreshes all tagged caches
    afterChange: [revalidateAllContent],
    afterDelete: [revalidateAllContent],
  },

  upload: {
    mimeTypes: ["image/*", "video/*"],
    formatOptions: {
      format: "webp",
      options: {
        quality: 85,
      },
    },
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: undefined,
      },
      {
        name: "card",
        width: 800,
        height: undefined,
      },
      {
        name: "hero",
        width: 1920,
        height: undefined,
      },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
};
