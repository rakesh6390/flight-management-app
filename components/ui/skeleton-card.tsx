import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export function SkeletonCard({ className, lines = 3 }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
        className
      )}
      aria-hidden
    >
      <div className="h-5 w-1/3 rounded-md bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-4 rounded bg-slate-200 dark:bg-slate-800"
            style={{ width: `${Math.max(40, 100 - index * 15)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
