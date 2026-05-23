import Link from "next/link";

import { SearchForm } from "@/components/flights/search-form";
import { SiteHeader } from "@/components/layout/site-header";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-br from-sky-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div className="text-center lg:text-left">
              <p className="mb-3 inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                Flight Management
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
                Book your next flight with confidence
              </h1>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                Search scheduled flights, compare cabins, and reserve seats in
                seconds. Your search is saved automatically.
              </p>
              <div className="mt-8 hidden flex-wrap gap-3 lg:flex">
                <FeatureChip>Real-time seat maps</FeatureChip>
                <FeatureChip>Secure bookings</FeatureChip>
                <FeatureChip>Manage trips</FeatureChip>
              </div>
            </div>

            <div>
              <SearchForm variant="hero" syncUrlOnSubmit />
              <p className="mt-4 text-center text-xs text-slate-500 lg:text-left dark:text-slate-400">
                Popular:{" "}
                <Link
                  href="/flights?origin=JFK&destination=LAX&departureDate=2026-06-01&passengers=1"
                  className="font-medium text-sky-600 hover:underline dark:text-sky-400"
                >
                  JFK → LAX
                </Link>
                {" · "}
                <Link
                  href="/flights?origin=LHR&destination=CDG&departureDate=2026-06-02&passengers=1"
                  className="font-medium text-sky-600 hover:underline dark:text-sky-400"
                >
                  LHR → CDG
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
      {children}
    </span>
  );
}
