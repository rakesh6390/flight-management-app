"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createBooking } from "@/actions/createBooking";
import type { PassengerInput } from "@/lib/validations/booking";
import {
  selectSelectedFlight,
  selectSelectedSeat,
  useFlightStore,
} from "@/stores/useFlightStore";

interface CreateBookingParams {
  flightId?: string;
  passengers: PassengerInput[];
}

export function useCreateBooking() {
  const router = useRouter();
  const selectedFlight = useFlightStore(selectSelectedFlight);
  const selectedSeat = useFlightStore(selectSelectedSeat);
  const confirmSeatSelection = useFlightStore((state) => state.confirmSeatSelection);
  const failSeatSelection = useFlightStore((state) => state.failSeatSelection);
  const setBookingStep = useFlightStore((state) => state.setBookingStep);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loading = isPending || isSubmitting;

  function submitBooking({ flightId, passengers }: CreateBookingParams) {
    const resolvedFlightId = flightId ?? selectedFlight?.id;
    const seatId = selectedSeat?.seat.id;

    if (!resolvedFlightId || !seatId) {
      toast.error("Select a flight and seat before booking.");
      return;
    }

    setIsSubmitting(true);
    setBookingStep("review");

    startTransition(async () => {
      try {
        const result = await createBooking({
          flightId: resolvedFlightId,
          seatId,
          passengers,
        });

        if (!result.success) {
          failSeatSelection(result.error);
          toast.error(result.error);
          return;
        }

        confirmSeatSelection();
        setBookingStep("confirmation");
        toast.success(`Booking confirmed. PNR ${result.pnrCode}`);
        router.push(
          `/booking-confirmation?pnr=${encodeURIComponent(result.pnrCode)}`
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to create booking. Please try again.";
        failSeatSelection(message);
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    });
  }

  return {
    createBooking: submitBooking,
    loading,
  };
}
