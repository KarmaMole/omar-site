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
import { Clients } from "./collections/Clients";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

if (!process.env.PAYLOAD_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("PAYLOAD_SECRET environment variable is required");
}
if (!process.env.DATABASE_URI && process.env.NODE_ENV === "production") {
  throw new Error("DATABASE_URI environment variable is required");
}
if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.NODE_ENV === "production") {
  console.warn("BLOB_READ_WRITE_TOKEN not set — file uploads will be disabled");
}

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
    Clients,
  ],
  globals: [SiteSettings],
  secret: process.env.PAYLOAD_SECRET || require("crypto").randomBytes(32).toString("hex"),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  plugins: [
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            enabled: true,
            collections: {
              media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
    seoPlugin({
      collections: ["blog-posts"],
      uploadsCollection: "media",
      generateTitle: ({ doc }) =>
        `${(doc as { title?: string }).title ?? ""} | Omar Kamel`,
      generateDescription: ({ doc }) =>
        (doc as { excerpt?: string }).excerpt ?? "",
    }),
  ],
  graphQL: {
    maxComplexity: 1000,
    disablePlaygroundInProduction: true,
  },
  sharp,
  admin: {
    avatar: "default",
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: ["@/components/admin/reorder-link#default"],
      afterNavLinks: ["@/components/admin/reorder-nav-link#default"],
    },
  },
});
