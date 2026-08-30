import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardBody className="space-y-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3.5 w-20" />
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardBody>
            <Skeleton className="h-56 w-full" />
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardBody>
            <Skeleton className="mx-auto h-40 w-40 rounded-full" />
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardBody className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
