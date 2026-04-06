export default function WritingLoading() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <div className="h-3 w-16 bg-dark-200 rounded mb-3 animate-pulse" />
          <div className="h-10 w-48 bg-dark-200 rounded mb-3 animate-pulse" />
          <div className="h-5 w-72 bg-dark-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="pb-6 border-b border-white/[0.07] animate-pulse">
              <div className="aspect-video bg-dark-200 rounded-[2px] mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-24 bg-dark-200 rounded" />
                <div className="h-5 w-3/4 bg-dark-200 rounded" />
                <div className="h-4 w-full bg-dark-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
