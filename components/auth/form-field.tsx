"use client";

import { cn } from "@/lib/utils";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({
  label,
  error,
  className,
  id,
  ...props
}: FormFieldProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          "block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition",
          "placeholder:text-slate-400",
          "focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
          "disabled:cursor-not-allowed disabled:opacity-60",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-slate-200 dark:border-slate-700",
          "dark:bg-slate-900 dark:text-slate-100",
          className
        )}
        {...props}
      />
      {error ? (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
