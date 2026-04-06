import type { CollectionConfig } from "payload";

export const Documents: CollectionConfig = {
  slug: "documents",
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  upload: {
    mimeTypes: ["application/pdf"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Description",
      admin: {
        description: "Brief description of the document (used for accessibility)",
      },
    },
  ],
};
