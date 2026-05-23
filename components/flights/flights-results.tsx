import Link from "next/link";

import { FlightCard } from "@/components/flights/flight-card";
import { EmptyState } from "@/components/flights/empty-state";
import { formatSearchDepartureDate } from "@/lib/flights/format";
import type { FlightSearchInput } from "@/lib/validations/search";
import type { FlightWithAvailability } from "@/types/flights";

interface FlightsResultsProps {
  flights: FlightWithAvailability[];
  search: FlightSearchInput;
}

export function FlightsResults({ flights, search }: FlightsResultsProps) {
  if (flights.length === 0) {
    return (
      <EmptyState
        title="No flights found"
        description={`We couldn't find flights from ${search.origin} to ${search.destination} on ${formatSearchDepartureDate(search.departureDate)}. Try different dates or airports.`}
        icon="flight"
        action={
          <Link
            href="/"
            className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
          >
            New search
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {flights.length} flight{flights.length === 1 ? "" : "s"} found ·{" "}
        {search.passengerCount} passenger
        {search.passengerCount === 1 ? "" : "s"}
      </p>
      <ul className="space-y-4" aria-label="Flight results">
        {flights.map((flight) => (
          <li key={flight.id}>
            <FlightCard
              flight={flight}
              passengerCount={search.passengerCount}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
