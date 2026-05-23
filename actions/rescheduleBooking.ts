"use server";

import { revalidatePath } from "next/cache";

import { mapRescheduleBookingError } from "@/lib/bookings/errors";
import { fetchRescheduleFlightOptions } from "@/lib/bookings/queries";
import { fetchSeatSelectionData } from "@/lib/seats/queries";
import { createClient } from "@/lib/supabase/server";
import { rescheduleBookingSchema } from "@/lib/validations/reschedule";
import type { RescheduleFlightOption } from "@/types/flights";
import type { Tables } from "@/types/database";

export type RescheduleBookingResult =
  | {
      success: true;
      booking: Tables<"bookings">;
      pnrCode: string;
      fareDifference: number;
    }
  | { success: false; error: string };

export type RescheduleOptionsResult =
  | { success: true; flights: RescheduleFlightOption[] }
  | { success: false; error: string };

export type RescheduleSeatsResult =
  | {
      success: true;
      seats: Tables<"seats">[];
      bookedSeatIds: string[];
    }
  | { success: false; error: string };

export async function getRescheduleOptions(
  bookingId: string
): Promise<RescheduleOptionsResult> {
  const parsed = rescheduleBookingSchema
    .pick({ bookingId: true })
    .safeParse({ bookingId });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid booking",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in to reschedule." };
  }

  const { flights, error } = await fetchRescheduleFlightOptions(
    parsed.data.bookingId
  );

  if (error) {
    return { success: false, error };
  }

  return { success: true, flights };
}

export async function getRescheduleSeats(
  flightId: string
): Promise<RescheduleSeatsResult> {
  if (!flightId) {
    return { success: false, error: "Invalid flight" };
  }

  const { seats, bookedSeatIds, error } = await fetchSeatSelectionData(flightId);

  if (error) {
    return { success: false, error };
  }

  return {
    success: true,
    seats: seats.filter(
      (seat) => seat.is_available && !bookedSeatIds.includes(seat.id)
    ),
    bookedSeatIds,
  };
}

export async function rescheduleBooking(
  input: unknown
): Promise<RescheduleBookingResult> {
  const parsed = rescheduleBookingSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid reschedule details",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in to reschedule." };
  }

  const { bookingId, newFlightId, newSeatId } = parsed.data;

  const { data, error } = await supabase.rpc("reschedule_booking", {
    p_booking_id: bookingId,
    p_new_flight_id: newFlightId,
    p_new_seat_id: newSeatId,
  });

  if (error || !data) {
    return {
      success: false,
      error: mapRescheduleBookingError(error?.message ?? "Reschedule failed"),
    };
  }

  const payload = data as {
    booking: Tables<"bookings">;
    fare_difference?: number;
  };
  const booking = payload.booking;

  revalidatePath("/my-bookings");
  revalidatePath("/booking-confirmation");
  revalidatePath("/seat-selection");

  return {
    success: true,
    booking,
    pnrCode: booking.pnr_code,
    fareDifference: Number(payload.fare_difference ?? 0),
  };
}
