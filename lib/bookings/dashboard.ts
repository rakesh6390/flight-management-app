import { parseISO } from "date-fns";

import { canCancelBooking, canRescheduleBooking } from "@/lib/bookings/policy";
import type { UserBooking } from "@/lib/bookings/queries";

export interface DashboardSummary {
  totalBookings: number;
  upcomingCount: number;
  confirmedCount: number;
  cancelledCount: number;
  actionableCount: number;
  nextBooking: UserBooking | null;
  upcomingBookings: UserBooking[];
}

export function isUpcomingBooking(booking: UserBooking): boolean {
  if (booking.status === "cancelled") {
    return false;
  }

  const departsAt = booking.flights?.departs_at;
  if (!departsAt) {
    return booking.status === "confirmed" || booking.status === "pending";
  }

  return parseISO(departsAt).getTime() > Date.now();
}

export function summarizeBookings(bookings: UserBooking[]): DashboardSummary {
  const upcoming = bookings
    .filter(isUpcomingBooking)
    .sort((a, b) => {
      const aTime = a.flights?.departs_at
        ? parseISO(a.flights.departs_at).getTime()
        : Number.MAX_SAFE_INTEGER;
      const bTime = b.flights?.departs_at
        ? parseISO(b.flights.departs_at).getTime()
        : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

  const actionableCount = upcoming.filter(
    (booking) =>
      canCancelBooking(booking.status, booking.flights) ||
      canRescheduleBooking(booking.status, booking.flights)
  ).length;

  return {
    totalBookings: bookings.length,
    upcomingCount: upcoming.length,
    confirmedCount: bookings.filter((b) => b.status === "confirmed").length,
    cancelledCount: bookings.filter((b) => b.status === "cancelled").length,
    actionableCount,
    nextBooking: upcoming[0] ?? null,
    upcomingBookings: upcoming.slice(0, 4),
  };
}
