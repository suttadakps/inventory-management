function Pulse({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-[#e7e1d5] ${className}`} />
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-[#ece7db] bg-white p-5 shadow-1">
      <Pulse className="h-3 w-24" />
      <Pulse className="mt-3 h-7 w-32" />
    </div>
  );
}

function ListPanelSkeleton() {
  return (
    <section className="rounded-lg border border-[#ece7db] bg-white p-6 shadow-1">
      <Pulse className="mb-4 h-5 w-40" />
      <div className="divide-y divide-[#f0ece2]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Pulse className="h-4 w-2/3" />
              <Pulse className="h-3 w-1/3" />
            </div>
            <Pulse className="h-6 w-20 shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ListPanelSkeleton />
        <ListPanelSkeleton />
      </div>
    </div>
  );
}
