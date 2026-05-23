import { z } from "zod";

export const rescheduleBookingSchema = z.object({
  bookingId: z.string().uuid("Invalid booking"),
  newFlightId: z.string().uuid("Invalid flight"),
  newSeatId: z.string().uuid("Invalid seat"),
});

export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;

export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid("Invalid booking"),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
