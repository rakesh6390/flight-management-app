"use client";

import { ArrowRight, Clock, Plane, Users } from "lucide-react";

import {
  formatCabinClass,
  formatFlightDuration,
  formatFlightTime,
  formatPrice,
  formatPriceDifference,
} from "@/lib/flights/format";
import type { RescheduleFlightOption } from "@/types/flights";
import { cn } from "@/lib/utils";

interface AlternativeFlightCardProps {
  flight: RescheduleFlightOption;
  selected: boolean;
  onSelect: () => void;
}

export function AlternativeFlightCard({
  flight,
  selected,
  onSelect,
}: AlternativeFlightCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition",
        "min-h-[44px] touch-manipulation",
        selected
          ? "border-sky-500 bg-white shadow-md ring-2 ring-sky-500/30 dark:bg-slate-900"
          : "border-slate-200 bg-white hover:border-sky-300 dark:border-slate-700 dark:bg-slate-900/80"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
            <Plane className="h-4 w-4 text-sky-600" aria-hidden />
            {flight.flight_no}
          </span>
          {flight.aircraft_type ? (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {flight.aircraft_type}
            </span>
          ) : null}
        </div>
        <span
          className={cn(
            "text-sm font-bold",
            flight.priceDifference > 0
              ? "text-amber-700 dark:text-amber-300"
              : flight.priceDifference < 0
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-slate-600 dark:text-slate-400"
          )}
        >
          {formatPriceDifference(flight.priceDifference)} est.
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-5">
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {formatFlightTime(flight.departs_at)}
          </p>
          <p className="text-xs text-slate-500">Departs · {flight.origin}</p>
        </div>
        <div className="flex flex-col items-center gap-0.5 text-slate-400">
          <ArrowRight className="h-4 w-4" aria-hidden />
          <span className="inline-flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" aria-hidden />
            {formatFlightDuration(flight.departs_at, flight.arrives_at)}
          </span>
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {formatFlightTime(flight.arrives_at)}
          </p>
          <p className="text-xs text-slate-500">Arrives · {flight.destination}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Users className="h-3.5 w-3.5" aria-hidden />
          {flight.totalAvailableSeats} seats open
        </span>
        {flight.seatAvailability.map(({ class: cabin, availableCount }) => (
          <span
            key={cabin}
            className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          >
            {formatCabinClass(cabin)} · {availableCount}
          </span>
        ))}
        <span className="text-slate-500">
          From {formatPrice(flight.base_price)}
        </span>
      </div>
    </button>
  );
}
