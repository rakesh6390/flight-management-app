import { LoadingSkeleton, SearchFormSkeleton } from "@/components/flights/loading-skeleton";
import { SiteHeader } from "@/components/layout/site-header";

export default function FlightsLoading() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <SearchFormSkeleton />
        <div className="mt-8">
          <LoadingSkeleton count={4} />
        </div>
      </main>
    </div>
  );
}
