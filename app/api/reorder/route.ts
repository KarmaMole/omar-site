import { getPayload } from "payload";
import config from "@payload-config";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const payload = await getPayload({ config });

  // Authenticate via Payload cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("payload-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { user } = await payload.auth({ headers: req.headers });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { collection, items } = body as {
    collection: "work" | "projects" | "clients";
    items: { id: string; sortOrder: number }[];
  };

  if (!collection || !items?.length) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (collection !== "work" && collection !== "projects" && collection !== "clients") {
    return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
  }

  // Validate each item has a valid id and sortOrder
  for (const item of items) {
    if (typeof item.id !== "number" && typeof item.id !== "string") {
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
    }
    if (typeof item.sortOrder !== "number" || !Number.isFinite(item.sortOrder)) {
      return NextResponse.json({ error: "Invalid sortOrder" }, { status: 400 });
    }
  }

  try {
    for (const item of items) {
      await payload.update({
        collection,
        id: item.id,
        data: { sortOrder: item.sortOrder },
      });
    }
    return NextResponse.json({ success: true, count: items.length });
  } catch (err) {
    console.error("Reorder error:", err);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
