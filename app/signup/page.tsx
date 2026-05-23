import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Create account | Flight Management",
  description: "Create an account to book and manage flights",
};

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join to search flights, reserve seats, and manage trips."
      footer={
        <p>
          Already registered?{" "}
          <a
            href="/login"
            className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
          >
            Sign in
          </a>
        </p>
      }
    >
      <Suspense fallback={<SignupFormFallback />}>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}

function SignupFormFallback() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
      <div className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
      <div className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
      <div className="h-10 rounded-lg bg-sky-200 dark:bg-sky-900" />
    </div>
  );
}
