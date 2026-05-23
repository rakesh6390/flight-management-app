import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Authentication failed
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          The sign-in link may have expired or already been used. Please try
          again.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
