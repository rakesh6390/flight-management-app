import type { FlightSearchInput } from "@/lib/validations/search";
import { flightSearchSchema } from "@/lib/validations/search";
import type { SearchQuery } from "@/types/flight-store";

export const FLIGHT_SEARCH_PARAM_KEYS = {
  origin: "origin",
  destination: "destination",
  departureDate: "departureDate",
  passengers: "passengers",
} as const;

export type RawFlightSearchParams = Record<
  string,
  string | string[] | undefined
>;

export function searchQueryToParams(
  query: SearchQuery | FlightSearchInput
): URLSearchParams {
  const params = new URLSearchParams();
  params.set(FLIGHT_SEARCH_PARAM_KEYS.origin, query.origin);
  params.set(FLIGHT_SEARCH_PARAM_KEYS.destination, query.destination);
  params.set(FLIGHT_SEARCH_PARAM_KEYS.departureDate, query.departureDate);
  params.set(
    FLIGHT_SEARCH_PARAM_KEYS.passengers,
    String(query.passengerCount)
  );
  return params;
}

export function buildFlightsSearchUrl(
  query: SearchQuery | FlightSearchInput
): string {
  return `/flights?${searchQueryToParams(query).toString()}`;
}

export function parseFlightSearchParams(
  raw: RawFlightSearchParams
): { success: true; data: FlightSearchInput } | { success: false; error: string } {
  const origin = getParam(raw, FLIGHT_SEARCH_PARAM_KEYS.origin)?.trim();
  const destination = getParam(
    raw,
    FLIGHT_SEARCH_PARAM_KEYS.destination
  )?.trim();
  const departureDate = getParam(
    raw,
    FLIGHT_SEARCH_PARAM_KEYS.departureDate
  )?.trim();
  const passengers = getParam(raw, FLIGHT_SEARCH_PARAM_KEYS.passengers)?.trim();

  if (!origin && !destination && !departureDate) {
    return { success: false, error: "missing_params" };
  }

  const parsed = flightSearchSchema.safeParse({
    origin: origin ?? "",
    destination: destination ?? "",
    departureDate: departureDate ?? "",
    passengerCount: Number(passengers ?? "1"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid search parameters",
    };
  }

  return { success: true, data: parsed.data };
}

export function flightSearchInputToSearchQuery(
  input: FlightSearchInput
): SearchQuery {
  return {
    origin: input.origin,
    destination: input.destination,
    departureDate: input.departureDate,
    passengerCount: input.passengerCount,
  };
}

function getParam(
  raw: RawFlightSearchParams,
  key: string
): string | undefined {
  const value = raw[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function hasFlightSearchParams(raw: RawFlightSearchParams): boolean {
  return Boolean(
    getParam(raw, FLIGHT_SEARCH_PARAM_KEYS.origin) &&
      getParam(raw, FLIGHT_SEARCH_PARAM_KEYS.destination) &&
      getParam(raw, FLIGHT_SEARCH_PARAM_KEYS.departureDate)
  );
}
