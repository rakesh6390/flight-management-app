import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  label?: string;
  className?: string;
}

export function PageLoader({
  label = "Loading…",
  className,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] flex-1 flex-col items-center justify-center px-4",
        className
      )}
    >
      <LoadingSpinner label={label} size="lg" />
    </div>
  );
}
