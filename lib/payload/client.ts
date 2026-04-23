import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Returns the Payload instance, deduped per request via React cache().
 * This composes with unstable_cache in queries.ts: unstable_cache handles
 * cross-request persistence, React cache handles intra-request dedup so
 * a single render that calls multiple query functions only boots Payload once.
 */
export const getPayloadClient = cache(async () => {
  return getPayload({ config });
});
