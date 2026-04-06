import type { CollectionConfig } from "payload";
import { resolveVimeoUrls } from "@/lib/resolve-vimeo";

export const Work: CollectionConfig = {
  slug: "work",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "client", "featured", "date"],
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
      name: "description",
      type: "richText",
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
      options: [
        { label: "Commercial", value: "Commercial" },
        { label: "Branding", value: "Branding" },
        { label: "Corporate", value: "Corporate" },
        { label: "Documentary", value: "Documentary" },
        { label: "Awareness", value: "Awareness" },
        { label: "Design", value: "Design" },
        { label: "Digital", value: "Digital" },
      ],
    },
    {
      name: "tags",
      type: "text",
      admin: {
        description: "Comma-separated tags (e.g. Corporate, Metro, TV Ad)",
      },
    },
    {
      name: "document",
      type: "upload",
      relationTo: "documents",
      label: "PDF Document",
      admin: {
        description: "Upload a PDF for preview and download on the detail page",
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
        position: "sidebar",
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
