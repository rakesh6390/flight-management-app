import { Plane, RefreshCw, WifiOff } from "lucide-react";
import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { OfflineRetryButton } from "@/components/pwa/offline-retry-button";

export const metadata = {
  title: "Offline | Flight Management",
  description: "You are currently offline",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <WifiOff className="h-8 w-8" aria-hidden />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
          You&apos;re offline
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Flight search needs a connection. Your last saved bookings are still
          available on My bookings if you opened them while online.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <OfflineRetryButton />
          <Link
            href="/my-bookings"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <Plane className="h-4 w-4" aria-hidden />
            My bookings
          </Link>
        </div>
        <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Reconnecting will reload the app automatically
        </p>
      </main>
    </div>
  );
}
