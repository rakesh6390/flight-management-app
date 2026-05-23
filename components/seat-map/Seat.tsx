"use client";

import { Armchair } from "lucide-react";

import { getCabinLabel, type SeatState, type SeatViewModel } from "@/lib/seats/layout";
import { cn } from "@/lib/utils";

interface SeatProps {
  seat: SeatViewModel;
  isFocused?: boolean;
  onSelect: (seat: SeatViewModel) => void;
}

const stateStyles: Record<SeatState, string> = {
  available:
    "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 dark:hover:border-emerald-700",
  occupied:
    "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-70 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600",
  selected:
    "border-sky-500 bg-sky-600 text-white shadow-lg shadow-sky-500/25 ring-2 ring-sky-500/30",
  booked:
    "border-violet-300 bg-violet-100 text-violet-800 ring-2 ring-violet-400/30 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200",
};

export function Seat({ seat, isFocused, onSelect }: SeatProps) {
  const disabled = seat.state === "occupied" || seat.state === "booked";
  const extraFee = Number(seat.extra_fee);
  const feeLabel = extraFee > 0 ? `+$${extraFee.toFixed(0)}` : "No extra fee";
  const tooltip = `${getCabinLabel(seat.class)} seat. ${feeLabel}.`;

  return (
    <button
      id={`seat-${seat.id}`}
      type="button"
      disabled={disabled}
      title={tooltip}
      aria-label={`${seat.seat_number}, ${getCabinLabel(seat.class)}, ${feeLabel}, ${seat.state}`}
      aria-pressed={seat.state === "selected"}
      onClick={() => onSelect(seat)}
      className={cn(
        "min-h-11 min-w-11 touch-manipulation sm:min-h-10 sm:min-w-10",
        "group relative flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-lg border text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 sm:h-10 sm:w-10",
        stateStyles[seat.state],
        isFocused && "outline outline-2 outline-offset-2 outline-sky-500"
      )}
    >
      <Armchair className="h-4 w-4" aria-hidden />
      <span className="sr-only">{seat.seat_number}</span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden min-w-32 -translate-x-1/2 rounded-lg bg-slate-950 px-2.5 py-1.5 text-center text-xs font-medium text-white shadow-lg group-hover:block group-focus-visible:block"
      >
        {getCabinLabel(seat.class)}
        <br />
        {feeLabel}
      </span>
    </button>
  );
}
