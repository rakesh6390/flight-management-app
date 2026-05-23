import { addDays, parseISO } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import {
  getDepartureDateKeyFromTimestamp,
  matchesDepartureDate,
  normalizeFlightSearchFilters,
} from "@/lib/flights/dates";
import type { CabinClass } from "@/types/database";
import type {
  FetchFlightsResult,
  FlightSearchFilters,
  FlightWithAvailability,
  SeatClassAvailability,
} from "@/types/flights";
import { BOOKABLE_FLIGHT_STATUSES } from "@/types/flights";

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
  seats: { class: CabinClass; is_available: boolean }[] | null;
};

const CABIN_ORDER: CabinClass[] = ["economy", "business", "first"];

const DEBUG_FLIGHT_SEARCH =
  process.env.DEBUG_FLIGHT_SEARCH === "true" ||
  process.env.NODE_ENV === "development";

function debugFlightSearch(label: string, payload: unknown) {
  if (!DEBUG_FLIGHT_SEARCH) {
    return;
  }

  console.info(`[flight-search] ${label}`, JSON.stringify(payload, null, 2));
}

function aggregateSeatClasses(
  seats: { class: CabinClass; is_available: boolean }[] | null | undefined
): SeatClassAvailability[] {
  if (!seats?.length) {
    return [];
  }

  const counts = new Map<CabinClass, number>();

  for (const seat of seats) {
    if (!seat.is_available) {
      continue;
    }
    counts.set(seat.class, (counts.get(seat.class) ?? 0) + 1);
  }

  return CABIN_ORDER.filter((cabin) => counts.has(cabin)).map((cabin) => ({
    class: cabin,
    availableCount: counts.get(cabin) ?? 0,
  }));
}

function mapFlight(row: FlightWithSeats): FlightWithAvailability {
  const seatAvailability = aggregateSeatClasses(row.seats);
  const departs = parseISO(row.departs_at);
  const arrives = parseISO(row.arrives_at);
  const durationMinutes = Math.max(
    0,
    Math.round((arrives.getTime() - departs.getTime()) / 60_000)
  );

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
    availableSeatClasses: seatAvailability.map((s) => s.class),
    seatAvailability,
    durationMinutes,
  };
}

export async function fetchFlightsBySearch(
  filters: FlightSearchFilters
): Promise<FetchFlightsResult> {
  const normalized = normalizeFlightSearchFilters(filters);
  const { origin, destination, departureDate } = normalized;

  debugFlightSearch("search date (YYYY-MM-DD)", {
    rawDepartureDate: filters.departureDate,
    normalizedSearchDate: departureDate,
    origin,
    destination,
  });

  const supabase = await createClient();

  const windowAnchor = parseISO(`${departureDate}T12:00:00.000Z`);
  const windowStart = addDays(windowAnchor, -1).toISOString();
  const windowEnd = addDays(windowAnchor, 2).toISOString();

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
      seats ( class, is_available )
    `
    )
    .ilike("origin", origin)
    .ilike("destination", destination)
    .gte("departs_at", windowStart)
    .lt("departs_at", windowEnd)
    .in("status", BOOKABLE_FLIGHT_STATUSES)
    .order("departs_at", { ascending: true });

  if (error) {
    debugFlightSearch("supabase error", { message: error.message });
    return {
      flights: [],
      error: error.message,
    };
  }

  const fetched = (data as FlightWithSeats[] | null) ?? [];

  debugFlightSearch(
    "database dates (departs_at → date key)",
    fetched.map((row) => ({
      flight_no: row.flight_no,
      departs_at: row.departs_at,
      databaseDateKey: getDepartureDateKeyFromTimestamp(row.departs_at),
    }))
  );

  const filtered = fetched.filter((row) =>
    matchesDepartureDate(row.departs_at, departureDate)
  );

  debugFlightSearch(
    "filtered results",
    filtered.map((row) => ({
      flight_no: row.flight_no,
      departs_at: row.departs_at,
      databaseDateKey: getDepartureDateKeyFromTimestamp(row.departs_at),
      matchesSearchDate: departureDate,
    }))
  );

  const flights = filtered.map(mapFlight);

  return { flights, error: null };
}
