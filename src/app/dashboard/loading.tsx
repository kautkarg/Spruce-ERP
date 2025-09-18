import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="flex flex-1 flex-col gap-6">
      <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            
            <Skeleton className="lg:col-span-2 h-72" />
            <Skeleton className="lg:col-span-4 h-72" />

            <Skeleton className="lg:col-span-2 h-64" />
            <Skeleton className="lg:col-span-2 h-64" />
        </div>
    </main>
  );
}
