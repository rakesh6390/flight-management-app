import { SiteHeader } from "@/components/layout/site-header";
import { SkeletonCard } from "@/components/ui/skeleton-card";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <SkeletonCard key={key} lines={2} />
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <SkeletonCard lines={5} className="min-h-[14rem]" />
          <SkeletonCard lines={4} />
        </div>
      </main>
    </div>
  );
}
