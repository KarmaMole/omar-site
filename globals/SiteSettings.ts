import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  access: {
    read: () => true,
    update: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: "heroHeadline",
      type: "text",
      label: "Hero Headline",
    },
    {
      name: "heroTagline",
      type: "text",
      label: "Hero Tagline",
    },
    {
      name: "heroBackground",
      type: "upload",
      relationTo: "media",
      label: "Hero Background",
    },
    {
      name: "aboutBio",
      type: "richText",
      label: "About Bio",
    },
    {
      name: "aboutPhoto",
      type: "upload",
      relationTo: "media",
      label: "About Photo",
    },
    {
      name: "profilePhoto",
      type: "upload",
      relationTo: "media",
      label: "Profile Photo",
    },
    {
      name: "socialLinks",
      type: "array",
      fields: [
        {
          name: "platform",
          type: "select",
          required: true,
          options: [
            { label: "LinkedIn", value: "LinkedIn" },
            { label: "Instagram", value: "Instagram" },
            { label: "X", value: "X" },
            { label: "YouTube", value: "YouTube" },
            { label: "GitHub", value: "GitHub" },
            { label: "Behance", value: "Behance" },
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
      name: "googleAnalyticsId",
      type: "text",
      label: "Google Analytics ID",
      admin: {
        position: "sidebar",
      },
    },
  ],
};
