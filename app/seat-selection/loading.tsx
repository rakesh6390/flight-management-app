import { SiteHeader } from "@/components/layout/site-header";

export default function SeatSelectionLoading() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-3 h-8 w-56 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-2 h-4 w-72 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="h-6 w-40 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-5 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 p-5 dark:border-slate-800 dark:bg-slate-950">
            <div className="mx-auto h-10 w-48 rounded-full bg-white dark:bg-slate-900" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 10 }).map((_, row) => (
                <div key={row} className="flex justify-center gap-2">
                  {Array.from({ length: 6 }).map((__, seat) => (
                    <div
                      key={seat}
                      className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-800"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
