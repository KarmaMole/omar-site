import type { CollectionConfig } from "payload";

export const Work: CollectionConfig = {
  slug: "work",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "client", "featured", "date"],
  },
  access: {
    read: () => true,
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
      required: true,
    },
    {
      name: "categories",
      type: "select",
      hasMany: true,
      options: [
        { label: "AI & Production", value: "AI & Production" },
        { label: "Video Production", value: "Video Production" },
        { label: "AI Films", value: "AI Films" },
        { label: "Music", value: "Music" },
        { label: "Comics & Writing", value: "Comics & Writing" },
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
        },
      ],
    },
    {
      name: "externalLink",
      type: "text",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
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
      admin: {
        position: "sidebar",
      },
    },
  ],
};
