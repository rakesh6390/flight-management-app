export function mapCancelBookingError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("not_authenticated")) {
    return "Please sign in to cancel this booking.";
  }
  if (normalized.includes("cancellation_not_allowed_within_2_hours")) {
    return "Cancellations must be made more than 2 hours before departure.";
  }
  if (normalized.includes("booking_already_cancelled")) {
    return "This booking is already cancelled.";
  }
  if (normalized.includes("booking_not_cancellable")) {
    return "This booking can no longer be cancelled.";
  }
  if (normalized.includes("booking_not_found")) {
    return "Booking not found.";
  }

  return message || "Unable to cancel booking. Please try again.";
}

export function mapRescheduleBookingError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("not_authenticated")) {
    return "Please sign in to reschedule this booking.";
  }
  if (normalized.includes("reschedule_not_allowed_within_2_hours")) {
    return "Reschedules must be made more than 2 hours before departure.";
  }
  if (normalized.includes("booking_not_reschedulable")) {
    return "Only confirmed bookings can be rescheduled.";
  }
  if (
    normalized.includes("new_seat_not_available") ||
    normalized.includes("new_seat_already_reserved")
  ) {
    return "That seat was just taken. Choose another available seat.";
  }
  if (
    normalized.includes("new_flight_not_bookable") ||
    normalized.includes("new_flight_cancelled")
  ) {
    return "The selected flight is no longer available.";
  }
  if (normalized.includes("reschedule_route_mismatch")) {
    return "You can only reschedule to flights on the same route.";
  }
  if (normalized.includes("reschedule_requires_different_flight")) {
    return "Choose a different flight to reschedule.";
  }
  if (normalized.includes("booking_not_found")) {
    return "Booking not found.";
  }

  return message || "Unable to reschedule booking. Please try again.";
}
