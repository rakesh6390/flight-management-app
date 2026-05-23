import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Download, Plane, Printer, Ticket } from "lucide-react";

import { EmptyState } from "@/components/flights/empty-state";
import { SiteHeader } from "@/components/layout/site-header";
import { fetchBookingConfirmation } from "@/lib/bookings/queries";
import {
  formatCabinClass,
  formatFlightDateTime,
  formatPrice,
} from "@/lib/flights/format";

export const metadata: Metadata = {
  title: "Booking confirmation | Flight Management",
  description: "View your confirmed flight booking details",
};

interface BookingConfirmationPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getPnr(raw: Record<string, string | string[] | undefined>) {
  const pnr = raw.pnr;
  return Array.isArray(pnr) ? pnr[0] : pnr;
}

export default async function BookingConfirmationPage({
  searchParams,
}: BookingConfirmationPageProps) {
  const pnr = getPnr(await searchParams);

  if (!pnr) {
    return (
      <ConfirmationShell>
        <EmptyState
          title="No booking selected"
          description="Open a confirmed booking to view ticket details."
          icon="flight"
          action={<PrimaryLink href="/my-bookings">My bookings</PrimaryLink>}
        />
      </ConfirmationShell>
    );
  }

  const { booking, error } = await fetchBookingConfirmation(pnr);

  if (error) {
    return (
      <ConfirmationShell>
        <EmptyState
          title="Unable to load booking"
          description={error}
          icon="search"
          action={<PrimaryLink href="/my-bookings">My bookings</PrimaryLink>}
        />
      </ConfirmationShell>
    );
  }

  if (!booking || !booking.flights || !booking.seats) {
    return (
      <ConfirmationShell>
        <EmptyState
          title="Booking not found"
          description="We could not find a booking with that PNR for your account."
          icon="flight"
          action={<PrimaryLink href="/dashboard">Back to dashboard</PrimaryLink>}
        />
      </ConfirmationShell>
    );
  }

  const flight = booking.flights;
  const seat = booking.seats;

  return (
    <ConfirmationShell>
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/40 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white">
              <CheckCircle2 className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Booking confirmed
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                PNR {booking.pnr_code}
              </h1>
            </div>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold capitalize text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-300">
            {booking.status}
          </span>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-sky-600" aria-hidden />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Flight details
            </h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Detail label="Flight" value={flight.flight_no} />
            <Detail label="Aircraft" value={flight.aircraft_type ?? "Scheduled aircraft"} />
            <Detail label="Route" value={`${flight.origin} to ${flight.destination}`} />
            <Detail label="Departure" value={formatFlightDateTime(flight.departs_at)} />
            <Detail label="Arrival" value={formatFlightDateTime(flight.arrives_at)} />
            <Detail
              label="Seat"
              value={`${seat.seat_number} - ${formatCabinClass(seat.class)}`}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-sky-600" aria-hidden />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Fare summary
            </h2>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <SummaryRow label="Base fare" value={formatPrice(flight.base_price)} />
            <SummaryRow label="Seat fee" value={formatPrice(seat.extra_fee)} />
            <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
              <SummaryRow
                label="Total paid"
                value={formatPrice(booking.total_price)}
                strong
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Passenger details
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {booking.passengers.map((passenger) => (
            <div
              key={passenger.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
            >
              <p className="font-semibold text-slate-900 dark:text-white">
                {passenger.full_name}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Passport {passenger.passport_no}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {passenger.nationality} - DOB {passenger.dob}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <PrimaryLink href="/dashboard">Back to dashboard</PrimaryLink>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Printer className="h-4 w-4" aria-hidden />
            Print summary
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" aria-hidden />
            Download ticket
          </button>
        </div>
      </section>
    </ConfirmationShell>
  );
}

function ConfirmationShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <span
        className={
          strong
            ? "text-lg font-bold text-slate-900 dark:text-white"
            : "font-semibold text-slate-900 dark:text-white"
        }
      >
        {value}
      </span>
    </div>
  );
}

function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
    >
      {children}
    </Link>
  );
}
