import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export interface SeatSelectionData {
  flight: Tables<"flights"> | null;
  seats: Tables<"seats">[];
  bookedSeatIds: string[];
  error: string | null;
}

export async function fetchSeatSelectionData(
  flightId: string
): Promise<SeatSelectionData> {
  const supabase = await createClient();

  const [flightResult, seatsResult, bookingsResult] = await Promise.all([
    supabase.from("flights").select("*").eq("id", flightId).maybeSingle(),
    supabase
      .from("seats")
      .select("*")
      .eq("flight_id", flightId)
      .order("seat_number", { ascending: true }),
    supabase
      .from("bookings")
      .select("seat_id")
      .eq("flight_id", flightId)
      .in("status", ["pending", "confirmed"]),
  ]);

  if (flightResult.error) {
    return {
      flight: null,
      seats: [],
      bookedSeatIds: [],
      error: flightResult.error.message,
    };
  }

  if (seatsResult.error) {
    return {
      flight: flightResult.data,
      seats: [],
      bookedSeatIds: [],
      error: seatsResult.error.message,
    };
  }

  if (bookingsResult.error) {
    return {
      flight: flightResult.data,
      seats: seatsResult.data ?? [],
      bookedSeatIds: [],
      error: bookingsResult.error.message,
    };
  }

  return {
    flight: flightResult.data,
    seats: seatsResult.data ?? [],
    bookedSeatIds: bookingsResult.data?.map((booking) => booking.seat_id) ?? [],
    error: null,
  };
}
