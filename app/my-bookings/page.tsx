import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MyBookingsOfflineShell } from "@/components/pwa/my-bookings-offline-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { fetchUserBookings } from "@/lib/bookings/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My bookings | Flight Management",
  description: "View and manage your flight reservations",
};

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/my-bookings");
  }

  const { bookings, error } = await fetchUserBookings();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              My bookings
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Manage reservations, reschedule flights, or cancel when allowed.
            </p>
          </div>
          <Link
            href="/flights"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Book a flight
          </Link>
        </div>

        <MyBookingsOfflineShell
          initialBookings={bookings}
          fetchError={error}
        />
      </main>
    </div>
  );
}
