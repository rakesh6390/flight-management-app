import type { CabinClass, Tables } from "@/types/database";

/** Flight row snapshot stored in client state */
export type FlightSnapshot = Tables<"flights">;

/** Seat row snapshot stored in client state */
export type SeatSnapshot = Tables<"seats">;

export interface SearchQuery {
  origin: string;
  destination: string;
  /** Always YYYY-MM-DD (ISO date key) — never DD-MM-YYYY */
  departureDate: string;
  passengerCount: number;
}

export interface PassengerFormData {
  full_name: string;
  passport_no: string;
  nationality: string;
  dob: string;
}

/** Persisted passenger fields — `passport_no` is excluded from localStorage */
export type PersistedPassengerFormData = Omit<PassengerFormData, "passport_no">;

export type BookingStep =
  | "search"
  | "select-flight"
  | "select-seat"
  | "passenger-details"
  | "review"
  | "confirmation";

export type SeatSelectionStatus = "idle" | "optimistic" | "confirmed" | "failed";

export interface SelectedSeatState {
  seat: SeatSnapshot;
  status: SeatSelectionStatus;
  /** Set when status becomes optimistic (client-side hold) */
  selectedAt: string | null;
  errorMessage: string | null;
}

export interface FlightStoreState {
  searchQuery: SearchQuery;
  selectedFlight: FlightSnapshot | null;
  selectedSeat: SelectedSeatState | null;
  bookingStep: BookingStep;
  passengerFormData: PassengerFormData[];
}

export interface FlightStoreActions {
  setSearchQuery: (query: Partial<SearchQuery>) => void;
  setSelectedFlight: (flight: FlightSnapshot | null) => void;
  setSelectedSeat: (seat: SeatSnapshot | null) => void;
  selectSeatOptimistic: (seat: SeatSnapshot) => void;
  confirmSeatSelection: () => void;
  failSeatSelection: (errorMessage: string) => void;
  clearSeatSelection: () => void;
  setBookingStep: (step: BookingStep) => void;
  setPassengerFormData: (data: PassengerFormData[]) => void;
  updatePassengerAtIndex: (
    index: number,
    data: Partial<PassengerFormData>
  ) => void;
  resetBooking: () => void;
  resetStore: () => void;
}

export type FlightStore = FlightStoreState & FlightStoreActions;

/** Subset written to localStorage via `partialize` */
export interface PersistedFlightState {
  searchQuery: SearchQuery;
  selectedFlight: FlightSnapshot | null;
  selectedSeat: SelectedSeatState | null;
  bookingStep: BookingStep;
  passengerFormData: PersistedPassengerFormData[];
}

export const BOOKING_STEPS: readonly BookingStep[] = [
  "search",
  "select-flight",
  "select-seat",
  "passenger-details",
  "review",
  "confirmation",
] as const;

export const DEFAULT_SEARCH_QUERY: SearchQuery = {
  origin: "",
  destination: "",
  departureDate: "",
  passengerCount: 1,
};

export function createEmptyPassenger(): PassengerFormData {
  return {
    full_name: "",
    passport_no: "",
    nationality: "",
    dob: "",
  };
}

export function createPassengerForms(count: number): PassengerFormData[] {
  return Array.from({ length: Math.max(1, count) }, () =>
    createEmptyPassenger()
  );
}

export function stripPassportFromPassengers(
  passengers: PassengerFormData[]
): PersistedPassengerFormData[] {
  return passengers.map(({ passport_no: _passport, ...rest }) => rest);
}

export function mergePersistedPassengers(
  persisted: PersistedPassengerFormData[],
  current: PassengerFormData[]
): PassengerFormData[] {
  return persisted.map((p, index) => ({
    ...createEmptyPassenger(),
    ...p,
    passport_no: current[index]?.passport_no ?? "",
  }));
}

export function isCabinClass(value: string): value is CabinClass {
  return value === "economy" || value === "business" || value === "first";
}
