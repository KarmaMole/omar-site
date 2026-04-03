export function SkeletonCard() {
  return (
    <div className="rounded-sm overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Image area */}
      <div className="aspect-video bg-gray-200 dark:bg-slate-700 animate-pulse" />
      {/* Content area */}
      <div className="p-4 space-y-3">
        {/* Title line */}
        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
        {/* Description lines */}
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-full" />
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse ${
            i === lines - 1 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}
