import { parseISO } from "date-fns";

import { RESCHEDULE_FEE_USD } from "@/lib/bookings/constants";
import { createClient } from "@/lib/supabase/server";
import { BOOKABLE_FLIGHT_STATUSES } from "@/types/flights";
import type { Tables } from "@/types/database";
import type {
  FlightWithAvailability,
  RescheduleFlightOption,
} from "@/types/flights";

export type BookingConfirmation = Tables<"bookings"> & {
  flights: Tables<"flights"> | null;
  seats: Tables<"seats"> | null;
  passengers: Tables<"passengers">[];
};

export type UserBooking = Tables<"bookings"> & {
  flights: Tables<"flights"> | null;
  seats: Tables<"seats"> | null;
  passengers: Tables<"passengers">[];
  reschedules: Tables<"reschedules">[];
};

type FlightWithSeats = {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string | null;
  status: string;
  base_price: number;
  seats: { class: string; is_available: boolean; extra_fee?: number }[] | null;
};

function mapRescheduleFlight(row: FlightWithSeats): FlightWithAvailability {
  const seats = row.seats ?? [];
  const counts = new Map<string, number>();

  for (const seat of seats) {
    if (!seat.is_available) {
      continue;
    }
    counts.set(seat.class, (counts.get(seat.class) ?? 0) + 1);
  }

  const seatAvailability = ["economy", "business", "first"]
    .filter((cabin) => counts.has(cabin))
    .map((cabin) => ({
      class: cabin as FlightWithAvailability["seatAvailability"][number]["class"],
      availableCount: counts.get(cabin) ?? 0,
    }));

  const departs = parseISO(row.departs_at);
  const arrives = parseISO(row.arrives_at);

  return {
    id: row.id,
    flight_no: row.flight_no,
    origin: row.origin,
    destination: row.destination,
    departs_at: row.departs_at,
    arrives_at: row.arrives_at,
    aircraft_type: row.aircraft_type,
    status: row.status as FlightWithAvailability["status"],
    base_price: row.base_price,
    availableSeatClasses: seatAvailability.map((entry) => entry.class),
    seatAvailability,
    durationMinutes: Math.max(
      0,
      Math.round((arrives.getTime() - departs.getTime()) / 60_000)
    ),
  };
}

function cheapestAvailableSeatExtra(
  seats: FlightWithSeats["seats"]
): number {
  if (!seats?.length) {
    return 0;
  }

  const availableExtras = seats
    .filter((seat) => seat.is_available)
    .map((seat) => seat.extra_fee ?? 0);

  if (availableExtras.length === 0) {
    return 0;
  }

  return Math.min(...availableExtras);
}

function totalAvailableSeats(seats: FlightWithSeats["seats"]): number {
  return seats?.filter((seat) => seat.is_available).length ?? 0;
}

export async function fetchBookingConfirmation(
  pnrCode: string
): Promise<{ booking: BookingConfirmation | null; error: string | null }> {
  const supabase = await createClient();

  const normalizedPnr = pnrCode.trim().toUpperCase();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      flights (*),
      seats (*),
      passengers (*)
    `
    )
    .eq("pnr_code", normalizedPnr)
    .maybeSingle();

  if (error) {
    return { booking: null, error: error.message };
  }

  return {
    booking: (data as BookingConfirmation | null) ?? null,
    error: null,
  };
}

export async function fetchUserBookings(): Promise<{
  bookings: UserBooking[];
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { bookings: [], error: null };
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      flights (*),
      seats (*),
      passengers (*),
      reschedules (*)
    `
    )
    .eq("user_id", user.id)
    .order("booked_at", { ascending: false });

  if (error) {
    return { bookings: [], error: error.message };
  }

  return {
    bookings: (data as UserBooking[] | null) ?? [],
    error: null,
  };
}

export async function fetchRescheduleFlightOptions(
  bookingId: string
): Promise<{ flights: RescheduleFlightOption[]; error: string | null }> {
  const supabase = await createClient();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(
      `
      id,
      flight_id,
      status,
      total_price,
      flights ( origin, destination, departs_at )
    `
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    return { flights: [], error: bookingError.message };
  }

  const flight = booking?.flights as Tables<"flights"> | null;

  if (!booking || !flight) {
    return { flights: [], error: "Booking not found" };
  }

  const currentTotal = Number(booking.total_price);

  const { data, error } = await supabase
    .from("flights")
    .select(
      `
      id,
      flight_no,
      origin,
      destination,
      departs_at,
      arrives_at,
      aircraft_type,
      status,
      base_price,
      seats ( class, is_available, extra_fee )
    `
    )
    .eq("origin", flight.origin)
    .eq("destination", flight.destination)
    .gt("departs_at", new Date().toISOString())
    .in("status", BOOKABLE_FLIGHT_STATUSES)
    .neq("id", booking.flight_id)
    .order("departs_at", { ascending: true });

  if (error) {
    return { flights: [], error: error.message };
  }

  const flights = (data as FlightWithSeats[] | null) ?? [];

  const options: RescheduleFlightOption[] = flights
    .map((row) => {
      const base = mapRescheduleFlight(row);
      const availableCount = totalAvailableSeats(row.seats);

      if (availableCount === 0) {
        return null;
      }

      const minSeatExtra = cheapestAvailableSeatExtra(row.seats);
      const estimatedNewTotal =
        row.base_price + minSeatExtra + RESCHEDULE_FEE_USD;

      return {
        ...base,
        priceDifference: estimatedNewTotal - currentTotal,
        estimatedNewTotal,
        currentBookingTotal: currentTotal,
        totalAvailableSeats: availableCount,
      };
    })
    .filter((option): option is RescheduleFlightOption => option !== null);

  return { flights: options, error: null };
}
