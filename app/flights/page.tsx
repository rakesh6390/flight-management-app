import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { FlightsError } from "@/components/flights/flights-error";
import { FlightsResults } from "@/components/flights/flights-results";
import { EmptyState } from "@/components/flights/empty-state";
import { SearchForm } from "@/components/flights/search-form";
import { SearchStoreSync } from "@/components/flights/search-store-sync";
import { SiteHeader } from "@/components/layout/site-header";
import { fetchFlightsBySearch } from "@/lib/flights/queries";
import { formatSearchDepartureDate } from "@/lib/flights/format";
import {
  flightSearchInputToSearchQuery,
  hasFlightSearchParams,
  parseFlightSearchParams,
  type RawFlightSearchParams,
} from "@/lib/flights/search-params";

export const metadata: Metadata = {
  title: "Search flights | Flight Management",
  description: "Browse available flights for your route and date",
};

interface FlightsPageProps {
  searchParams: Promise<RawFlightSearchParams>;
}

export default async function FlightsPage({ searchParams }: FlightsPageProps) {
  const raw = await searchParams;

  if (!hasFlightSearchParams(raw)) {
    return (
      <FlightsPageShell>
        <EmptyState
          title="Start your search"
          description="Enter origin, destination, and departure date to see available flights."
          action={
            <Link
              href="/"
              className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Search flights
            </Link>
          }
        />
        <div className="mt-8">
          <SearchForm variant="compact" syncUrlOnSubmit />
        </div>
      </FlightsPageShell>
    );
  }

  const parsed = parseFlightSearchParams(raw);

  if (!parsed.success) {
    return (
      <FlightsPageShell>
        <EmptyState
          title="Invalid search"
          description={
            typeof parsed.error === "string"
              ? parsed.error
              : "Check your airports and date, then try again."
          }
          action={
            <Link
              href="/"
              className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Back to search
            </Link>
          }
        />
      </FlightsPageShell>
    );
  }

  const search = parsed.data;
  const { flights, error } = await fetchFlightsBySearch({
    origin: search.origin,
    destination: search.destination,
    departureDate: search.departureDate,
  });

  return (
    <FlightsPageShell>
      <SearchStoreSync search={search} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {search.origin} → {search.destination}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {formatSearchDepartureDate(search.departureDate)} ·{" "}
          {search.passengerCount} passenger
          {search.passengerCount === 1 ? "" : "s"}
        </p>
      </div>

      <SearchForm
        variant="compact"
        initialValues={flightSearchInputToSearchQuery(search)}
        syncUrlOnSubmit
      />

      <section className="mt-8">
        {error ? (
          <FlightsError message={error} />
        ) : (
          <FlightsResults flights={flights} search={search} />
        )}
      </section>
    </FlightsPageShell>
  );
}

function FlightsPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
