import type { GlobalConfig } from "payload";
import { revalidateTag } from "next/cache";

/**
 * Homepage curation. Edited through the visual curator at /admin/homepage
 * (components/admin/homepage-curator), so the raw global is hidden from nav.
 *
 * Recent Work slots are pins: an empty slot auto-fills with the newest
 * non-hidden Work item (see lib/payload/homepage.ts).
 */
export const Homepage: GlobalConfig = {
  slug: "homepage",
  admin: {
    hidden: true,
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => !!user,
  },
  hooks: {
    afterChange: [
      () => {
        try {
          revalidateTag("homepage", { expire: 0 });
        } catch (err) {
          console.warn("revalidateTag('homepage') failed:", err);
        }
      },
    ],
  },
  fields: [
    {
      name: "featuredWork",
      type: "relationship",
      relationTo: "work",
    },
    {
      name: "studio",
      type: "relationship",
      relationTo: "projects",
      hasMany: true,
      admin: {
        description: "First item shows large; the rest in a two-column grid.",
      },
    },
    { name: "recentPin1", type: "relationship", relationTo: "work" },
    { name: "recentPin2", type: "relationship", relationTo: "work" },
    { name: "recentPin3", type: "relationship", relationTo: "work" },
  ],
};
