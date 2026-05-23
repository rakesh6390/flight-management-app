import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { SiteHeader } from "@/components/layout/site-header";
import { summarizeBookings } from "@/lib/bookings/dashboard";
import { fetchUserBookings } from "@/lib/bookings/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard | Flight Management",
  description: "Your trips, bookings, and quick actions",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const { bookings, error } = await fetchUserBookings();
  const summary = summarizeBookings(bookings);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <DashboardContent
          email={user.email ?? "traveler"}
          summary={summary}
          bookingsError={error}
        />
      </main>
    </div>
  );
}
