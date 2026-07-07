/**
 * Shared loading-skeleton primitives for route `loading.tsx` files. Kept
 * visually close to each route's real layout (metric cards / table shape) so
 * there's no layout shift when real content streams in.
 */

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[#e7e1d5] ${className}`} />;
}

export function SkeletonMetricRow({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-[#ece7db] bg-white p-5 shadow-1"
        >
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="mt-3 h-7 w-28" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="rounded-lg border border-[#ece7db] bg-white p-6 shadow-1">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: fields }).map((_, i) => (
          <SkeletonBlock key={i} className="h-11 w-full" />
        ))}
      </div>
      <SkeletonBlock className="mt-4 h-11 w-40" />
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#ece7db] bg-white shadow-1">
      <div className="flex gap-6 border-b border-[#f0ece2] px-6 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBlock key={i} className="h-3 w-20" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-6 border-b border-[#f0ece2] px-6 py-4 last:border-0"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBlock
              key={c}
              className={`h-4 ${c === 0 ? "w-32" : "w-16"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCardGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-[#ece7db] bg-white p-6 shadow-1"
        >
          <div className="flex items-start justify-between gap-3">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-6 w-20" />
          </div>
          <SkeletonBlock className="mt-4 h-2 w-full" />
          <div className="mt-4 grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <SkeletonBlock key={j} className="h-8 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
