"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

import { cancelBooking } from "@/actions/cancelBooking";

interface UseCancelBookingOptions {
  bookingId: string;
  pnrCode: string;
  onSuccess?: () => void;
}

export function useCancelBooking({
  bookingId,
  pnrCode,
  onSuccess,
}: UseCancelBookingOptions) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);

  const confirmCancel = useCallback(() => {
    startTransition(async () => {
      const result = await cancelBooking(bookingId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`Booking ${pnrCode} cancelled. Your seat has been released.`);
      setDialogOpen(false);
      onSuccess?.();
      router.refresh();
    });
  }, [bookingId, onSuccess, pnrCode, router]);

  return {
    dialogOpen,
    setDialogOpen,
    isPending,
    confirmCancel,
  };
}
