"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  FlightStore,
  FlightStoreState,
  PassengerFormData,
  PersistedFlightState,
  SearchQuery,
  SeatSnapshot,
} from "@/types/flight-store";
import {
  createEmptyPassenger,
  createPassengerForms,
  DEFAULT_SEARCH_QUERY,
  mergePersistedPassengers,
  stripPassportFromPassengers,
} from "@/types/flight-store";

const STORAGE_KEY = "flight-management-store";
const STORAGE_VERSION = 1;

const initialBookingState: Pick<
  FlightStoreState,
  "selectedFlight" | "selectedSeat" | "bookingStep" | "passengerFormData"
> = {
  selectedFlight: null,
  selectedSeat: null,
  bookingStep: "search",
  passengerFormData: createPassengerForms(DEFAULT_SEARCH_QUERY.passengerCount),
};

function syncPassengersToCount(
  passengers: PassengerFormData[],
  count: number
): PassengerFormData[] {
  const target = Math.max(1, count);

  if (passengers.length === target) {
    return passengers;
  }

  if (passengers.length < target) {
    return [
      ...passengers,
      ...Array.from({ length: target - passengers.length }, () =>
        createEmptyPassenger()
      ),
    ];
  }

  return passengers.slice(0, target);
}

function partializeState(state: FlightStoreState): PersistedFlightState {
  return {
    searchQuery: state.searchQuery,
    selectedFlight: state.selectedFlight,
    selectedSeat: state.selectedSeat,
    bookingStep: state.bookingStep,
    passengerFormData: stripPassportFromPassengers(state.passengerFormData),
  };
}

export const useFlightStore = create<FlightStore>()(
  persist(
    (set, get) => ({
      searchQuery: { ...DEFAULT_SEARCH_QUERY },
      ...initialBookingState,

      setSearchQuery: (query: Partial<SearchQuery>) => {
        set((state) => {
          const searchQuery: SearchQuery = {
            ...state.searchQuery,
            ...query,
          };

          return {
            searchQuery,
            passengerFormData: syncPassengersToCount(
              state.passengerFormData,
              searchQuery.passengerCount
            ),
          };
        });
      },

      setSelectedFlight: (flight) => {
        set({
          selectedFlight: flight,
          selectedSeat: null,
          bookingStep: flight ? "select-seat" : "select-flight",
        });
      },

      setSelectedSeat: (seat) => {
        if (!seat) {
          set({ selectedSeat: null });
          return;
        }

        set({
          selectedSeat: {
            seat,
            status: "confirmed",
            selectedAt: new Date().toISOString(),
            errorMessage: null,
          },
          bookingStep: "passenger-details",
        });
      },

      selectSeatOptimistic: (seat: SeatSnapshot) => {
        set({
          selectedSeat: {
            seat,
            status: "optimistic",
            selectedAt: new Date().toISOString(),
            errorMessage: null,
          },
          bookingStep: "select-seat",
        });
      },

      confirmSeatSelection: () => {
        const { selectedSeat } = get();
        if (!selectedSeat) {
          return;
        }

        set({
          selectedSeat: {
            ...selectedSeat,
            status: "confirmed",
            errorMessage: null,
          },
          bookingStep: "passenger-details",
        });
      },

      failSeatSelection: (errorMessage: string) => {
        const { selectedSeat } = get();
        if (!selectedSeat) {
          return;
        }

        set({
          selectedSeat: {
            ...selectedSeat,
            status: "failed",
            errorMessage,
          },
        });
      },

      clearSeatSelection: () => {
        set({
          selectedSeat: null,
          bookingStep: get().selectedFlight ? "select-seat" : "select-flight",
        });
      },

      setBookingStep: (bookingStep) => set({ bookingStep }),

      setPassengerFormData: (passengerFormData) => {
        const count = get().searchQuery.passengerCount;
        set({
          passengerFormData: syncPassengersToCount(
            passengerFormData,
            count
          ),
        });
      },

      updatePassengerAtIndex: (index, data) => {
        set((state) => {
          if (index < 0 || index >= state.passengerFormData.length) {
            return state;
          }

          const passengerFormData = state.passengerFormData.map(
            (passenger, i) =>
              i === index ? { ...passenger, ...data } : passenger
          );

          return { passengerFormData };
        });
      },

      resetBooking: () => {
        const { searchQuery, passengerFormData } = get();
        set({
          selectedFlight: null,
          selectedSeat: null,
          bookingStep: "search",
          passengerFormData: syncPassengersToCount(
            passengerFormData.map(() => createEmptyPassenger()),
            searchQuery.passengerCount
          ),
        });
      },

      resetStore: () => {
        set({
          searchQuery: { ...DEFAULT_SEARCH_QUERY },
          ...initialBookingState,
          passengerFormData: createPassengerForms(
            DEFAULT_SEARCH_QUERY.passengerCount
          ),
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => partializeState(state),
      merge: (persisted, current) => {
        const persistedState = persisted as PersistedFlightState | undefined;

        if (!persistedState) {
          return current;
        }

        const passengerFormData = mergePersistedPassengers(
          persistedState.passengerFormData ?? [],
          current.passengerFormData
        );

        return {
          ...current,
          ...persistedState,
          passengerFormData: syncPassengersToCount(
            passengerFormData,
            persistedState.searchQuery?.passengerCount ??
              current.searchQuery.passengerCount
          ),
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("[useFlightStore] rehydration failed", error);
          return;
        }

        if (state?.selectedSeat?.status === "optimistic") {
          queueMicrotask(() => {
            useFlightStore.getState().clearSeatSelection();
          });
        }
      },
    }
  )
);

// --- Selectors (avoid re-renders from unrelated state) ---

export const selectSearchQuery = (state: FlightStore) => state.searchQuery;
export const selectSelectedFlight = (state: FlightStore) => state.selectedFlight;
export const selectSelectedSeat = (state: FlightStore) => state.selectedSeat;
export const selectBookingStep = (state: FlightStore) => state.bookingStep;
export const selectPassengerFormData = (state: FlightStore) =>
  state.passengerFormData;
export const selectIsSeatOptimistic = (state: FlightStore) =>
  state.selectedSeat?.status === "optimistic";
export const selectIsSeatConfirmed = (state: FlightStore) =>
  state.selectedSeat?.status === "confirmed";
export const selectEstimatedFare = (state: FlightStore) => {
  const flight = state.selectedFlight;
  const seat = state.selectedSeat?.seat;
  if (!flight || !seat) {
    return null;
  }
  return flight.base_price + seat.extra_fee;
};
