import type { CabinClass, FlightStatus, Tables } from "@/types/database";

export type FlightRow = Tables<"flights">;

export interface SeatClassAvailability {
  class: CabinClass;
  availableCount: number;
}

export interface FlightWithAvailability extends FlightRow {
  availableSeatClasses: CabinClass[];
  seatAvailability: SeatClassAvailability[];
  durationMinutes: number;
}

export interface FlightSearchFilters {
  origin: string;
  destination: string;
  departureDate: string;
}

export interface FetchFlightsResult {
  flights: FlightWithAvailability[];
  error: string | null;
}

export const BOOKABLE_FLIGHT_STATUSES: FlightStatus[] = ["scheduled", "delayed"];

/** Alternative flight for reschedule with fare comparison */
export interface RescheduleFlightOption extends FlightWithAvailability {
  /** Positive = pay more, negative = refund/credit on new total */
  priceDifference: number;
  estimatedNewTotal: number;
  currentBookingTotal: number;
  totalAvailableSeats: number;
}
