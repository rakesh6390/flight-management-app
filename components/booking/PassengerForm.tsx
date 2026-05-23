"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck, UserRound } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { useCreateBooking } from "@/hooks/useCreateBooking";
import { cn } from "@/lib/utils";
import {
  passengerFormSchema,
  type PassengerFormInput,
} from "@/lib/validations/booking";
import {
  selectPassengerFormData,
  selectSearchQuery,
  selectSelectedSeat,
  useFlightStore,
} from "@/stores/useFlightStore";
import { createPassengerForms } from "@/types/flight-store";

interface PassengerFormProps {
  flightId: string;
}

export function PassengerForm({ flightId }: PassengerFormProps) {
  const selectedSeat = useFlightStore(selectSelectedSeat);
  const searchQuery = useFlightStore(selectSearchQuery);
  const storedPassengers = useFlightStore(selectPassengerFormData);
  const setPassengerFormData = useFlightStore((state) => state.setPassengerFormData);
  const { createBooking, loading } = useCreateBooking();
  const passengerCount = Math.max(1, searchQuery.passengerCount);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<PassengerFormInput>({
    resolver: zodResolver(passengerFormSchema),
    defaultValues: {
      passengers:
        storedPassengers.length > 0
          ? storedPassengers
          : createPassengerForms(passengerCount),
    },
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "passengers",
  });

  useEffect(() => {
    if (fields.length === passengerCount) {
      return;
    }

    const nextPassengers = createPassengerForms(passengerCount).map(
      (passenger, index) => storedPassengers[index] ?? passenger
    );

    replace(nextPassengers);
    reset({ passengers: nextPassengers });
  }, [fields.length, passengerCount, replace, reset, storedPassengers]);

  useEffect(() => {
    const subscription = watch((value) => {
      if (value.passengers) {
        setPassengerFormData(
          value.passengers.map((passenger) => ({
            full_name: passenger?.full_name ?? "",
            passport_no: passenger?.passport_no ?? "",
            nationality: passenger?.nationality ?? "",
            dob: passenger?.dob ?? "",
          }))
        );
      }
    });

    return () => subscription.unsubscribe();
  }, [setPassengerFormData, watch]);

  const onSubmit = handleSubmit((values) => {
    createBooking({
      flightId,
      passengers: values.passengers,
    });
  });

  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <UserRound className="h-5 w-5 text-sky-600" aria-hidden />
            Passenger details
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Enter details exactly as shown on each passport.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Passport numbers are not saved locally
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-5" noValidate>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/50"
          >
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Passenger {index + 1}
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <PassengerInput
                label="Full name"
                placeholder="Rakesh Sharma"
                disabled={loading}
                error={errors.passengers?.[index]?.full_name?.message}
                {...register(`passengers.${index}.full_name`)}
              />
              <PassengerInput
                label="Passport number"
                placeholder="A1234567"
                disabled={loading}
                error={errors.passengers?.[index]?.passport_no?.message}
                {...register(`passengers.${index}.passport_no`)}
              />
              <PassengerInput
                label="Nationality"
                placeholder="IND"
                maxLength={3}
                disabled={loading}
                error={errors.passengers?.[index]?.nationality?.message}
                className="uppercase"
                {...register(`passengers.${index}.nationality`)}
              />
              <PassengerInput
                label="Date of birth"
                type="date"
                disabled={loading}
                error={errors.passengers?.[index]?.dob?.message}
                {...register(`passengers.${index}.dob`)}
              />
            </div>
          </div>
        ))}

        {errors.passengers?.root?.message ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {errors.passengers.root.message}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isDirty ? "Progress saved in this browser." : "Ready when passenger details are complete."}
          </p>
          <button
            type="submit"
            disabled={loading || !selectedSeat?.seat}
            className={cn(
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Confirming booking
              </>
            ) : (
              "Confirm booking"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

interface PassengerInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function PassengerInput({
  label,
  error,
  className,
  id,
  ...props
}: PassengerInputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          "block min-h-11 w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition",
          "placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
          "disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-slate-100",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-slate-200 dark:border-slate-700",
          className
        )}
        {...props}
      />
      {error ? (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
