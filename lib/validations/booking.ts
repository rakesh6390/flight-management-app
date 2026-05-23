import { z } from "zod";

export const passengerSchema = z.object({
  full_name: z
    .string()
    .min(1, "Full name is required")
    .max(200, "Full name is too long")
    .regex(/^[A-Za-z][A-Za-z\s'.-]*$/, "Enter a valid passenger name")
    .transform((value) => value.trim()),
  passport_no: z
    .string()
    .min(1, "Passport number is required")
    .max(20, "Passport number is too long")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, or hyphen only")
    .transform((value) => value.trim().toUpperCase()),
  nationality: z
    .string()
    .min(1, "Nationality is required")
    .length(3, "Use 3-letter country code")
    .regex(/^[A-Za-z]{3}$/, "Use 3-letter country code")
    .transform((value) => value.toUpperCase()),
  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date")
    .refine((value) => new Date(value) < new Date(), "Date of birth must be in the past"),
});

export const passengerFormSchema = z.object({
  passengers: z
    .array(passengerSchema)
    .min(1, "At least one passenger is required")
    .max(9, "Maximum 9 passengers"),
});

export const createBookingSchema = z.object({
  flightId: z.string().uuid("Invalid flight"),
  seatId: z.string().uuid("Invalid seat"),
  passengers: z
    .array(passengerSchema)
    .min(1, "At least one passenger is required")
    .max(9, "Maximum 9 passengers"),
});

export type PassengerInput = z.infer<typeof passengerSchema>;
export type PassengerFormInput = z.infer<typeof passengerFormSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
