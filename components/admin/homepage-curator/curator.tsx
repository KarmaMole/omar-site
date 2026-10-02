"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { fillRecentSlots, RECENT_WORK_SLOTS, type HomepageConfig } from "@/lib/payload/homepage";
import { saveHomepage } from "./actions";
import styles from "./curator.module.css";

type Id = string | number;

export type CuratorItem = {
  id: Id;
  title: string;
  subtitle: string | null;
  thumb: string | null;
  image: string | null;
  hidden: boolean;
  createdAt: string;
};

// Work placements share one array: index 0 is Featured Work, 1..3 are the
// Recent Work pins. Moving between them swaps, like rearranging cards.
const FEATURED = 0;

type DragData =
  | { kind: "work"; id: Id; from: number | null }
  | { kind: "projects"; id: Id; from: "library" | "studio" };

const same = (a: Id | null | undefined, b: Id | null | undefined) =>
  a != null && b != null && String(a) === String(b);

const studioKey = (id: Id) => `studio-${id}`;

// Prefer the most specific target under the pointer over the whole studio zone.
const collision: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  const list = hits.length ? hits : rectIntersection(args);
  const specific = list.filter((c) => c.id !== "drop-studio");
  return specific.length ? specific : list;
};

export default function HomepageCurator({
  workItems,
  studioItems,
  initial,
}: {
  workItems: CuratorItem[];
  studioItems: CuratorItem[];
  initial: HomepageConfig;
}) {
  // Drop references to deleted documents so saving doesn't fail validation
  const [start] = useState(() => {
    const workIds = new Set(workItems.map((w) => String(w.id)));
    const studioIds = new Set(studioItems.map((p) => String(p.id)));
    return {
      workSlots: [initial.featuredWork, ...initial.recentPins].map((id) =>
        id != null && workIds.has(String(id)) ? id : null
      ),
      studio: initial.studio.filter((id) => studioIds.has(String(id))),
    };
  });
  const [workSlots, setWorkSlots] = useState<(Id | null)[]>(start.workSlots);
  const [studio, setStudio] = useState<Id[]>(start.studio);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify([start.workSlots, start.studio]));
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [saving, startSaving] = useTransition();
  const [active, setActive] = useState<DragData | null>(null);
  const [tab, setTab] = useState<"work" | "projects">("work");
  const [query, setQuery] = useState("");

  const dirty = JSON.stringify([workSlots, studio]) !== savedSnapshot;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const workById = useMemo(() => new Map(workItems.map((w) => [String(w.id), w])), [workItems]);
  const studioById = useMemo(() => new Map(studioItems.map((p) => [String(p.id), p])), [studioItems]);

  // Same logic the homepage uses, so this preview is exactly what ships
  const visibleWork = useMemo(() => workItems.filter((w) => !w.hidden), [workItems]);
  const recentSlots = fillRecentSlots(workSlots.slice(1), visibleWork, workSlots[FEATURED]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function changed() {
    setStatus(null);
  }

  function moveWork(id: Id, from: number | null, to: number) {
    setWorkSlots((prev) => {
      const next = prev.map((slot) => (same(slot, id) ? null : slot));
      const displaced = prev[to];
      next[to] = id;
      if (from != null && from !== to && displaced != null && !same(displaced, id)) {
        next[from] = displaced;
      }
      return next;
    });
    changed();
  }

  function clearWorkSlot(index: number) {
    setWorkSlots((prev) => prev.map((slot, i) => (i === index ? null : slot)));
    changed();
  }

  function placeStudio(id: Id, index: number) {
    setStudio((prev) => {
      const existing = prev.findIndex((p) => same(p, id));
      if (existing >= 0) return arrayMove(prev, existing, Math.min(index, prev.length - 1));
      const next = [...prev];
      next.splice(index, 0, id);
      return next;
    });
    changed();
  }

  function removeStudio(id: Id) {
    setStudio((prev) => prev.filter((p) => !same(p, id)));
    changed();
  }

  function handleDragEnd({ active: dragged, over }: DragEndEvent) {
    setActive(null);
    const data = dragged.data.current as DragData | undefined;
    if (!data || !over) return;
    const overId = String(over.id);

    if (data.kind === "work") {
      const match = overId.match(/^drop-slot-(\d)$/);
      if (match) moveWork(data.id, data.from, Number(match[1]));
      return;
    }

    let index = -1;
    if (overId === "drop-studio") index = studio.length;
    else if (overId.startsWith("studio-")) index = studio.findIndex((id) => studioKey(id) === overId);
    if (index >= 0) placeStudio(data.id, index);
  }

  function save() {
    startSaving(async () => {
      const result = await saveHomepage({
        featuredWork: workSlots[FEATURED],
        studio,
        recentPins: workSlots.slice(1),
      });
      if (result.ok) {
        setSavedSnapshot(JSON.stringify([workSlots, studio]));
        setStatus({ tone: "ok", text: "Saved. The homepage updates within a minute." });
      } else {
        setStatus({ tone: "error", text: result.error });
      }
    });
  }

  function discard() {
    const [slots, savedStudio] = JSON.parse(savedSnapshot) as [(Id | null)[], Id[]];
    setWorkSlots(slots);
    setStudio(savedStudio);
    setStatus(null);
  }

  const workSlotOf = (id: Id) => workSlots.findIndex((slot) => same(slot, id));
  const firstFreePin = workSlots.findIndex((slot, i) => i > FEATURED && slot == null);

  const featured = workSlots[FEATURED] != null ? workById.get(String(workSlots[FEATURED])) : undefined;
  const studioDocs = studio
    .map((id) => studioById.get(String(id)))
    .filter((p): p is CuratorItem => !!p);

  const activeItem =
    active &&
    (active.kind === "work" ? workById.get(String(active.id)) : studioById.get(String(active.id)));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collision}
      onDragStart={({ active: a }: DragStartEvent) => setActive((a.data.current as DragData) ?? null)}
      onDragCancel={() => setActive(null)}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.root}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Homepage</h1>
            <p className={styles.lede}>
              Drag items from the library into place. Recent Work slots fill themselves with your
              newest work unless you pin something there.
            </p>
          </div>
          <div className={styles.headerActions}>
            {status ? (
              <span className={status.tone === "ok" ? styles.statusOk : styles.statusError} role="status">
                {status.text}
              </span>
            ) : dirty ? (
              <span className={styles.statusDirty}>Unsaved changes</span>
            ) : null}
            <a className={styles.linkButton} href="/" target="_blank" rel="noopener noreferrer">
              View site ↗
            </a>
            {dirty && (
              <button type="button" className={styles.secondaryButton} onClick={discard} disabled={saving}>
                Discard
              </button>
            )}
            <button
              type="button"
              className={styles.primaryButton}
              onClick={save}
              disabled={!dirty || saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </header>

        <div className={styles.layout}>
          <div className={styles.canvas}>
            {/* Featured Work */}
            <Section label="Featured Work" hint="One item, shown large at the top.">
              <WorkSlot index={FEATURED} active={active} className={styles.wide}>
                {featured ? (
                  <PlacedWork
                    item={featured}
                    slot={FEATURED}
                    aspect="wide"
                    badge="Featured"
                    onRemove={() => clearWorkSlot(FEATURED)}
                    removeLabel="Remove"
                  />
                ) : (
                  <EmptySlot aspect="wide" text="Drag a Work item here" />
                )}
              </WorkSlot>
            </Section>

            {/* From the Studio */}
            <Section
              label="From the Studio"
              hint={`${studioDocs.length} item${studioDocs.length === 1 ? "" : "s"}. The first shows large, the rest in two columns. Drag to reorder.`}
            >
              <StudioZone active={active}>
                <SortableContext items={studioDocs.map((p) => studioKey(p.id))} strategy={rectSortingStrategy}>
                  <div className={styles.grid}>
                    {studioDocs.map((item, i) => (
                      <StudioCard
                        key={String(item.id)}
                        item={item}
                        position={i + 1}
                        large={i === 0}
                        onRemove={() => removeStudio(item.id)}
                      />
                    ))}
                    {studioDocs.length === 0 ? (
                      <div className={styles.wide}>
                        <EmptySlot aspect="wide" text="Drag Studio items here" />
                      </div>
                    ) : (
                      <div className={studioDocs.length % 2 === 1 ? styles.wide : undefined}>
                        <div className={styles.appendTarget}>Drop here to add at the end</div>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </StudioZone>
            </Section>

            {/* Recent Work */}
            <Section label="Recent Work" hint="Auto slots show your newest Work. Drop an item on a slot to pin it.">
              <div className={styles.grid}>
                {Array.from({ length: RECENT_WORK_SLOTS }, (_, i) => {
                  const slotIndex = i + 1;
                  const resolved = recentSlots[i];
                  const pinId = workSlots[slotIndex];
                  const pinBroken = pinId != null && !resolved?.pinned;
                  const aspect = i === 0 ? "wide" : "card";
                  return (
                    <WorkSlot
                      key={slotIndex}
                      index={slotIndex}
                      active={active}
                      className={i === 0 ? styles.wide : undefined}
                    >
                      {resolved?.pinned ? (
                        <PlacedWork
                          item={resolved.item}
                          slot={slotIndex}
                          aspect={aspect}
                          badge="📌 Pinned"
                          onRemove={() => clearWorkSlot(slotIndex)}
                          removeLabel="Unpin"
                        />
                      ) : resolved ? (
                        <Card
                          item={resolved.item}
                          aspect={aspect}
                          badge="Auto · newest"
                          auto
                          warning={pinBroken ? "Pinned item is hidden, so this slot is auto-filling" : undefined}
                          action={pinBroken ? { label: "Clear pin", onClick: () => clearWorkSlot(slotIndex) } : undefined}
                        />
                      ) : (
                        <EmptySlot aspect={aspect} text="No more Work to fill this slot" />
                      )}
                    </WorkSlot>
                  );
                })}
              </div>
            </Section>
          </div>

          <aside className={styles.library} aria-label="Library">
            <div className={styles.tabs} role="tablist">
              {(["work", "projects"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  className={tab === t ? styles.tabActive : styles.tab}
                  onClick={() => setTab(t)}
                >
                  {t === "work" ? "Work" : "Studio"}
                </button>
              ))}
            </div>
            <input
              className={styles.search}
              type="search"
              placeholder={`Search ${tab === "work" ? "Work" : "Studio"}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <ul className={styles.libraryList}>
              {(tab === "work" ? workItems : studioItems)
                .filter((item) => !item.hidden)
                .filter((item) => {
                  const q = query.trim().toLowerCase();
                  return !q || `${item.title} ${item.subtitle ?? ""}`.toLowerCase().includes(q);
                })
                .map((item) => {
                  if (tab === "work") {
                    const slot = workSlotOf(item.id);
                    return (
                      <LibraryRow
                        key={String(item.id)}
                        item={item}
                        data={{ kind: "work", id: item.id, from: null }}
                        placement={slot === FEATURED ? "Featured" : slot > 0 ? `Pinned · slot ${slot}` : null}
                      >
                        <button
                          type="button"
                          className={styles.rowButton}
                          disabled={slot === FEATURED}
                          onClick={() => moveWork(item.id, slot >= 0 ? slot : null, FEATURED)}
                        >
                          Feature
                        </button>
                        <button
                          type="button"
                          className={styles.rowButton}
                          disabled={slot > 0 || firstFreePin < 0}
                          title={firstFreePin < 0 && slot <= 0 ? "All Recent Work slots are pinned. Unpin one first." : undefined}
                          onClick={() => moveWork(item.id, null, firstFreePin)}
                        >
                          Pin
                        </button>
                      </LibraryRow>
                    );
                  }
                  const position = studio.findIndex((id) => same(id, item.id));
                  return (
                    <LibraryRow
                      key={String(item.id)}
                      item={item}
                      data={{ kind: "projects", id: item.id, from: "library" }}
                      placement={position >= 0 ? `Studio #${position + 1}` : null}
                    >
                      {position >= 0 ? (
                        <button type="button" className={styles.rowButton} onClick={() => removeStudio(item.id)}>
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={styles.rowButton}
                          onClick={() => placeStudio(item.id, studio.length)}
                        >
                          Add
                        </button>
                      )}
                    </LibraryRow>
                  );
                })}
            </ul>
          </aside>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <div className={styles.overlay}>
            <Thumb src={activeItem.thumb} />
            <span>{activeItem.title}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// ─── Pieces ─────────────────────────────────────────────────────

