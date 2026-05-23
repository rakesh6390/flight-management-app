import type { UserBooking } from "@/lib/bookings/queries";

const CACHE_KEY = "flight-app:bookings-cache-v1";

export interface BookingsCachePayload {
  savedAt: string;
  bookings: UserBooking[];
}

export function saveBookingsCache(bookings: UserBooking[]): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: BookingsCachePayload = {
    savedAt: new Date().toISOString(),
    bookings,
  };

  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Storage full or private mode
  }
}

export function loadBookingsCache(): BookingsCachePayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as BookingsCachePayload;
  } catch {
    return null;
  }
}

export function clearBookingsCache(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CACHE_KEY);
}
