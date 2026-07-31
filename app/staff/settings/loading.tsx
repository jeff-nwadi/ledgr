import { Skeleton } from "@/components/ui/skeleton";

export default function StaffSettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="flex items-center gap-6 border-b border-border/60 pb-3 overflow-x-auto">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-6 w-28 shrink-0 rounded-lg" />
        ))}
      </div>

      <div className="p-6 rounded-2xl border border-border/60 bg-surface/30 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-border/40">
          <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/40">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
