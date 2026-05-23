import { differenceInMinutes, format, parseISO } from "date-fns";

import { formatDepartureDateForDisplay } from "@/lib/flights/dates";
import type { CabinClass } from "@/types/database";

/** Display-only: DD-MM-YYYY from internal YYYY-MM-DD search date */
export function formatSearchDepartureDate(isoDateKey: string): string {
  return formatDepartureDateForDisplay(isoDateKey);
}

export function formatAirportCode(code: string): string {
  return code.toUpperCase();
}

export function formatFlightDateTime(iso: string): string {
  return format(parseISO(iso), "MMM d, yyyy · h:mm a");
}

export function formatFlightTime(iso: string): string {
  return format(parseISO(iso), "h:mm a");
}

export function formatFlightDuration(departsAt: string, arrivesAt: string): string {
  const minutes = differenceInMinutes(parseISO(arrivesAt), parseISO(departsAt));
  if (minutes < 0) {
    return "—";
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCabinClass(cabin: CabinClass): string {
  const labels: Record<CabinClass, string> = {
    economy: "Economy",
    business: "Business",
    first: "First",
  };
  return labels[cabin];
}

export function formatFlightStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}

export function formatPriceDifference(amount: number): string {
  const formatted = formatPrice(Math.abs(amount));
  if (amount > 0) {
    return `+${formatted}`;
  }
  if (amount < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

export function formatBookingStatus(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
  };
  return labels[status] ?? formatFlightStatus(status);
}
