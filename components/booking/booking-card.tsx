"use client";

import {
  ArrowRight,
  Calendar,
  Clock,
  ExternalLink,
  Plane,
  Ticket,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CancelBookingDialog } from "@/components/booking/booking-action-dialogs";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { ReschedulePanel } from "@/components/booking/reschedule-panel";
import { useCancelBooking } from "@/hooks/useCancelBooking";
import {
  canCancelBooking,
  canRescheduleBooking,
} from "@/lib/bookings/policy";
import type { UserBooking } from "@/lib/bookings/queries";
import {
  formatCabinClass,
  formatFlightDateTime,
  formatFlightDuration,
  formatFlightTime,
  formatPrice,
} from "@/lib/flights/format";
import { cn } from "@/lib/utils";

interface BookingCardProps {
  booking: UserBooking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const [showReschedule, setShowReschedule] = useState(false);

  const flight = booking.flights;
  const seat = booking.seats;
  const allowCancel = canCancelBooking(booking.status, flight);
  const allowReschedule = canRescheduleBooking(booking.status, flight);
  const isActive =
    booking.status === "confirmed" || booking.status === "pending";

  const {
    dialogOpen: cancelDialogOpen,
    setDialogOpen: setCancelDialogOpen,
    isPending: isCancelling,
    confirmCancel,
  } = useCancelBooking({
    bookingId: booking.id,
    pnrCode: booking.pnr_code,
    onSuccess: () => setShowReschedule(false),
  });

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <BookingStatusBadge status={booking.status} />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              PNR {booking.pnr_code}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Booked {formatFlightDateTime(booking.booked_at)}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {formatPrice(booking.total_price)}
          </p>
        </div>
      </div>

      {flight ? (
        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <Plane className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
            Flight {flight.flight_no}
            {flight.aircraft_type ? (
              <span className="font-normal text-slate-500">· {flight.aircraft_type}</span>
            ) : null}
          </div>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
                {formatFlightTime(flight.departs_at)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {flight.origin}
              </p>
            </div>
            <div className="flex flex-row items-center gap-2 text-slate-400 sm:flex-col">
              <ArrowRight className="h-4 w-4 sm:rotate-0" aria-hidden />
              <span className="inline-flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" aria-hidden />
                {formatFlightDuration(flight.departs_at, flight.arrives_at)}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
                {formatFlightTime(flight.arrives_at)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {flight.destination}
              </p>
            </div>
          </div>
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Departs {formatFlightDateTime(flight.departs_at)}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
          Flight details unavailable.
        </p>
      )}

      {seat ? (
        <div className="mt-4 flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
          <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
          <span>
            Seat <span className="font-semibold">{seat.seat_number}</span> ·{" "}
            {formatCabinClass(seat.class)}
            {seat.extra_fee > 0 ? ` · +${formatPrice(seat.extra_fee)} seat fee` : null}
          </span>
        </div>
      ) : null}

      {booking.passengers.length > 0 ? (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <Users className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
            Passengers ({booking.passengers.length})
          </div>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {booking.passengers.map((passenger) => (
              <li
                key={passenger.id}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <p className="font-medium text-slate-900 dark:text-white">
                  {passenger.full_name}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {passenger.passport_no} · {passenger.nationality}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {booking.reschedules.length > 0 ? (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Rescheduled {booking.reschedules.length} time
          {booking.reschedules.length === 1 ? "" : "s"}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap dark:border-slate-800">
        {isActive ? (
          <Link
            href={`/booking-confirmation?pnr=${encodeURIComponent(booking.pnr_code)}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            View ticket
          </Link>
        ) : null}

        {allowReschedule ? (
          <button
            type="button"
            onClick={() => setShowReschedule((open) => !open)}
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold touch-manipulation",
              showReschedule
                ? "border border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200"
                : "border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            )}
          >
            {showReschedule ? "Hide reschedule" : "Reschedule"}
          </button>
        ) : null}

        {allowCancel ? (
          <button
            type="button"
            onClick={() => setCancelDialogOpen(true)}
            disabled={isCancelling}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40 touch-manipulation"
          >
            {isCancelling ? "Cancelling…" : "Cancel booking"}
          </button>
        ) : null}
      </div>

      {!allowCancel && isActive && flight ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Changes are locked within 2 hours of departure.
        </p>
      ) : null}

      {showReschedule && allowReschedule ? (
        <ReschedulePanel booking={booking} onClose={() => setShowReschedule(false)} />
      ) : null}

      <CancelBookingDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        pnrCode={booking.pnr_code}
        isPending={isCancelling}
        onConfirm={confirmCancel}
      />
    </article>
  );
}
