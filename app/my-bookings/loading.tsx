import { SiteHeader } from "@/components/layout/site-header";
import { SkeletonCard } from "@/components/ui/skeleton-card";

export default function MyBookingsLoading() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-8 flex flex-wrap gap-2">
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="h-9 w-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
        <div className="mt-6 space-y-5">
          <SkeletonCard lines={5} className="min-h-[16rem]" />
          <SkeletonCard lines={5} className="min-h-[16rem]" />
        </div>
      </main>
    </div>
  );
}
