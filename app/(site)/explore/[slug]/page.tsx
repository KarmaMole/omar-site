import { redirect } from "next/navigation";

interface ExploreDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExploreDetailPage({ params }: ExploreDetailPageProps) {
  const { slug } = await params;
  redirect(`/studio/${slug}`);
}
