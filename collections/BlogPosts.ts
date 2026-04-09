import type { CollectionConfig } from "payload";

export const BlogPosts: CollectionConfig = {
  slug: "blog-posts",
  labels: {
    singular: "Dispatch",
    plural: "Dispatches",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "date", "tags"],
    group: "Content",
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      minLength: 3,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      minLength: 3,
      unique: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "body",
      type: "textarea",
      admin: {
        description: "Paste markdown here. Supports headings, bold, italic, links, lists, images, and code blocks.",
      },
    },
    {
      name: "excerpt",
      type: "textarea",
    },
    {
      name: "date",
      type: "date",
      index: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "isExternal",
      type: "checkbox",
      defaultValue: false,
      label: "External Publication",
    },
    {
      name: "publicationUrl",
      type: "text",
      label: "Publication URL",
      admin: {
        condition: (_data, siblingData) => siblingData?.isExternal === true,
      },
    },
    {
      name: "publicationName",
      type: "text",
      label: "Publication Name",
      admin: {
        condition: (_data, siblingData) => siblingData?.isExternal === true,
      },
    },
    {
      name: "tags",
      type: "text",
      admin: {
        description: "Comma-separated tags (e.g. AEgypt, Amerika, Media)",
      },
    },
  ],
};
