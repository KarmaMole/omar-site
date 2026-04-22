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
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        }
        return data;
      },
    ],
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
        description: "Auto-generated from title if left empty",
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
        description:
          "Paste markdown here. Supports headings, bold, italic, links, lists, images, and code blocks. To embed a video, put the URL in [brackets] on its own line, e.g. [https://youtu.be/abc123]. Works for YouTube, Vimeo, SoundCloud, and Spotify. Regular links still use [label](url).",
      },
    },
    {
      name: "images",
      type: "array",
      label: "Inline Images",
      admin: {
        description: 'Upload images here, then reference them in the body with ![alt](image-1), ![alt](image-2), etc.',
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "alt",
          type: "text",
          admin: {
            description: "Optional alt text for accessibility",
          },
        },
        {
          name: "copyRef",
          type: "ui",
          admin: {
            components: {
              Field: "@/components/admin/copy-image-ref#default",
            },
          },
        },
      ],
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
      name: "generateAll",
      type: "ui",
      admin: {
        position: "sidebar",
        components: {
          Field: "@/components/admin/generate-all-button#default",
        },
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
      name: "categories",
      type: "select",
      hasMany: true,
      options: [
        { label: "AI Production", value: "AI Production" },
        { label: "Workflows", value: "Workflows" },
        { label: "Industry", value: "Industry" },
        { label: "Tools", value: "Tools" },
        { label: "Case Studies", value: "Case Studies" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "tags",
      type: "text",
      admin: {
        description: "Comma-separated tags for additional topics (e.g. ComfyUI, Image Generation, Egypt)",
      },
    },
  ],
};
