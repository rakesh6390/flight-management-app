import { z } from "zod";

import {
  isDepartureDateInPast,
  isValidIsoDateKey,
  normalizeDepartureDate,
} from "@/lib/flights/dates";

const iataCode = z
  .string()
  .min(1, "Required")
  .length(3, "Use 3-letter airport code")
  .regex(/^[A-Za-z]{3}$/, "Invalid airport code")
  .transform((v) => v.trim().toUpperCase());

const departureDateField = z
  .string()
  .min(1, "Departure date is required")
  .transform((value) => normalizeDepartureDate(value))
  .refine((value) => isValidIsoDateKey(value), {
    message: "Use a valid date (stored as YYYY-MM-DD)",
  });

export const flightSearchSchema = z
  .object({
    origin: iataCode,
    destination: iataCode,
    departureDate: departureDateField,
    passengerCount: z
      .number({ error: "Passengers is required" })
      .int("Passengers must be a whole number")
      .min(1, "At least 1 passenger")
      .max(9, "Maximum 9 passengers"),
  })
  .refine((data) => data.origin !== data.destination, {
    message: "Origin and destination must differ",
    path: ["destination"],
  });

export type FlightSearchInput = z.infer<typeof flightSearchSchema>;

export const flightSearchSchemaWithFutureDate = flightSearchSchema.refine(
  (data) => !isDepartureDateInPast(data.departureDate),
  {
    message: "Departure date cannot be in the past",
    path: ["departureDate"],
  }
);
