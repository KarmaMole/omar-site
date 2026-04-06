export default function WorkLoading() {
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
            <div key={i} className="bg-dark-200 border border-white/[0.07] rounded-[2px] overflow-hidden animate-pulse">
              <div className="aspect-video bg-dark-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-20 bg-dark-100 rounded" />
                <div className="h-5 w-3/4 bg-dark-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
