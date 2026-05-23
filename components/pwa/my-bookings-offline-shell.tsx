"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { BookingsList } from "@/components/booking/bookings-list";
import { EmptyState } from "@/components/flights/empty-state";
import { useOnlineStatus } from "@/hooks/use-online-status";
import {
  loadBookingsCache,
  saveBookingsCache,
  type BookingsCachePayload,
} from "@/lib/pwa/bookings-cache";
import type { UserBooking } from "@/lib/bookings/queries";
import { formatFlightDateTime } from "@/lib/flights/format";

interface MyBookingsOfflineShellProps {
  initialBookings: UserBooking[];
  fetchError: string | null;
}

export function MyBookingsOfflineShell({
  initialBookings,
  fetchError,
}: MyBookingsOfflineShellProps) {
  const online = useOnlineStatus();
  const [cacheMeta, setCacheMeta] = useState<BookingsCachePayload | null>(null);

  useEffect(() => {
    if (initialBookings.length > 0 && !fetchError) {
      saveBookingsCache(initialBookings);
    }
    setCacheMeta(loadBookingsCache());
  }, [fetchError, initialBookings]);

  const displayBookings = useMemo(() => {
    if (online) {
      return initialBookings;
    }

    if (initialBookings.length > 0) {
      return initialBookings;
    }

    return cacheMeta?.bookings ?? [];
  }, [cacheMeta?.bookings, initialBookings, online]);

  useEffect(() => {
    if (!online && displayBookings.length > 0) {
      toast.info("You are offline", {
        description: "Showing your last saved bookings.",
        id: "offline-bookings",
      });
    }
  }, [online, displayBookings.length]);

  const usingCache = !online && initialBookings.length === 0 && displayBookings.length > 0;
  const savedAt = cacheMeta?.savedAt;

  return (
    <>
      {!online ? (
        <div
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
          role="status"
        >
          <p className="font-semibold">Offline mode</p>
          <p className="mt-1 text-amber-800 dark:text-amber-300/90">
            {usingCache
              ? savedAt
                ? `Showing bookings saved ${formatFlightDateTime(savedAt)}. Reschedule and cancel require a connection.`
                : "Showing your last saved bookings. Some actions need a connection."
              : "You are offline. Connect to refresh or manage bookings."}
          </p>
        </div>
      ) : null}

      {fetchError && online ? (
        <div className="mt-8">
          <EmptyState
            title="Unable to load bookings"
            description={fetchError}
            icon="search"
            action={
              <Link
                href="/my-bookings"
                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
              >
                Try again
              </Link>
            }
          />
        </div>
      ) : displayBookings.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={online ? "No bookings yet" : "No cached bookings"}
            description={
              online
                ? "Search for flights and complete a booking to see it here."
                : "Open My bookings once while online to save them for offline viewing."
            }
            icon="flight"
            action={
              online ? (
                <Link
                  href="/flights"
                  className="inline-flex min-h-10 items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  Find flights
                </Link>
              ) : (
                <Link
                  href="/offline"
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Offline help
                </Link>
              )
            }
          />
        </div>
      ) : (
        <div className={online && fetchError ? "" : "mt-8"}>
          <BookingsList bookings={displayBookings} />
        </div>
      )}
    </>
  );
}
