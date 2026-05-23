"use client";

import { ArrowRight, Clock, Plane } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  formatCabinClass,
  formatFlightDuration,
  formatFlightTime,
  formatPrice,
  formatFlightStatus,
} from "@/lib/flights/format";
import { useFlightStore } from "@/stores/useFlightStore";
import type { FlightWithAvailability } from "@/types/flights";
import { cn } from "@/lib/utils";

interface FlightCardProps {
  flight: FlightWithAvailability;
  passengerCount: number;
}

export function FlightCard({ flight, passengerCount }: FlightCardProps) {
  const router = useRouter();
  const [isSelecting, setIsSelecting] = useState(false);
  const setSelectedFlight = useFlightStore((s) => s.setSelectedFlight);
  const setSearchQuery = useFlightStore((s) => s.setSearchQuery);

  const handleSelect = () => {
    setIsSelecting(true);
    setSearchQuery({ passengerCount });
    setSelectedFlight(flight);
    router.push(`/seat-selection?flightId=${flight.id}`);
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-800">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              <Plane className="h-3.5 w-3.5" aria-hidden />
              {flight.flight_no}
            </span>
            <StatusBadge status={flight.status} />
            {flight.aircraft_type ? (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {flight.aircraft_type}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                {formatFlightTime(flight.departs_at)}
              </p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {flight.origin}
              </p>
            </div>

            <div className="flex flex-col items-center gap-1 px-2 text-slate-400">
              <ArrowRight className="h-4 w-4" aria-hidden />
              <span className="inline-flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" aria-hidden />
                {formatFlightDuration(flight.departs_at, flight.arrives_at)}
              </span>
            </div>

            <div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                {formatFlightTime(flight.arrives_at)}
              </p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {flight.destination}
              </p>
            </div>
          </div>

          {flight.seatAvailability.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {flight.seatAvailability.map(({ class: cabin, availableCount }) => (
                <span
                  key={cabin}
                  className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {formatCabinClass(cabin)} · {availableCount} seats
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              No seats available in any class
            </p>
          )}
        </div>

        <div className="flex flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4 lg:flex-col lg:items-end lg:border-0 lg:pt-0 dark:border-slate-800">
          <div className="text-left lg:text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              From
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatPrice(flight.base_price)}
            </p>
            <p className="text-xs text-slate-500">per passenger</p>
          </div>
          <button
            type="button"
            onClick={handleSelect}
            disabled={isSelecting || flight.seatAvailability.length === 0}
            className={cn(
              "rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {isSelecting ? "Selecting…" : "Select flight"}
          </button>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    scheduled:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    delayed:
      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    cancelled: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  };

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        styles[status] ?? "bg-slate-100 text-slate-600 dark:bg-slate-800"
      )}
    >
      {formatFlightStatus(status)}
    </span>
  );
}
