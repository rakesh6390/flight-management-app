import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
};

export function LoadingSpinner({
  label,
  className,
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-2 text-slate-600 dark:text-slate-400", className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className={cn("animate-spin", sizeMap[size])} aria-hidden />
      {label ? <span className="text-sm">{label}</span> : null}
      {!label ? <span className="sr-only">Loading</span> : null}
    </div>
  );
}
