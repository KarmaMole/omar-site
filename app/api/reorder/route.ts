import { getPayload, type PayloadRequest } from "payload";
import config from "@payload-config";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Upper bound on items per request (the admin lists are far smaller)
const MAX_ITEMS = 1000;

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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { collection, items } = (body ?? {}) as {
    collection: "work" | "projects" | "clients";
    items: { id: string | number; sortOrder: number }[];
  };

  if (!collection || !Array.isArray(items) || !items.length) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (items.length > MAX_ITEMS) {
    return NextResponse.json({ error: "Too many items" }, { status: 400 });
  }

  if (collection !== "work" && collection !== "projects" && collection !== "clients") {
    return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
  }

  // Validate each item has a valid id and sortOrder, and that ids are unique
  const seenIds = new Set<string>();
  for (const item of items) {
    if (!item || typeof item !== "object") {
      return NextResponse.json({ error: "Invalid item" }, { status: 400 });
    }
    if (typeof item.id !== "number" && typeof item.id !== "string") {
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
    }
    if (typeof item.sortOrder !== "number" || !Number.isFinite(item.sortOrder)) {
      return NextResponse.json({ error: "Invalid sortOrder" }, { status: 400 });
    }
    const key = String(item.id);
    if (seenIds.has(key)) {
      return NextResponse.json({ error: "Duplicate item id" }, { status: 400 });
    }
    seenIds.add(key);
  }

  // All updates share one transaction so a mid-way failure leaves the order untouched
  let transactionID: string | number | undefined;
  try {
    const txID = await payload.db.beginTransaction();
    if (txID) transactionID = txID;
    for (const item of items) {
      await payload.update({
        collection,
        id: item.id,
        data: { sortOrder: item.sortOrder },
        req: { transactionID } as Partial<PayloadRequest>,
      });
    }
    if (transactionID) await payload.db.commitTransaction(transactionID);
    return NextResponse.json({ success: true, count: items.length });
  } catch (err) {
    if (transactionID) {
      try {
        await payload.db.rollbackTransaction(transactionID);
      } catch (rollbackErr) {
        console.error("Reorder rollback error:", rollbackErr);
      }
    }
    console.error("Reorder error:", err);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
