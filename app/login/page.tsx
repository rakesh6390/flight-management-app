import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign in | Flight Management",
  description: "Sign in to manage your flight bookings",
};

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to view bookings and reserve seats."
      footer={
        <p>
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      }
    >
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}

function LoginFormFallback() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
      <div className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
      <div className="h-10 rounded-lg bg-sky-200 dark:bg-sky-900" />
    </div>
  );
}
