import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ count = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-64 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="space-y-2 sm:text-right">
              <div className="h-8 w-20 rounded bg-slate-200 dark:bg-slate-800 sm:ml-auto" />
              <div className="h-10 w-28 rounded-lg bg-slate-200 dark:bg-slate-800 sm:ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchFormSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="mt-4 h-11 rounded-lg bg-sky-200 dark:bg-sky-900" />
    </div>
  );
}
