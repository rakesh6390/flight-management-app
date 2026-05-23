"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  getRescheduleOptions,
  getRescheduleSeats,
  rescheduleBooking,
} from "@/actions/rescheduleBooking";
import { RESCHEDULE_FEE_USD } from "@/lib/bookings/constants";
import { estimateRescheduleTotal } from "@/lib/bookings/reschedule";
import { useSeatRealtime } from "@/hooks/useSeatRealtime";
import type { UserBooking } from "@/lib/bookings/queries";
import type { RescheduleFlightOption } from "@/types/flights";
import type { Tables } from "@/types/database";

interface UseRescheduleBookingOptions {
  booking: UserBooking;
  enabled?: boolean;
  onSuccess?: () => void;
}

export function useRescheduleBooking({
  booking,
  enabled = true,
  onSuccess,
}: UseRescheduleBookingOptions) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [flights, setFlights] = useState<RescheduleFlightOption[]>([]);
  const [baseSeats, setBaseSeats] = useState<Tables<"seats">[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedFlight = flights.find((flight) => flight.id === selectedFlightId);

  const { seats: realtimeSeats, status: realtimeStatus } = useSeatRealtime({
    flightId: selectedFlightId,
    initialSeats: baseSeats,
    enabled: enabled && Boolean(selectedFlightId) && baseSeats.length > 0,
  });

  const availableSeats = useMemo(
    () => realtimeSeats.filter((seat) => seat.is_available),
    [realtimeSeats]
  );

  const selectedSeat = availableSeats.find((seat) => seat.id === selectedSeatId);

  const farePreview = useMemo(() => {
    if (!selectedFlight || !selectedSeat) {
      return null;
    }

    const newTotal = estimateRescheduleTotal(
      selectedFlight.base_price,
      selectedSeat.extra_fee
    );

    return {
      newTotal,
      difference: newTotal - booking.total_price,
      fee: RESCHEDULE_FEE_USD,
    };
  }, [booking.total_price, selectedFlight, selectedSeat]);

  const loadOptions = useCallback(async () => {
    setLoadingOptions(true);
    setError(null);

    const result = await getRescheduleOptions(booking.id);

    if (!result.success) {
      setError(result.error);
      setFlights([]);
    } else {
      setFlights(result.flights);
    }

    setLoadingOptions(false);
  }, [booking.id]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void loadOptions();
  }, [enabled, loadOptions]);

  useEffect(() => {
    if (!selectedFlightId) {
      setBaseSeats([]);
      setSelectedSeatId(null);
      return;
    }

    let active = true;

    async function loadSeats(resolvedFlightId: string) {
      setLoadingSeats(true);
      setSelectedSeatId(null);

      const result = await getRescheduleSeats(resolvedFlightId);

      if (!active) {
        return;
      }

      if (!result.success) {
        setError(result.error);
        setBaseSeats([]);
        toast.error(result.error);
      } else {
        setBaseSeats(result.seats);
        setError(null);
      }

      setLoadingSeats(false);
    }

    void loadSeats(selectedFlightId);

    return () => {
      active = false;
    };
  }, [selectedFlightId]);

  useEffect(() => {
    if (!selectedSeatId) {
      return;
    }

    const stillAvailable = availableSeats.some((seat) => seat.id === selectedSeatId);

    if (!stillAvailable) {
      setSelectedSeatId(null);
      toast.warning("Selected seat is no longer available. Pick another seat.");
    }
  }, [availableSeats, selectedSeatId]);

  const confirmReschedule = useCallback(() => {
    if (!selectedFlightId || !selectedSeatId) {
      toast.error("Select a flight and seat to continue.");
      return;
    }

    startTransition(async () => {
      const result = await rescheduleBooking({
        bookingId: booking.id,
        newFlightId: selectedFlightId,
        newSeatId: selectedSeatId,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const diffLabel =
        result.fareDifference >= 0
          ? `Additional ${Math.abs(result.fareDifference).toFixed(0)} USD`
          : `Credit ${Math.abs(result.fareDifference).toFixed(0)} USD`;

      toast.success(
        `Rescheduled to PNR ${result.pnrCode}. ${diffLabel}.`
      );
      setConfirmOpen(false);
      setSelectedFlightId(null);
      setSelectedSeatId(null);
      onSuccess?.();
      router.refresh();
    });
  }, [
    booking.id,
    onSuccess,
    router,
    selectedFlightId,
    selectedSeatId,
  ]);

  return {
    flights,
    availableSeats,
    selectedFlight,
    selectedSeat,
    selectedFlightId,
    setSelectedFlightId,
    selectedSeatId,
    setSelectedSeatId,
    loadingOptions,
    loadingSeats,
    isPending,
    error,
    farePreview,
    confirmOpen,
    setConfirmOpen,
    confirmReschedule,
    reloadOptions: loadOptions,
    realtimeStatus,
  };
}