function Section({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionLabel}>{label}</h2>
        <p className={styles.sectionHint}>{hint}</p>
      </div>
      {children}
    </section>
  );
}

function WorkSlot({
  index,
  active,
  className,
  children,
}: {
  index: number;
  active: DragData | null;
  className?: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `drop-slot-${index}` });
  const accepting = active?.kind === "work";
  return (
    <div
      ref={setNodeRef}
      className={[styles.slot, className, accepting && styles.slotReady, accepting && isOver && styles.slotOver]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

function StudioZone({ active, children }: { active: DragData | null; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "drop-studio" });
  const accepting = active?.kind === "projects" && active.from === "library";
  return (
    <div
      ref={setNodeRef}
      className={[styles.zone, accepting && styles.slotReady, accepting && isOver && styles.slotOver]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

function PlacedWork({
  item,
  slot,
  aspect,
  badge,
  onRemove,
  removeLabel,
}: {
  item: CuratorItem;
  slot: number;
  aspect: "wide" | "card";
  badge: string;
  onRemove: () => void;
  removeLabel: string;
}) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: `slot-${slot}`,
    data: { kind: "work", id: item.id, from: slot } satisfies DragData,
  });
  return (
    <div ref={setNodeRef} className={isDragging ? styles.dragging : undefined} {...attributes} {...listeners}>
      <Card
        item={item}
        aspect={aspect}
        badge={badge}
        warning={item.hidden ? "Hidden, so it won't show on the site" : undefined}
        action={{ label: removeLabel, onClick: onRemove }}
      />
    </div>
  );
}

function StudioCard({
  item,
  position,
  large,
  onRemove,
}: {
  item: CuratorItem;
  position: number;
  large: boolean;
  onRemove: () => void;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: studioKey(item.id),
    data: { kind: "projects", id: item.id, from: "studio" } satisfies DragData,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={[large && styles.wide, isDragging && styles.dragging].filter(Boolean).join(" ") || undefined}
      {...attributes}
      {...listeners}
    >
      <Card
        item={item}
        aspect={large ? "wide" : "card"}
        badge={`#${position}`}
        warning={item.hidden ? "Hidden, so it won't show on the site" : undefined}
        action={{ label: "Remove", onClick: onRemove }}
      />
    </div>
  );
}

function Card({
  item,
  aspect,
  badge,
  auto,
  warning,
  action,
}: {
  item: CuratorItem;
  aspect: "wide" | "card";
  badge: string;
  auto?: boolean;
  warning?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div
      className={[styles.card, aspect === "wide" ? styles.aspectWide : styles.aspectCard, auto && styles.cardAuto]
        .filter(Boolean)
        .join(" ")}
      style={item.image ? { backgroundImage: `url("${item.image}")` } : undefined}
    >
      <div className={styles.cardShade} />
      <span className={auto ? styles.badgeAuto : styles.badge}>{badge}</span>
      {action && (
        <button
          type="button"
          className={styles.cardAction}
          // Keep the click from starting a drag on the card underneath
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
      <div className={styles.cardText}>
        {item.subtitle && <span className={styles.cardEyebrow}>{item.subtitle}</span>}
        <span className={styles.cardTitle}>{item.title}</span>
        {warning && <span className={styles.cardWarning}>⚠ {warning}</span>}
      </div>
    </div>
  );
}

function EmptySlot({ aspect, text }: { aspect: "wide" | "card"; text: string }) {
  return (
    <div className={[styles.empty, aspect === "wide" ? styles.aspectWide : styles.aspectCard].join(" ")}>
      {text}
    </div>
  );
}

function LibraryRow({
  item,
  data,
  placement,
  children,
}: {
  item: CuratorItem;
  data: DragData;
  placement: string | null;
  children: ReactNode;
}) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: `lib-${data.kind}-${item.id}`,
    data,
  });
  return (
    <li ref={setNodeRef} className={[styles.row, isDragging && styles.dragging].filter(Boolean).join(" ")}>
      <div className={styles.rowGrip} {...attributes} {...listeners} aria-label={`Drag ${item.title}`}>
        <Thumb src={item.thumb} />
        <div className={styles.rowText}>
          <span className={styles.rowTitle}>{item.title}</span>
          <span className={styles.rowMeta}>
            {placement ? <span className={styles.rowPlaced}>{placement}</span> : item.subtitle}
          </span>
        </div>
      </div>
      <div className={styles.rowActions}>{children}</div>
    </li>
  );
}

function Thumb({ src }: { src: string | null }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={styles.thumb} src={src} alt="" loading="lazy" />
  ) : (
    <span className={styles.thumb} />
  );
}
