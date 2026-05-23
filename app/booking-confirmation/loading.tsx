import { SiteHeader } from "@/components/layout/site-header";

export default function BookingConfirmationLoading() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="animate-pulse rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40">
          <div className="h-5 w-32 rounded bg-emerald-200 dark:bg-emerald-900" />
          <div className="mt-3 h-8 w-56 rounded bg-emerald-200 dark:bg-emerald-900" />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-6 w-40 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-5 space-y-4">
                <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-3/5 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
