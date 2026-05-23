"use server";

import { revalidatePath } from "next/cache";

import { mapCancelBookingError } from "@/lib/bookings/errors";
import { createClient } from "@/lib/supabase/server";
import { cancelBookingSchema } from "@/lib/validations/reschedule";
import type { Tables } from "@/types/database";

export type CancelBookingResult =
  | { success: true; booking: Tables<"bookings"> }
  | { success: false; error: string };

export async function cancelBooking(
  bookingId: string
): Promise<CancelBookingResult> {
  const parsed = cancelBookingSchema.safeParse({ bookingId });

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
    return { success: false, error: "Please sign in to cancel this booking." };
  }

  const { data, error } = await supabase.rpc("cancel_booking", {
    p_booking_id: parsed.data.bookingId,
  });

  if (error || !data) {
    return {
      success: false,
      error: mapCancelBookingError(error?.message ?? "Cancellation failed"),
    };
  }

  const payload = data as { booking: Tables<"bookings"> };

  revalidatePath("/my-bookings");
  revalidatePath("/booking-confirmation");
  revalidatePath("/seat-selection");

  return { success: true, booking: payload.booking };
}
