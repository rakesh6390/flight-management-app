import { addHours, isAfter, parseISO } from "date-fns";

import { BOOKING_CHANGE_MIN_HOURS_BEFORE_DEPARTURE } from "@/lib/bookings/constants";
import type { BookingStatus, Tables } from "@/types/database";

type BookingFlight = Pick<Tables<"flights">, "departs_at" | "status"> | null;

export function hoursUntilDeparture(departsAt: string): number {
  const departure = parseISO(departsAt);
  return (departure.getTime() - Date.now()) / (60 * 60 * 1000);
}

export function isBeforeChangeCutoff(departsAt: string): boolean {
  const cutoff = addHours(
    new Date(),
    BOOKING_CHANGE_MIN_HOURS_BEFORE_DEPARTURE
  );
  return isAfter(parseISO(departsAt), cutoff);
}

export function canCancelBooking(
  status: BookingStatus,
  flight: BookingFlight
): boolean {
  if (status !== "confirmed" && status !== "pending") {
    return false;
  }
  if (!flight) {
    return false;
  }
  return isBeforeChangeCutoff(flight.departs_at);
}

export function canRescheduleBooking(
  status: BookingStatus,
  flight: BookingFlight
): boolean {
  if (status !== "confirmed") {
    return false;
  }
  if (!flight) {
    return false;
  }
  if (flight.status === "cancelled" || flight.status === "departed") {
    return false;
  }
  return isBeforeChangeCutoff(flight.departs_at);
}
