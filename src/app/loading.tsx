import { PageShell } from '@/components/PageShell';
import { PaperListSkeleton } from '@/components/PaperList';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <PageShell>
      <div role="status" aria-label="Loading papers">
        <div className="mb-8 space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
        <PaperListSkeleton />
      </div>
    </PageShell>
  );
}
