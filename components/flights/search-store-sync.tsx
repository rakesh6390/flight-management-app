"use client";

import { useEffect } from "react";

import { flightSearchInputToSearchQuery } from "@/lib/flights/search-params";
import type { FlightSearchInput } from "@/lib/validations/search";
import { useFlightStore } from "@/stores/useFlightStore";

interface SearchStoreSyncProps {
  search: FlightSearchInput;
}

/** Syncs URL search params into Zustand on the flights results page. */
export function SearchStoreSync({ search }: SearchStoreSyncProps) {
  const setSearchQuery = useFlightStore((s) => s.setSearchQuery);
  const setBookingStep = useFlightStore((s) => s.setBookingStep);

  useEffect(() => {
    setSearchQuery(flightSearchInputToSearchQuery(search));
    setBookingStep("select-flight");
  }, [search, setBookingStep, setSearchQuery]);

  return null;
}
