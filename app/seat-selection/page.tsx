import type { Metadata } from "next";
import Link from "next/link";

import { PassengerForm } from "@/components/booking/PassengerForm";
import { EmptyState } from "@/components/flights/empty-state";
import { SiteHeader } from "@/components/layout/site-header";
import { SeatMap } from "@/components/seat-map/SeatMap";
import { formatFlightDateTime } from "@/lib/flights/format";
import { fetchSeatSelectionData } from "@/lib/seats/queries";

export const metadata: Metadata = {
  title: "Seat selection | Flight Management",
  description: "Choose an aircraft seat for your selected flight",
};

interface SeatSelectionPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getFlightId(raw: Record<string, string | string[] | undefined>) {
  const flightId = raw.flightId;
  return Array.isArray(flightId) ? flightId[0] : flightId;
}

export default async function SeatSelectionPage({
  searchParams,
}: SeatSelectionPageProps) {
  const flightId = getFlightId(await searchParams);

  if (!flightId) {
    return (
      <SeatSelectionShell>
        <EmptyState
          title="Choose a flight first"
          description="Search for flights and select one before choosing a seat."
          icon="flight"
          action={<PrimaryLink href="/flights">Browse flights</PrimaryLink>}
        />
      </SeatSelectionShell>
    );
  }

  const { flight, seats, bookedSeatIds, error } =
    await fetchSeatSelectionData(flightId);

  if (error) {
    return (
      <SeatSelectionShell>
        <EmptyState
          title="Unable to load seats"
          description={error}
          icon="search"
          action={<PrimaryLink href="/flights">Back to flights</PrimaryLink>}
        />
      </SeatSelectionShell>
    );
  }

  if (!flight) {
    return (
      <SeatSelectionShell>
        <EmptyState
          title="Flight not found"
          description="This flight may have been removed or is no longer available."
          icon="flight"
          action={
            <PrimaryLink href="/flights">Find another flight</PrimaryLink>
          }
        />
      </SeatSelectionShell>
    );
  }

  if (seats.length === 0) {
    return (
      <SeatSelectionShell>
        <FlightSummary flight={flight} />
        <EmptyState
          title="No seat map available"
          description="Seat inventory has not been published for this flight yet."
          icon="flight"
        />
      </SeatSelectionShell>
    );
  }

  return (
    <SeatSelectionShell>
      <FlightSummary flight={flight} />
      <SeatMap seats={seats} bookedSeatIds={bookedSeatIds} />
      <PassengerForm flightId={flight.id} />
    </SeatSelectionShell>
  );
}

function SeatSelectionShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

function FlightSummary({
  flight,
}: {
  flight: {
    flight_no: string;
    origin: string;
    destination: string;
    departs_at: string;
    aircraft_type: string | null;
  };
}) {
  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <p className="text-xs font-semibold uppercase text-sky-700 dark:text-sky-300">
        {flight.flight_no}
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {flight.origin} to {flight.destination}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {formatFlightDateTime(flight.departs_at)}
          </p>
        </div>
        {flight.aircraft_type ? (
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {flight.aircraft_type}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
    >
      {children}
    </Link>
  );
}
