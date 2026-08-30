import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Squelette générique pour une page « liste » (Factures, Clients…). */
export function ListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="hidden h-9 w-64 sm:block" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 sm:px-6">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="hidden h-4 w-24 sm:block" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
