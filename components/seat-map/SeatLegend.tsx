import { Armchair, Info } from "lucide-react";

import type { SeatState } from "@/lib/seats/layout";
import { cn } from "@/lib/utils";

const legendItems: { state: SeatState; label: string; className: string }[] = [
  {
    state: "available",
    label: "Available",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  },
  {
    state: "selected",
    label: "Selected",
    className: "border-sky-500 bg-sky-600 text-white",
  },
  {
    state: "occupied",
    label: "Occupied",
    className:
      "border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600",
  },
  {
    state: "booked",
    label: "Your booked seat",
    className:
      "border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200",
  },
];

export function SeatLegend() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {legendItems.map((item) => (
          <div key={item.state} className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border",
                item.className
              )}
              aria-hidden
            >
              <Armchair className="h-4 w-4" />
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Hover or focus a seat to view cabin class and extra fee.
      </p>
    </div>
  );
}
