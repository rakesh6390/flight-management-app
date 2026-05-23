"use client";

import { ArrowRight, CheckCircle2, Plane, Radio, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { Seat } from "@/components/seat-map/Seat";
import { SeatLegend } from "@/components/seat-map/SeatLegend";
import { useSeatRealtime } from "@/hooks/useSeatRealtime";
import {
  createSeatViewModels,
  generateCabinSections,
  getCabinLabel,
  type SeatViewModel,
} from "@/lib/seats/layout";
import { formatPrice } from "@/lib/flights/format";
import { cn } from "@/lib/utils";
import {
  selectSelectedSeat,
  useFlightStore,
} from "@/stores/useFlightStore";
import type { Tables } from "@/types/database";

interface SeatMapProps {
  seats: Tables<"seats">[];
  bookedSeatIds?: string[];
}

const cabinAccent: Record<SeatViewModel["class"], string> = {
  first: "border-amber-200 bg-amber-50/70 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
  business:
    "border-indigo-200 bg-indigo-50/70 text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-200",
  economy:
    "border-slate-200 bg-slate-50/80 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
};

export function SeatMap({ seats, bookedSeatIds = [] }: SeatMapProps) {
  const selectedSeat = useFlightStore(selectSelectedSeat);
  const selectSeatOptimistic = useFlightStore((state) => state.selectSeatOptimistic);
  const [focusedSeatId, setFocusedSeatId] = useState<string | null>(null);
  const flightId = seats[0]?.flight_id ?? null;
  const {
    seats: realtimeSeats,
    status: realtimeStatus,
    error: realtimeError,
  } = useSeatRealtime({
    flightId,
    initialSeats: seats,
  });

  const selectedSeatId = selectedSeat?.seat.id ?? null;

  const seatModels = useMemo(
    () => createSeatViewModels(realtimeSeats, selectedSeatId, bookedSeatIds),
    [bookedSeatIds, realtimeSeats, selectedSeatId]
  );

  const sections = useMemo(() => generateCabinSections(seatModels), [seatModels]);
  const availableCount = seatModels.filter((seat) => seat.state === "available").length;

  function handleSelect(seat: SeatViewModel) {
    if (seat.state !== "available" && seat.state !== "selected") {
      return;
    }

    selectSeatOptimistic(seat);
  }

  function moveFocus(currentSeat: SeatViewModel, direction: "left" | "right" | "up" | "down") {
    const sortedSeats = seatModels
      .filter((seat) => seat.state !== "occupied" && seat.state !== "booked")
      .sort((a, b) => a.rowNumber - b.rowNumber || a.column.localeCompare(b.column));

    const currentIndex = sortedSeats.findIndex((seat) => seat.id === currentSeat.id);
    if (currentIndex === -1) {
      return;
    }

    const nextIndex =
      direction === "left" || direction === "up"
        ? Math.max(0, currentIndex - 1)
        : Math.min(sortedSeats.length - 1, currentIndex + 1);

    const nextSeat = sortedSeats[nextIndex];
    setFocusedSeatId(nextSeat.id);
    document.getElementById(`seat-${nextSeat.id}`)?.focus();
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Select your seat
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {availableCount} available seats across {sections.length} cabin
              {sections.length === 1 ? "" : "s"}
            </p>
          </div>
          {selectedSeat?.seat ? (
            <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              {selectedSeat.seat.seat_number} selected
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium",
              realtimeStatus === "subscribed"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                : realtimeStatus === "error"
                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                  : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
            )}
          >
            <Radio className="h-3.5 w-3.5" aria-hidden />
            {realtimeStatus === "subscribed"
              ? "Live seat updates"
              : realtimeStatus === "error"
                ? "Realtime unavailable"
                : "Connecting realtime"}
          </span>
          {realtimeError ? (
            <span className="text-red-600 dark:text-red-400">
              {realtimeError}
            </span>
          ) : null}
        </div>

        <div className="mt-5 overflow-x-auto pb-3" aria-label="Aircraft seat map">
          <div className="mx-auto min-w-max max-w-max rounded-[2rem] border border-slate-200 bg-slate-100/80 p-3 dark:border-slate-800 dark:bg-slate-950 sm:p-5">
            <div className="mb-5 flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300">
              <Plane className="h-4 w-4 -rotate-45" aria-hidden />
              Front of aircraft
            </div>

            <div className="space-y-5">
              {sections.map((section) => (
                <section
                  key={section.class}
                  className={cn(
                    "rounded-2xl border p-3 sm:p-4",
                    cabinAccent[section.class]
                  )}
                  aria-label={`${getCabinLabel(section.class)} cabin`}
                >
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase">
                        {getCabinLabel(section.class)}
                      </h3>
                      <p className="text-xs opacity-80">{section.seatCount} seats</p>
                    </div>
                    {section.class === "first" ? (
                      <Sparkles className="h-4 w-4" aria-hidden />
                    ) : null}
                  </div>

                  <div
                    className="grid gap-2"
                    role="grid"
                    aria-label={`${getCabinLabel(section.class)} seats`}
                  >
                    <div className="grid grid-cols-[2rem_1fr] items-center gap-2">
                      <span className="text-center text-xs font-semibold text-slate-400">
                        Row
                      </span>
                      <div className="flex gap-2">
                        {section.columns.map((column) => (
                          <div
                            key={column}
                            className={cn(
                              "flex h-6 w-11 items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-400 sm:w-10",
                              section.aisleAfterColumns.includes(column) && "mr-5"
                            )}
                          >
                            {column}
                          </div>
                        ))}
                      </div>
                    </div>

                    {section.rows.map((row) => (
                      <div
                        key={`${section.class}-${row.rowNumber}`}
                        className="grid grid-cols-[2rem_1fr] items-center gap-2"
                        role="row"
                      >
                        <span className="text-center text-xs font-bold text-slate-500 dark:text-slate-400">
                          {row.rowNumber}
                        </span>
                        <div className="flex gap-2">
                          {section.columns.map((column) => {
                            const seat = row.seatsByColumn.get(column);
                            const hasAisle = section.aisleAfterColumns.includes(column);

                            return (
                              <div
                                key={`${row.rowNumber}-${column}`}
                                className={cn("h-11 w-11 sm:h-10 sm:w-10", hasAisle && "mr-5")}
                                role="gridcell"
                              >
                                {seat ? (
                                  <span
                                    onKeyDown={(event) => {
                                      if (event.key === "ArrowLeft") {
                                        event.preventDefault();
                                        moveFocus(seat, "left");
                                      }
                                      if (event.key === "ArrowRight") {
                                        event.preventDefault();
                                        moveFocus(seat, "right");
                                      }
                                      if (event.key === "ArrowUp") {
                                        event.preventDefault();
                                        moveFocus(seat, "up");
                                      }
                                      if (event.key === "ArrowDown") {
                                        event.preventDefault();
                                        moveFocus(seat, "down");
                                      }
                                    }}
                                  >
                                    <Seat
                                      seat={seat}
                                      isFocused={focusedSeatId === seat.id}
                                      onSelect={handleSelect}
                                    />
                                  </span>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
              Rear exit
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </div>
          </div>
        </div>
      </div>

      <SeatLegend />

      {selectedSeat?.seat ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Selected seat
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedSeat.seat.seat_number}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {getCabinLabel(selectedSeat.seat.class)} cabin
              </p>
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {formatPrice(selectedSeat.seat.extra_fee)}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
