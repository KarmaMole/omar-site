import type { AdminViewServerProps } from "payload";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter, SetStepNav } from "@payloadcms/ui";
import { redirect } from "next/navigation";
import { toHomepageConfig } from "@/lib/payload/homepage";
import HomepageCurator, { type CuratorItem } from "./curator";

type MediaLike = {
  url?: string | null;
  sizes?: Record<string, { url?: string | null } | undefined> | null;
} | null;

function toItem(doc: Record<string, unknown>, subtitle: string | null): CuratorItem {
  const cover = (typeof doc.coverImage === "object" ? doc.coverImage : null) as MediaLike;
  return {
    id: doc.id as CuratorItem["id"],
    title: (doc.title as string) || "Untitled",
    subtitle,
    thumb: cover?.sizes?.thumbnail?.url || cover?.url || null,
    image: cover?.sizes?.card?.url || cover?.url || null,
    hidden: !!doc.hidden,
    createdAt: (doc.createdAt as string) ?? "",
  };
}

/** Admin view at /admin/homepage: visual picker for the homepage sections. */
export default async function HomepageCuratorView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult;
  if (!req.user) redirect("/admin/login?redirect=%2Fadmin%2Fhomepage");

  const payload = req.payload;
  const [work, projects, homepage] = await Promise.all([
    payload.find({
      collection: "work",
      sort: "-createdAt",
      limit: 1000,
      depth: 1,
      pagination: false,
      select: { title: true, client: true, categories: true, coverImage: true, hidden: true, createdAt: true },
    }),
    payload.find({
      collection: "projects",
      sort: "-createdAt",
      limit: 1000,
      depth: 1,
      pagination: false,
      select: { title: true, categories: true, coverImage: true, hidden: true, createdAt: true },
    }),
    payload.findGlobal({ slug: "homepage", depth: 0 }),
  ]);

  const workItems = work.docs.map((doc) => {
    const d = doc as unknown as Record<string, unknown>;
    const categories = d.categories as string[] | null;
    return toItem(d, (d.client as string) || categories?.[0] || null);
  });
  const studioItems = projects.docs.map((doc) => {
    const d = doc as unknown as Record<string, unknown>;
    const categories = d.categories as string[] | null;
    return toItem(d, categories?.length ? categories.join(", ") : null);
  });

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user}
      visibleEntities={visibleEntities}
    >
      <SetStepNav nav={[{ label: "Homepage" }]} />
      <Gutter>
        <HomepageCurator
          workItems={workItems}
          studioItems={studioItems}
          initial={toHomepageConfig(homepage as unknown as Record<string, unknown>)}
        />
      </Gutter>
    </DefaultTemplate>
  );
}
