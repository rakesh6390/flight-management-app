"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, Calendar, Loader2, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { buildFlightsSearchUrl } from "@/lib/flights/search-params";
import { cn } from "@/lib/utils";
import {
  flightSearchSchemaWithFutureDate,
  type FlightSearchInput,
} from "@/lib/validations/search";
import {
  selectSearchQuery,
  useFlightStore,
} from "@/stores/useFlightStore";
import type { SearchQuery } from "@/types/flight-store";

interface SearchFormProps {
  variant?: "hero" | "compact";
  initialValues?: Partial<SearchQuery>;
  syncUrlOnSubmit?: boolean;
}

export function SearchForm({
  variant = "hero",
  initialValues,
  syncUrlOnSubmit = true,
}: SearchFormProps) {
  const router = useRouter();
  const storedQuery = useFlightStore(selectSearchQuery);
  const setSearchQuery = useFlightStore((s) => s.setSearchQuery);
  const setBookingStep = useFlightStore((s) => s.setBookingStep);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FlightSearchInput>({
    resolver: zodResolver(flightSearchSchemaWithFutureDate),
    defaultValues: {
      origin: initialValues?.origin ?? storedQuery.origin,
      destination: initialValues?.destination ?? storedQuery.destination,
      departureDate:
        initialValues?.departureDate ?? storedQuery.departureDate,
      passengerCount:
        initialValues?.passengerCount ?? storedQuery.passengerCount,
    },
  });

  const origin = watch("origin");
  const destination = watch("destination");

  useEffect(() => {
    if (initialValues) {
      reset({
        origin: initialValues.origin ?? "",
        destination: initialValues.destination ?? "",
        departureDate: initialValues.departureDate ?? "",
        passengerCount: initialValues.passengerCount ?? 1,
      });
    }
  }, [initialValues, reset]);

  const swapAirports = () => {
    setValue("origin", destination?.toUpperCase() ?? "", { shouldValidate: true });
    setValue("destination", origin?.toUpperCase() ?? "", { shouldValidate: true });
  };

  const onSubmit = handleSubmit((data) => {
    setSearchQuery({
      origin: data.origin,
      destination: data.destination,
      departureDate: data.departureDate,
      passengerCount: data.passengerCount,
    });
    setBookingStep("select-flight");

    if (syncUrlOnSubmit) {
      router.push(buildFlightsSearchUrl(data));
    }
  });

  const isHero = variant === "hero";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn(
        "rounded-2xl border bg-white shadow-xl dark:bg-slate-900",
        isHero
          ? "border-slate-200/80 p-6 sm:p-8 dark:border-slate-800"
          : "border-slate-200 p-4 sm:p-5 dark:border-slate-800"
      )}
    >
      <div
        className={cn(
          "grid gap-4",
          isHero
            ? "sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
            : "sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
        )}
      >
        <Field
          label="From"
          icon={<MapPin className="h-4 w-4" aria-hidden />}
          error={errors.origin?.message}
        >
          <input
            {...register("origin")}
            placeholder="JFK"
            maxLength={3}
            autoComplete="off"
            className={inputClass(!!errors.origin)}
            aria-invalid={!!errors.origin}
          />
        </Field>

        <Field
          label="To"
          icon={<MapPin className="h-4 w-4" aria-hidden />}
          error={errors.destination?.message}
          action={
            <button
              type="button"
              onClick={swapAirports}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              aria-label="Swap origin and destination"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          }
        >
          <input
            {...register("destination")}
            placeholder="LAX"
            maxLength={3}
            autoComplete="off"
            className={inputClass(!!errors.destination)}
            aria-invalid={!!errors.destination}
          />
        </Field>

        <Field
          label="Departure"
          icon={<Calendar className="h-4 w-4" aria-hidden />}
          error={errors.departureDate?.message}
        >
          <input
            type="date"
            {...register("departureDate")}
            className={inputClass(!!errors.departureDate)}
            aria-invalid={!!errors.departureDate}
          />
        </Field>

        <Field
          label="Passengers"
          icon={<Users className="h-4 w-4" aria-hidden />}
          error={errors.passengerCount?.message}
        >
          <input
            type="number"
            min={1}
            max={9}
            {...register("passengerCount", { valueAsNumber: true })}
            className={inputClass(!!errors.passengerCount)}
            aria-invalid={!!errors.passengerCount}
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-700",
          "disabled:cursor-not-allowed disabled:opacity-70",
          !isHero && "sm:w-auto sm:px-8"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Searching…
          </>
        ) : (
          "Search flights"
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  icon,
  error,
  action,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          {icon}
          {label}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    "w-full rounded-lg border bg-white px-3 py-2.5 text-sm uppercase tracking-wide text-slate-900 outline-none transition",
    "focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
    "dark:bg-slate-950 dark:text-slate-100",
    hasError
      ? "border-red-500"
      : "border-slate-200 dark:border-slate-700"
  );
}
