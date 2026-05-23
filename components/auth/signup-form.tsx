"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { signUp } from "@/actions/auth";
import { FormField } from "@/components/auth/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? undefined;
  const [isPending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);

  const loading = isPending || submitting;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setSubmitting(true);
    startTransition(async () => {
      try {
        const result = await signUp(values, redirectTo);

        if (result?.error) {
          toast.error(result.error);
          return;
        }

        if (result?.success) {
          toast.success(result.success);
          router.push("/login");
        }
      } catch {
        // redirect() on immediate session
      } finally {
        setSubmitting(false);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        disabled={loading}
        error={errors.email?.message}
        {...register("email")}
      />

      <PasswordInput
        label="Password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        disabled={loading}
        error={errors.password?.message}
        {...register("password")}
      />

      <PasswordInput
        label="Confirm password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        disabled={loading}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Use 8+ characters with uppercase, lowercase, and a number.
      </p>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition",
          "hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600",
          "disabled:cursor-not-allowed disabled:opacity-70"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </button>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          href={
            redirectTo
              ? `/login?redirect=${encodeURIComponent(redirectTo)}`
              : "/login"
          }
          className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
