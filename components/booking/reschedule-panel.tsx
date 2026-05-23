"use client";

import { X } from "lucide-react";

import { AlternativeFlightCard } from "@/components/booking/alternative-flight-card";
import { RescheduleConfirmDialog } from "@/components/booking/booking-action-dialogs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { useRescheduleBooking } from "@/hooks/useRescheduleBooking";
import {
  formatCabinClass,
  formatPrice,
  formatPriceDifference,
} from "@/lib/flights/format";
import type { UserBooking } from "@/lib/bookings/queries";
import { cn } from "@/lib/utils";

interface ReschedulePanelProps {
  booking: UserBooking;
  onClose: () => void;
}

export function ReschedulePanel({ booking, onClose }: ReschedulePanelProps) {
  const {
    flights,
    availableSeats,
    selectedFlight,
    selectedSeat,
    selectedFlightId,
    setSelectedFlightId,
    selectedSeatId,
    setSelectedSeatId,
    loadingOptions,
    loadingSeats,
    isPending,
    error,
    farePreview,
    confirmOpen,
    setConfirmOpen,
    confirmReschedule,
    realtimeStatus,
  } = useRescheduleBooking({
    booking,
    enabled: true,
    onSuccess: onClose,
  });

  return (
    <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-900 dark:bg-sky-950/30 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Reschedule flight
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Same route · alternative departures with available seats
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-white/80 dark:hover:bg-slate-800"
          aria-label="Close reschedule panel"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {loadingOptions ? (
        <div className="mt-4 space-y-3">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
        </div>
      ) : null}

      {error && !loadingOptions ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {!loadingOptions && !error && flights.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          No alternative flights with open seats on this route.
        </p>
      ) : null}

      {!loadingOptions && flights.length > 0 ? (
        <div className="mt-4 max-h-[min(60vh,28rem)] space-y-3 overflow-y-auto pr-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Alternative flights
          </p>
          {flights.map((flight) => (
            <AlternativeFlightCard
              key={flight.id}
              flight={flight}
              selected={selectedFlightId === flight.id}
              onSelect={() => setSelectedFlightId(flight.id)}
            />
          ))}
        </div>
      ) : null}

      {selectedFlightId ? (
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Choose a seat
            </p>
            {realtimeStatus === "subscribed" ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                Live seat updates
              </span>
            ) : null}
          </div>
          {loadingSeats ? (
            <div className="mt-3">
              <LoadingSpinner label="Loading seats…" />
            </div>
          ) : availableSeats.length === 0 ? (
            <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
              No seats available on this flight.
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {availableSeats.map((seat) => (
                <button
                  key={seat.id}
                  type="button"
                  onClick={() => setSelectedSeatId(seat.id)}
                  className={cn(
                    "min-h-11 rounded-lg border px-3 py-2.5 text-sm font-medium transition touch-manipulation",
                    selectedSeatId === seat.id
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-slate-200 bg-white text-slate-800 hover:border-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  )}
                >
                  {seat.seat_number}
                  <span className="mt-0.5 block text-xs opacity-80">
                    {formatCabinClass(seat.class)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {farePreview && selectedFlight && selectedSeat ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Estimated new total{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatPrice(farePreview.newTotal)}
            </span>{" "}
            ({formatPriceDifference(farePreview.difference)} vs current)
          </p>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={isPending}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Review & confirm reschedule
          </button>
        </div>
      ) : null}

      <RescheduleConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        pnrCode={booking.pnr_code}
        flightNo={selectedFlight?.flight_no ?? ""}
        seatNumber={selectedSeat?.seat_number ?? ""}
        newTotal={farePreview?.newTotal ?? 0}
        fareDifference={farePreview?.difference ?? 0}
        isPending={isPending}
        onConfirm={confirmReschedule}
      />
    </div>
  );
}
