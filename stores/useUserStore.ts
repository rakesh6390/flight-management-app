"use client";

import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  CachedBooking,
  PersistedUserState,
  UserStore,
  UserStoreState,
} from "@/types/user-store";
import {
  DEFAULT_USER_STATE,
  extractSessionToken,
  partializeUserState,
} from "@/types/user-store";

const STORAGE_KEY = "flight-management-user-store";
const STORAGE_VERSION = 1;

function applySession(
  session: Session | null
): Pick<UserStoreState, "session" | "sessionToken" | "user"> {
  return {
    session,
    sessionToken: extractSessionToken(session),
    user: session?.user ?? null,
  };
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_USER_STATE,

      setSession: (session: Session | null) => {
        set(applySession(session));
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      setBookings: (bookings: CachedBooking[]) => {
        set({ bookings });
      },

      upsertBooking: (booking: CachedBooking) => {
        set((state) => {
          const index = state.bookings.findIndex((b) => b.id === booking.id);
          if (index === -1) {
            return { bookings: [...state.bookings, booking] };
          }
          const bookings = [...state.bookings];
          bookings[index] = booking;
          return { bookings };
        });
      },

      removeBooking: (bookingId: string) => {
        set((state) => ({
          bookings: state.bookings.filter((b) => b.id !== bookingId),
        }));
      },

      clearUser: () => {
        set({
          session: null,
          sessionToken: null,
          user: null,
          bookings: [],
        });
      },

      resetStore: () => {
        set({
          ...DEFAULT_USER_STATE,
          hasHydrated: get().hasHydrated,
        });
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ hasHydrated });
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => partializeUserState(state),
      merge: (persisted, current) => {
        const persistedState = persisted as PersistedUserState | undefined;

        return {
          ...current,
          sessionToken: persistedState?.sessionToken ?? null,
          session: null,
          user: null,
          bookings: [],
        };
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error("[useUserStore] rehydration failed", error);
        }
        queueMicrotask(() => {
          useUserStore.getState().setHasHydrated(true);
        });
      },
    }
  )
);

// --- Selectors ---

export const selectSession = (state: UserStore) => state.session;
export const selectSessionToken = (state: UserStore) => state.sessionToken;
export const selectUser = (state: UserStore) => state.user;
export const selectBookings = (state: UserStore) => state.bookings;
export const selectHasHydrated = (state: UserStore) => state.hasHydrated;
export const selectIsAuthenticated = (state: UserStore) => !!state.user;
export const selectBookingById = (id: string) => (state: UserStore) =>
  state.bookings.find((b) => b.id === id);

/**
 * Sync store with Supabase `onAuthStateChange` / `getSession`.
 * Call from a client AuthProvider or layout listener.
 */
export function syncUserStoreFromSupabase(session: Session | null): void {
  useUserStore.getState().setSession(session);
}

export function clearUserStoreOnSignOut(): void {
  useUserStore.getState().clearUser();
}
