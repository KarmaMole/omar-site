import type { CollectionConfig } from "payload";
import { PROJECT_CATEGORIES } from "@/lib/categories";
import { revalidateTag } from "next/cache";
import { resolveVimeoUrls } from "@/lib/resolve-vimeo";

export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status"],
    group: "Content",
  },
  labels: {
    singular: "Studio Item",
    plural: "Studio",
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
          revalidateTag("studio");
        } catch (err) {
          console.warn("revalidateTag('studio') failed:", err);
        }
      },
    ],
    afterDelete: [
      () => {
        try {
          revalidateTag("studio");
        } catch (err) {
          console.warn("revalidateTag('studio') failed:", err);
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
      name: "categories",
      type: "select",
      hasMany: true,
      options: PROJECT_CATEGORIES.map((value) => ({ label: value, value })),
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "streamingUrl",
      type: "text",
      label: "Streaming URL",
      admin: {
        condition: (_data, siblingData) => (siblingData?.categories as string[] | undefined)?.includes("Music") ?? false,
      },
    },
    {
      name: "audioFile",
      type: "upload",
      relationTo: "media",
      label: "Audio File",
      admin: {
        condition: (_data, siblingData) => (siblingData?.categories as string[] | undefined)?.includes("Music") ?? false,
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
        condition: (_data, siblingData) => {
          const cats = siblingData?.categories as string[] | undefined;
          if (!cats?.length) return true; // show gallery by default
          return cats.some((c) => ["Photography", "Visual", "Comics", "AI", "Film"].includes(c));
        },
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
      name: "logo",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Paused", value: "paused" },
        { label: "Archived", value: "archived" },
      ],
      defaultValue: "active",
      index: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "links",
      type: "array",
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
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
      name: "tags",
      type: "text",
      admin: {
        description: "Comma-separated tags (e.g. AI Art, Exhibition, Cairo)",
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
  ],
};
