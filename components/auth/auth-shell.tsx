import { Plane } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-br from-sky-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="px-4 py-6 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-sky-700 dark:text-slate-100 dark:hover:text-sky-400"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm">
            <Plane className="h-4 w-4" aria-hidden />
          </span>
          Flight Management
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-12 pt-2 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <div className="mb-8 text-center sm:text-left">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {subtitle}
              </p>
            </div>
            {children}
          </div>
          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            {footer}
          </div>
        </div>
      </main>
    </div>
  );
}
