import type { Session, User } from "@supabase/supabase-js";

import type { Tables } from "@/types/database";

/** Booking row cached in client state (extendable with relations) */
export type CachedBooking = Tables<"bookings"> & {
  flight?: Tables<"flights">;
  seat?: Tables<"seats">;
  passengers?: Tables<"passengers">[];
};

/**
 * Minimal persisted auth payload — only the session access token is stored
 * in localStorage. Full `Session` / `User` live in memory and sync via Supabase.
 */
export interface PersistedUserState {
  sessionToken: string | null;
}

export interface UserStoreState {
  /** Full Supabase session (memory only — not persisted) */
  session: Session | null;
  /** Mirror of `session.access_token` — sole persisted auth field */
  sessionToken: string | null;
  /** Authenticated Supabase user (memory only) */
  user: User | null;
  /** Client-side booking cache (memory only) */
  bookings: CachedBooking[];
  /** True after Zustand persist has rehydrated from localStorage */
  hasHydrated: boolean;
}

export interface UserStoreActions {
  /** Set Supabase session; updates `user` from `session.user` when present */
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setBookings: (bookings: CachedBooking[]) => void;
  upsertBooking: (booking: CachedBooking) => void;
  removeBooking: (bookingId: string) => void;
  clearUser: () => void;
  resetStore: () => void;
  setHasHydrated: (value: boolean) => void;
}

export type UserStore = UserStoreState & UserStoreActions;

export const DEFAULT_USER_STATE: UserStoreState = {
  session: null,
  sessionToken: null,
  user: null,
  bookings: [],
  hasHydrated: false,
};

export function extractSessionToken(session: Session | null): string | null {
  return session?.access_token ?? null;
}

export function partializeUserState(
  state: UserStoreState
): PersistedUserState {
  return {
    sessionToken: state.sessionToken,
  };
}

export function isSessionExpired(session: Session | null): boolean {
  if (!session?.expires_at) {
    return false;
  }
  const expiresAtMs = session.expires_at * 1000;
  return Date.now() >= expiresAtMs;
}
