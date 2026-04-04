import { getPayload } from "payload";
import config from "@payload-config";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAllWork, getAllProjects } from "@/lib/payload/queries";
import ReorderList from "@/components/admin/reorder-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reorder Items",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ReorderPage() {
  // Auth check
  const payload = await getPayload({ config });
  const cookieStore = await cookies();
  const token = cookieStore.get("payload-token")?.value;

  if (!token) redirect("/admin");

  try {
    const headersList = await headers();
    const { user } = await payload.auth({ headers: headersList });
    if (!user) redirect("/admin");
  } catch {
    redirect("/admin");
  }

  // Fetch data
  const [work, projects] = await Promise.all([
    getAllWork(),
    getAllProjects(),
  ]);

  const workItems = work.map((w) => ({
    id: String(w.id),
    title: w.title,
    thumbnail:
      typeof w.coverImage === "object" && w.coverImage
        ? w.coverImage.sizes?.thumbnail?.url || w.coverImage.url
        : null,
    category: w.categories?.[0] ?? undefined,
  }));

  const exploreItems = projects.map((p) => ({
    id: String(p.id),
    title: p.title,
    thumbnail:
      typeof p.coverImage === "object" && p.coverImage
        ? p.coverImage.sizes?.thumbnail?.url || p.coverImage.url
        : null,
    category: p.contentType ?? undefined,
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 py-12">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="font-mono text-lg tracking-widest uppercase text-cyan mb-2">
          Reorder Items
        </h1>
        <p className="text-sm text-light-300/60">
          Drag items to reorder. First item shows at the top of the site. Hit
          Save when done.
        </p>
      </div>
      <ReorderList workItems={workItems} exploreItems={exploreItems} />
    </div>
  );
}
