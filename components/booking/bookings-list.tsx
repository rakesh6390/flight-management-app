"use client";

import { useState } from "react";

import { BookingCard } from "@/components/booking/booking-card";
import type { UserBooking } from "@/lib/bookings/queries";
import { cn } from "@/lib/utils";

interface BookingsListProps {
  bookings: UserBooking[];
}

type TabKey = "upcoming" | "past" | "all";

function classifyBooking(booking: UserBooking): "upcoming" | "past" {
  if (booking.status === "cancelled") {
    return "past";
  }

  const departsAt = booking.flights?.departs_at;
  if (!departsAt) {
    return booking.status === "completed" ? "past" : "upcoming";
  }

  return new Date(departsAt).getTime() < Date.now() ? "past" : "upcoming";
}

export function BookingsList({ bookings }: BookingsListProps) {
  const upcoming = bookings.filter((booking) => classifyBooking(booking) === "upcoming");
  const past = bookings.filter((booking) => classifyBooking(booking) === "past");

  return <TabsLayout upcoming={upcoming} past={past} all={bookings} />;
}

function TabsLayout({
  upcoming,
  past,
  all,
}: {
  upcoming: UserBooking[];
  past: UserBooking[];
  all: UserBooking[];
}) {
  const [tab, setTab] = useState<TabKey>("upcoming");

  const groups: Record<TabKey, UserBooking[]> = {
    upcoming,
    past,
    all,
  };

  const active = groups[tab];

  return (
    <div>
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Booking filters"
      >
        <TabButton
          active={tab === "upcoming"}
          onClick={() => setTab("upcoming")}
          label={`Upcoming (${upcoming.length})`}
        />
        <TabButton
          active={tab === "past"}
          onClick={() => setTab("past")}
          label={`Past & cancelled (${past.length})`}
        />
        <TabButton
          active={tab === "all"}
          onClick={() => setTab("all")}
          label={`All (${all.length})`}
        />
      </div>

      <div className="mt-6 space-y-5" role="tabpanel">
        {active.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-semibold transition",
        active
          ? "bg-sky-600 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      )}
    >
      {label}
    </button>
  );
}
