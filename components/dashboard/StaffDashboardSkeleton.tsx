import { Skeleton } from "@/components/ui/skeleton";

export function StaffDashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Shift Banner Skeleton */}
      <div className="p-6 rounded-2xl border border-border/60 bg-surface/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* 2. Staff Navigation Tabs Skeleton */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-xl shrink-0" />
        ))}
      </div>

      {/* 3. Main Product Grid & Cart Panel Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Catalog Grid (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((p) => (
              <div key={p} className="p-4 rounded-xl border border-border/60 bg-surface/30 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart / Shift Summary Side Panel (1 col) */}
        <div className="p-6 rounded-2xl border border-border/60 bg-surface/30 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>

          <div className="space-y-3 py-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-background">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>

          <div className="border-t border-border/40 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
