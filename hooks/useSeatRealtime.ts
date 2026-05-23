"use client";

import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import {
  selectSelectedSeat,
  useFlightStore,
} from "@/stores/useFlightStore";
import type { Database, Tables } from "@/types/database";

type SeatRow = Tables<"seats">;
type SeatPayload = RealtimePostgresChangesPayload<SeatRow>;
type RealtimeStatus = "idle" | "subscribing" | "subscribed" | "error";

interface UseSeatRealtimeOptions {
  flightId: string | null;
  initialSeats: SeatRow[];
  enabled?: boolean;
}

interface UseSeatRealtimeResult {
  seats: SeatRow[];
  status: RealtimeStatus;
  error: string | null;
}

const activeChannels = new Set<string>();

function sortSeats(seats: SeatRow[]): SeatRow[] {
  return [...seats].sort((a, b) =>
    a.seat_number.localeCompare(b.seat_number, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );
}

function applySeatPayload(seats: SeatRow[], payload: SeatPayload): SeatRow[] {
  const eventType = payload.eventType;

  if (eventType === "INSERT") {
    const next = payload.new as SeatRow;
    if (seats.some((seat) => seat.id === next.id)) {
      return sortSeats(
        seats.map((seat) => (seat.id === next.id ? next : seat))
      );
    }
    return sortSeats([...seats, next]);
  }

  if (eventType === "UPDATE") {
    const next = payload.new as SeatRow;
    return sortSeats(seats.map((seat) => (seat.id === next.id ? next : seat)));
  }

  if (eventType === "DELETE") {
    const previous = payload.old as Partial<SeatRow>;
    return seats.filter((seat) => seat.id !== previous.id);
  }

  return seats;
}

export function useSeatRealtime({
  flightId,
  initialSeats,
  enabled = true,
}: UseSeatRealtimeOptions): UseSeatRealtimeResult {
  const [seats, setSeats] = useState(() => sortSeats(initialSeats));
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const selectedSeat = useFlightStore(selectSelectedSeat);
  const confirmSeatSelection = useFlightStore((state) => state.confirmSeatSelection);
  const failSeatSelection = useFlightStore((state) => state.failSeatSelection);
  const clearSeatSelection = useFlightStore((state) => state.clearSeatSelection);
  const latestSelectedSeatRef = useRef(selectedSeat);

  const channelName = useMemo(
    () => (flightId ? `seat-map:${flightId}` : null),
    [flightId]
  );

  useEffect(() => {
    latestSelectedSeatRef.current = selectedSeat;
  }, [selectedSeat]);

  useEffect(() => {
    if (!enabled || !flightId || !channelName) {
      return;
    }

    if (activeChannels.has(channelName)) {
      console.warn(`[useSeatRealtime] duplicate subscription skipped: ${channelName}`);
      return;
    }

    let cancelled = false;
    let supabase: ReturnType<typeof createClient>;

    try {
      supabase = createClient();
    } catch (clientError) {
      const message =
        clientError instanceof Error
          ? clientError.message
          : "Unable to create Supabase client";
      console.warn("[useSeatRealtime] Supabase client unavailable", clientError);
      queueMicrotask(() => {
        setStatus("error");
        setError(message);
      });
      return;
    }

    activeChannels.add(channelName);
    queueMicrotask(() => {
      if (!cancelled) {
        setStatus("subscribing");
        setError(null);
      }
    });

    const channel = supabase
      .channel(channelName)
      .on<Database["public"]["Tables"]["seats"]["Row"]>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "seats",
          filter: `flight_id=eq.${flightId}`,
        },
        (payload) => {
          if (cancelled) {
            return;
          }

          setSeats((currentSeats) => applySeatPayload(currentSeats, payload));

          const currentSelection = latestSelectedSeatRef.current;
          const payloadSeat =
            payload.eventType === "DELETE"
              ? (payload.old as Partial<SeatRow>)
              : (payload.new as SeatRow);

          if (!currentSelection?.seat || payloadSeat.id !== currentSelection.seat.id) {
            return;
          }

          if (payload.eventType === "DELETE") {
            toast.warning("Seat update", {
              description: "Your selected seat was removed from the map.",
            });
            clearSeatSelection();
            return;
          }

          const updatedSeat = payload.new as SeatRow;

          if (currentSelection.status === "optimistic" && !updatedSeat.is_available) {
            confirmSeatSelection();
            toast.success("Seat reserved", {
              description: `${updatedSeat.seat_number} is held for your booking.`,
            });
            return;
          }

          if (!updatedSeat.is_available) {
            toast.warning("Seat no longer available", {
              description: `${updatedSeat.seat_number} was just taken. Pick another seat.`,
            });
            clearSeatSelection();
            return;
          }

          if (updatedSeat.is_available && currentSelection.status === "optimistic") {
            failSeatSelection("Seat reservation was not confirmed yet.");
            toast.error("Seat conflict", {
              description: "Please select your seat again.",
            });
          }
        }
      )
      .subscribe((nextStatus, nextError) => {
        if (cancelled) {
          return;
        }

        if (nextStatus === "SUBSCRIBED") {
          setStatus("subscribed");
          return;
        }

        if (nextStatus === "CHANNEL_ERROR" || nextStatus === "TIMED_OUT") {
          const message =
            nextError?.message ?? `Seat realtime subscription ${nextStatus.toLowerCase()}`;
          console.error("[useSeatRealtime] subscription failed", {
            channelName,
            status: nextStatus,
            error: nextError,
          });
          setStatus("error");
          setError(message);
        }
      });

    return () => {
      cancelled = true;
      activeChannels.delete(channelName);
      supabase.removeChannel(channel).catch((removeError) => {
        console.error("[useSeatRealtime] unsubscribe failed", removeError);
      });
    };
  }, [
    channelName,
    clearSeatSelection,
    confirmSeatSelection,
    enabled,
    failSeatSelection,
    flightId,
  ]);

  return { seats, status, error };
}
