import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex items-center gap-6 border-b border-border/60 pb-3 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-6 w-28 shrink-0 rounded-lg" />
        ))}
      </div>

      <div className="space-y-6 max-w-4xl">
        <div className="p-6 rounded-2xl border border-border/60 bg-surface/30 space-y-4">
          <Skeleton className="h-6 w-36" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border/40">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
