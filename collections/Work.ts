import type { CollectionConfig } from "payload";
import { WORK_CATEGORIES } from "@/lib/categories";
import { revalidateTag } from "next/cache";
import { resolveVimeoUrls } from "@/lib/resolve-vimeo";

export const Work: CollectionConfig = {
  slug: "work",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "client", "date"],
    group: "Content",
  },
  hooks: {
    beforeChange: [
      async ({ data }) => {
        if (data.media) {
          data.media = await resolveVimeoUrls(data.media);
        }
        return data;
      },
    ],
    afterChange: [
      () => {
        try {
          revalidateTag("work");
        } catch (err) {
          console.warn("revalidateTag('work') failed:", err);
        }
      },
    ],
    afterDelete: [
      () => {
        try {
          revalidateTag("work");
        } catch (err) {
          console.warn("revalidateTag('work') failed:", err);
        }
      },
    ],
  },
  versions: { maxPerDoc: 10 },
  access: {
    read: ({ req: { user } }) => (user ? true : { hidden: { not_equals: true } }),
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      // TODO: Refactor to a relationship to the Clients collection for data integrity
      name: "client",
      type: "text",
    },
    {
      name: "roleCredits",
      type: "text",
      admin: {
        description: "Role credits for personal work (e.g. Direction, AI Pipeline Design, Post-Production)",
      },
    },
    {
      name: "description",
      type: "richText",
      admin: {
        description:
          "To embed a video inline, put its URL in [brackets] on its own paragraph, e.g. [https://youtu.be/abc123]. Works for YouTube, Vimeo, SoundCloud, and Spotify. Normal links work as usual.",
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "categories",
      type: "select",
      hasMany: true,
      options: WORK_CATEGORIES.map((value) => ({ label: value, value })),
    },
    {
      name: "tags",
      type: "text",
      admin: {
        description: "Comma-separated tags (e.g. Corporate, Metro, TV Ad)",
      },
    },
    {
      name: "gallery",
      type: "relationship",
      relationTo: "media",
      hasMany: true,
      label: "Image Gallery",
      admin: {
        components: {
          Field: "@/components/admin/gallery-upload",
        },
      },
    },
    {
      name: "media",
      type: "array",
      fields: [
        {
          name: "type",
          type: "select",
          required: true,
          options: [
            { label: "YouTube", value: "youtube" },
            { label: "Vimeo", value: "vimeo" },
            { label: "SoundCloud", value: "soundcloud" },
            { label: "Spotify", value: "spotify" },
          ],
        },
        {
          name: "url",
          type: "text",
          required: true,
          validate: (value: string | null | undefined) => {
            if (!value) return true;
            try { new URL(value); return true; } catch { return 'Please enter a valid URL'; }
          },
        },
      ],
    },
    {
      name: "externalLink",
      type: "text",
      validate: (value: string | null | undefined) => {
        if (!value) return true;
        try { new URL(value); return true; } catch { return 'Please enter a valid URL'; }
      },
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      index: true,
      admin: {
        // Retired: homepage placement now lives in the Homepage global
        hidden: true,
      },
    },
    {
      name: "hidden",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Hide this item from the site without deleting it. Hidden items won't appear anywhere, including the homepage.",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "date",
      type: "date",
      index: true,
      admin: {
        position: "sidebar",
      },
    },
  ],
};
