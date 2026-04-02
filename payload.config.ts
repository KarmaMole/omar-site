import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { seoPlugin } from "@payloadcms/plugin-seo";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

import { Media } from "./collections/Media";
import { Work } from "./collections/Work";
import { Projects } from "./collections/Projects";
import { BlogPosts } from "./collections/BlogPosts";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  editor: lexicalEditor(),
  collections: [
    {
      slug: "users",
      auth: true,
      admin: { useAsTitle: "email" },
      fields: [],
    },
    Media,
    Work,
    Projects,
    BlogPosts,
  ],
  globals: [SiteSettings],
  secret: process.env.PAYLOAD_SECRET || "DEVELOPMENT-SECRET-CHANGE-ME",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || "",
    }),
    seoPlugin({
      collections: ["blog-posts"],
      uploadsCollection: "media",
      generateTitle: ({ doc }) =>
        `${(doc as { title?: string }).title ?? ""} | Omar Kamel`,
      generateDescription: ({ doc }) =>
        (doc as { excerpt?: string }).excerpt ?? "",
    }),
  ],
  sharp,
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
});
