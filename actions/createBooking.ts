"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  createBookingSchema,
  type CreateBookingInput,
} from "@/lib/validations/booking";
import type { ReserveSeatResult, Tables } from "@/types/database";

export type CreateBookingResult =
  | {
      success: true;
      booking: Tables<"bookings">;
      pnrCode: string;
    }
  | {
      success: false;
      error: string;
    };

function mapBookingError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("not_authenticated")) {
    return "Please sign in before booking a seat.";
  }
  if (
    normalized.includes("seat_not_available") ||
    normalized.includes("seat_already_reserved")
  ) {
    return "That seat was just taken. Choose another available seat.";
  }
  if (normalized.includes("flight_not_bookable")) {
    return "This flight is no longer available for booking.";
  }
  if (normalized.includes("seat_flight_mismatch")) {
    return "Selected seat does not belong to this flight.";
  }
  if (normalized.includes("duplicate key")) {
    return "One passenger passport appears more than once.";
  }

  return message || "Unable to create booking. Please try again.";
}

async function rollbackReservation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bookingId: string,
  seatId: string
) {
  const { error: cancelError } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (cancelError) {
    console.error("[createBooking] rollback booking cancellation failed", cancelError);
  }

  const { error: seatError } = await supabase
    .from("seats")
    .update({ is_available: true })
    .eq("id", seatId);

  if (seatError) {
    console.error("[createBooking] rollback seat release failed", seatError);
  }
}

export async function createBooking(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  const parsed = createBookingSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid booking details",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Please sign in before booking a seat.",
    };
  }

  const { flightId, seatId, passengers } = parsed.data;

  const { data: reserved, error: reserveError } = await supabase.rpc(
    "reserve_seat",
    {
      p_flight_id: flightId,
      p_seat_id: seatId,
    }
  );

  if (reserveError || !reserved) {
    return {
      success: false,
      error: mapBookingError(reserveError?.message ?? "Seat reservation failed"),
    };
  }

  const reservation = reserved as ReserveSeatResult;
  const booking = reservation.booking;

  const { error: passengerError } = await supabase.from("passengers").insert(
    passengers.map((passenger) => ({
      booking_id: booking.id,
      full_name: passenger.full_name,
      passport_no: passenger.passport_no,
      nationality: passenger.nationality,
      dob: passenger.dob,
    }))
  );

  if (passengerError) {
    await rollbackReservation(supabase, booking.id, seatId);
    return {
      success: false,
      error: mapBookingError(passengerError.message),
    };
  }

  const { data: confirmedBooking, error: confirmError } = await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", booking.id)
    .select("*")
    .single();

  if (confirmError || !confirmedBooking) {
    await rollbackReservation(supabase, booking.id, seatId);
    return {
      success: false,
      error: mapBookingError(confirmError?.message ?? "Booking confirmation failed"),
    };
  }

  revalidatePath("/my-bookings");
  revalidatePath("/booking-confirmation");
  revalidatePath("/seat-selection");

  return {
    success: true,
    booking: confirmedBooking,
    pnrCode: confirmedBooking.pnr_code,
  };
}
