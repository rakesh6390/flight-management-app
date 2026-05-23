import Link from "next/link";

import { EmptyState } from "@/components/flights/empty-state";

interface FlightsErrorProps {
  message: string;
}

export function FlightsError({ message }: FlightsErrorProps) {
  return (
    <EmptyState
      title="Something went wrong"
      description={message}
      icon="search"
      action={
        <Link
          href="/flights"
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Try again
        </Link>
      }
    />
  );
}
