import type { CollectionConfig } from "payload";

export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "featured"],
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
      name: "contentType",
      type: "select",
      options: [
        { label: "Music", value: "music" },
        { label: "Visual", value: "visual" },
        { label: "Comics", value: "comics" },
        { label: "Film", value: "film" },
        { label: "AI", value: "ai" },
        { label: "Writing", value: "writing" },
        { label: "Photography", value: "photography" },
      ],
      defaultValue: "visual",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "streamingUrl",
      type: "text",
      label: "Streaming URL",
      admin: {
        condition: (_data, siblingData) => siblingData?.contentType === "music",
      },
    },
    {
      name: "audioFile",
      type: "upload",
      relationTo: "media",
      label: "Audio File",
      admin: {
        condition: (_data, siblingData) => siblingData?.contentType === "music",
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
        condition: (_data, siblingData) =>
          siblingData?.contentType === "photography" ||
          siblingData?.contentType === "visual",
      },
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
      type: "array",
      fields: [
        {
          name: "tag",
          type: "text",
          required: true,
        },
      ],
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
  ],
};
