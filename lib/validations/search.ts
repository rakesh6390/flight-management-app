import { z } from "zod";

const iataCode = z
  .string()
  .min(1, "Required")
  .length(3, "Use 3-letter airport code")
  .regex(/^[A-Za-z]{3}$/, "Invalid airport code")
  .transform((v) => v.toUpperCase());

export const flightSearchSchema = z.object({
  origin: iataCode,
  destination: iataCode,
  departureDate: z
    .string()
    .min(1, "Departure date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date"),
  passengerCount: z
    .number({ error: "Passengers is required" })
    .int("Passengers must be a whole number")
    .min(1, "At least 1 passenger")
    .max(9, "Maximum 9 passengers"),
}).refine((data) => data.origin !== data.destination, {
  message: "Origin and destination must differ",
  path: ["destination"],
});

export type FlightSearchInput = z.infer<typeof flightSearchSchema>;

export function isDepartureDateInPast(date: string): boolean {
  const departure = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return departure < today;
}

export const flightSearchSchemaWithFutureDate = flightSearchSchema.refine(
  (data) => !isDepartureDateInPast(data.departureDate),
  {
    message: "Departure date cannot be in the past",
    path: ["departureDate"],
  }
);
