import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  upload: {
    mimeTypes: ["image/*", "video/*", "application/pdf"],
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
