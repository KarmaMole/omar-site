// Shared between the homepage and the admin curator so the curator's
// preview always matches what the site renders.

export const RECENT_WORK_SLOTS = 3;

type Id = string | number;

/**
 * Fill the Recent Work slots. A pinned slot shows its pin; an empty slot
 * takes the next newest item that isn't the Featured Work hero, isn't
 * pinned elsewhere, and isn't already shown. Returns one entry per slot;
 * a slot is null only when there's nothing left to fill it with.
 *
 * `newest` must already be sorted newest first and exclude hidden items.
 * `pinnedItems` are the resolved pin documents (any order, hidden ones
 * removed); pins with no match there are treated as empty.
 */
export function fillRecentSlots<T extends { id: Id }>(
  pins: (Id | null | undefined)[],
  newest: T[],
  heroId: Id | null | undefined,
  pinnedItems: T[] = newest
): ({ item: T; pinned: boolean } | null)[] {
  const byId = new Map(pinnedItems.map((item) => [String(item.id), item]));
  const used = new Set<string>();
  if (heroId != null) used.add(String(heroId));

  const pinned: (T | null)[] = [];
  for (let i = 0; i < RECENT_WORK_SLOTS; i++) {
    const pin = pins[i];
    const item = pin != null ? byId.get(String(pin)) : undefined;
    if (item && !used.has(String(item.id))) {
      used.add(String(item.id));
      pinned.push(item);
    } else {
      pinned.push(null);
    }
  }

  const autoPool = newest.filter((item) => !used.has(String(item.id)));
  return pinned.map((item) => {
    if (item) return { item, pinned: true };
    const next = autoPool.shift();
    return next ? { item: next, pinned: false } : null;
  });
}

export type HomepageConfig = {
  featuredWork: Id | null;
  studio: Id[];
  recentPins: (Id | null)[];
};

function relId(value: unknown): Id | null {
  if (value == null) return null;
  if (typeof value === "object" && "id" in value) return (value as { id: Id }).id;
  return value as Id;
}

/** Normalize the raw `homepage` global (any depth) into plain ids. */
export function toHomepageConfig(doc: Record<string, unknown> | null | undefined): HomepageConfig {
  return {
    featuredWork: relId(doc?.featuredWork),
    studio: ((doc?.studio as unknown[] | null) ?? [])
      .map(relId)
      .filter((id): id is Id => id != null),
    recentPins: [relId(doc?.recentPin1), relId(doc?.recentPin2), relId(doc?.recentPin3)],
  };
}
