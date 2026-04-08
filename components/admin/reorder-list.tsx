"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";

interface Item {
  id: string;
  title: string;
  thumbnail: string | null;
  category?: string;
}

interface SortableItemProps {
  item: Item;
  index: number;
}

function SortableItem({ item, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-3 border border-dark-100 bg-[#141414] ${
        isDragging ? "opacity-80 shadow-lg shadow-cyan/20 border-cyan/50" : ""
      }`}
    >
      <button
        className="cursor-grab active:cursor-grabbing p-1 text-light-300/50 hover:text-cyan touch-none"
        {...attributes}
        {...listeners}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </button>

      <span className="font-mono text-xs text-light-300/40 w-6 text-right">
        {index + 1}
      </span>

      <div className="w-12 h-8 bg-dark-200 flex-shrink-0 overflow-hidden">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt=""
            width={48}
            height={32}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-dark-100" />
        )}
      </div>

      <span className="text-sm text-white truncate flex-1">{item.title}</span>

      {item.category && (
        <span className="font-mono text-[10px] tracking-widest uppercase text-light-300/50 hidden sm:block">
          {item.category}
        </span>
      )}
    </div>
  );
}

interface ReorderListProps {
  workItems: Item[];
  studioItems: Item[];
}

export default function ReorderList({
  workItems: initialWork,
  studioItems: initialStudio,
}: ReorderListProps) {
  const [activeTab, setActiveTab] = useState<"work" | "studio">("work");
  const [workItems, setWorkItems] = useState(initialWork);
  const [studioItems, setStudioItems] = useState(initialStudio);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const items = activeTab === "work" ? workItems : studioItems;
  const setItems = activeTab === "work" ? setWorkItems : setStudioItems;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
      setHasChanges(true);
      setStatus(null);
    },
    [setItems]
  );

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);

    const total = items.length;
    const payload = items.map((item, index) => ({
      id: item.id,
      sortOrder: total - index,
    }));

    try {
      const res = await fetch("/api/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          collection: activeTab === "work" ? "work" : "projects",
          items: payload,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setStatus("Saved!");
      setHasChanges(false);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 border-b border-dark-100">
        {(["work", "studio"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setStatus(null);
            }}
            className={`px-6 py-3 font-mono text-xs tracking-widest uppercase transition-colors ${
              activeTab === tab
                ? "text-cyan border-b-2 border-cyan"
                : "text-light-300/50 hover:text-white"
            }`}
          >
            {tab} ({tab === "work" ? workItems.length : studioItems.length})
          </button>
        ))}
      </div>

      {/* Drag list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {items.map((item, index) => (
              <SortableItem key={item.id} item={item} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Save bar */}
      <div className="sticky bottom-0 mt-6 py-4 bg-[#0a0a0a]/90 backdrop-blur border-t border-dark-100 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className={`px-6 py-2.5 font-mono text-xs tracking-widest uppercase transition-all ${
            hasChanges
              ? "bg-cyan text-black hover:shadow-[0_0_12px_rgba(0,217,255,0.4)]"
              : "bg-dark-100 text-light-300/30 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving..." : "Save Order"}
        </button>

        {status && (
          <span
            className={`font-mono text-xs ${
              status === "Saved!" ? "text-green-400" : "text-red-400"
            }`}
          >
            {status}
          </span>
        )}

        {hasChanges && !status && (
          <span className="font-mono text-xs text-yellow-400/70">
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  );
}
