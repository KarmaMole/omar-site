"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { headers } from "next/headers";
import { RECENT_WORK_SLOTS } from "@/lib/payload/homepage";

type Id = string | number;

export type SaveHomepageInput = {
  featuredWork: Id | null;
  studio: Id[];
  recentPins: (Id | null)[];
};

// Postgres ids are integers
function isId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export async function saveHomepage(
  input: SaveHomepageInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) return { ok: false, error: "You're signed out. Sign in again and retry." };

  const { featuredWork, studio, recentPins } = input ?? {};
  if (
    (featuredWork !== null && !isId(featuredWork)) ||
    !Array.isArray(studio) ||
    !studio.every(isId) ||
    !Array.isArray(recentPins) ||
    recentPins.length !== RECENT_WORK_SLOTS ||
    !recentPins.every((pin) => pin === null || isId(pin))
  ) {
    return { ok: false, error: "Invalid homepage data." };
  }
  // Validated above
  const pins = recentPins as (number | null)[];

  try {
    await payload.updateGlobal({
      slug: "homepage",
      data: {
        featuredWork: featuredWork as number | null,
        studio: [...new Set(studio as number[])],
        recentPin1: pins[0],
        recentPin2: pins[1],
        recentPin3: pins[2],
      },
      user,
      overrideAccess: false,
    });
    return { ok: true };
  } catch (err) {
    console.error("saveHomepage failed:", err);
    return { ok: false, error: "Couldn't save. Check the server logs." };
  }
}
