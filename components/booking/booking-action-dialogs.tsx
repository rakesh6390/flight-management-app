"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatPrice, formatPriceDifference } from "@/lib/flights/format";

interface CancelBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pnrCode: string;
  isPending: boolean;
  onConfirm: () => void;
}

export function CancelBookingDialog({
  open,
  onOpenChange,
  pnrCode,
  isPending,
  onConfirm,
}: CancelBookingDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel booking?</AlertDialogTitle>
          <AlertDialogDescription>
            PNR <span className="font-semibold text-slate-800 dark:text-slate-200">{pnrCode}</span>{" "}
            will be cancelled and your seat released. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep booking</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 focus-visible:outline-red-600"
          >
            {isPending ? (
              <LoadingSpinner label="Cancelling…" size="sm" className="text-white" />
            ) : (
              "Yes, cancel booking"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface RescheduleConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pnrCode: string;
  flightNo: string;
  seatNumber: string;
  newTotal: number;
  fareDifference: number;
  isPending: boolean;
  onConfirm: () => void;
}

export function RescheduleConfirmDialog({
  open,
  onOpenChange,
  pnrCode,
  flightNo,
  seatNumber,
  newTotal,
  fareDifference,
  isPending,
  onConfirm,
}: RescheduleConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm reschedule</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-left text-sm text-slate-600 dark:text-slate-400">
              <p>
                Move PNR{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {pnrCode}
                </span>{" "}
                to flight{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {flightNo}
                </span>{" "}
                seat{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {seatNumber}
                </span>
                ?
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>New total: {formatPrice(newTotal)}</li>
                <li>
                  Fare change: {formatPriceDifference(fareDifference)} (includes change fee)
                </li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            disabled={isPending}
          >
            {isPending ? (
              <LoadingSpinner label="Rescheduling…" size="sm" className="text-white" />
            ) : (
              "Confirm reschedule"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
