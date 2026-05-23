import {
  ArrowRight,
  Calendar,
  Plane,
  PlaneTakeoff,
  Search,
  Ticket,
} from "lucide-react";
import Link from "next/link";

import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { EmptyState } from "@/components/flights/empty-state";
import type { DashboardSummary } from "@/lib/bookings/dashboard";
import type { UserBooking } from "@/lib/bookings/queries";
import { hoursUntilDeparture } from "@/lib/bookings/policy";
import {
  formatFlightDateTime,
  formatFlightTime,
  formatPrice,
} from "@/lib/flights/format";

interface DashboardContentProps {
  email: string;
  summary: DashboardSummary;
  bookingsError: string | null;
}

export function DashboardContent({
  email,
  summary,
  bookingsError,
}: DashboardContentProps) {
  const firstName = email.split("@")[0]?.split(".")[0] ?? "there";
  const greeting = getGreeting();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-sky-600 dark:text-sky-400">
          {greeting}
        </p>
        <h1 className="mt-1 text-2xl font-bold capitalize text-slate-900 dark:text-white sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {summary.upcomingCount > 0
            ? `You have ${summary.upcomingCount} upcoming trip${summary.upcomingCount === 1 ? "" : "s"}.`
            : "Search flights and book your next trip."}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Upcoming trips"
          value={summary.upcomingCount}
          icon={<PlaneTakeoff className="h-5 w-5" aria-hidden />}
          accent="sky"
        />
        <StatCard
          label="Confirmed"
          value={summary.confirmedCount}
          icon={<Ticket className="h-5 w-5" aria-hidden />}
          accent="emerald"
        />
        <StatCard
          label="Total bookings"
          value={summary.totalBookings}
          icon={<Calendar className="h-5 w-5" aria-hidden />}
          accent="slate"
        />
        <StatCard
          label="Needs attention"
          value={summary.actionableCount}
          icon={<Plane className="h-5 w-5" aria-hidden />}
          accent="amber"
          hint="Can reschedule or cancel"
        />
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {bookingsError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              Could not load bookings: {bookingsError}
            </div>
          ) : summary.nextBooking ? (
            <NextTripCard booking={summary.nextBooking} />
          ) : (
            <EmptyState
              title="No upcoming trips"
              description="Find a flight and reserve a seat to see your next trip here."
              icon="flight"
              action={
                <Link
                  href="/flights"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  Search flights
                </Link>
              }
            />
          )}

          {summary.upcomingBookings.length > 1 ? (
            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  More upcoming
                </h2>
                <Link
                  href="/my-bookings"
                  className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
                >
                  View all
                </Link>
              </div>
              <ul className="space-y-3">
                {summary.upcomingBookings.slice(1).map((booking) => (
                  <UpcomingBookingRow key={booking.id} booking={booking} />
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Quick actions
            </h2>
            <nav className="mt-4 flex flex-col gap-2">
              <QuickAction
                href="/flights"
                icon={<Search className="h-4 w-4" aria-hidden />}
                title="Search flights"
                description="Browse routes and fares"
              />
              <QuickAction
                href="/my-bookings"
                icon={<Ticket className="h-4 w-4" aria-hidden />}
                title="My bookings"
                description="Manage or change trips"
              />
              {summary.nextBooking ? (
                <QuickAction
                  href={`/booking-confirmation?pnr=${encodeURIComponent(summary.nextBooking.pnr_code)}`}
                  icon={<Plane className="h-4 w-4" aria-hidden />}
                  title="View next ticket"
                  description={`PNR ${summary.nextBooking.pnr_code}`}
                />
              ) : null}
            </nav>
          </div>

          {summary.cancelledCount > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
              <p className="font-medium text-slate-900 dark:text-white">
                Trip history
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                {summary.cancelledCount} cancelled booking
                {summary.cancelledCount === 1 ? "" : "s"} on record. Past and
                cancelled trips are in My bookings.
              </p>
              <Link
                href="/my-bookings"
                className="mt-3 inline-flex text-sm font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
              >
                Open bookings →
              </Link>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function StatCard({
  label,
  value,
  icon,
  accent,
  hint,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: "sky" | "emerald" | "slate" | "amber";
  hint?: string;
}) {
  const accents = {
    sky: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    amber:
      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          {hint ? (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {hint}
            </p>
          ) : null}
        </div>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${accents[accent]}`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

function NextTripCard({ booking }: { booking: UserBooking }) {
  const flight = booking.flights;
  const seat = booking.seats;
  const hoursLeft = flight ? hoursUntilDeparture(flight.departs_at) : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-600 to-sky-800 text-white shadow-lg dark:border-sky-900">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-sky-100">Next trip</p>
            <p className="mt-1 text-2xl font-bold">
              {flight
                ? `${flight.origin} → ${flight.destination}`
                : "Flight details"}
            </p>
          </div>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur">
            PNR {booking.pnr_code}
          </span>
        </div>

        {flight ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-sky-100">Departure</p>
              <p className="text-lg font-semibold">
                {formatFlightTime(flight.departs_at)}
              </p>
              <p className="text-sm text-sky-100">
                {formatFlightDateTime(flight.departs_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-sky-100">Flight</p>
              <p className="text-lg font-semibold">{flight.flight_no}</p>
              {seat ? (
                <p className="text-sm text-sky-100">Seat {seat.seat_number}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {hoursLeft !== null && hoursLeft > 0 ? (
            <span className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur">
              {hoursLeft < 24
                ? `${Math.round(hoursLeft)}h until departure`
                : `${Math.round(hoursLeft / 24)}d until departure`}
            </span>
          ) : null}
          <span className="text-sm font-medium">
            {formatPrice(booking.total_price)} total
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/booking-confirmation?pnr=${encodeURIComponent(booking.pnr_code)}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-sky-800 hover:bg-sky-50"
          >
            View ticket
          </Link>
          <Link
            href="/my-bookings"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-white/40 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Manage booking
          </Link>
        </div>
      </div>
    </div>
  );
}

function UpcomingBookingRow({ booking }: { booking: UserBooking }) {
  const flight = booking.flights;

  return (
    <li>
      <Link
        href="/my-bookings"
        className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-sky-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-800"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300">
          <Plane className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900 dark:text-white">
              {flight
                ? `${flight.origin} → ${flight.destination}`
                : `PNR ${booking.pnr_code}`}
            </p>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="mt-0.5 truncate text-sm text-slate-600 dark:text-slate-400">
            {flight
              ? `${flight.flight_no} · ${formatFlightDateTime(flight.departs_at)}`
              : formatFlightDateTime(booking.booked_at)}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      </Link>
    </li>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition hover:border-sky-200 hover:bg-sky-50/80 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-sky-900 dark:hover:bg-sky-950/50"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600 shadow-sm dark:bg-slate-900">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
    </Link>
  );
}
