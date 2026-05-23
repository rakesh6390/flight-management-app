import { RESCHEDULE_FEE_USD } from "@/lib/bookings/constants";

export function estimateRescheduleTotal(
  flightBasePrice: number,
  seatExtraFee: number
): number {
  return flightBasePrice + seatExtraFee + RESCHEDULE_FEE_USD;
}

export function estimateFareDifference(
  currentBookingTotal: number,
  flightBasePrice: number,
  seatExtraFee: number
): number {
  return estimateRescheduleTotal(flightBasePrice, seatExtraFee) - currentBookingTotal;
}
