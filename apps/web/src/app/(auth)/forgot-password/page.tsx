"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@dialogue-room/shared";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordInput) {
    try {
      await api.post("/auth/forgot-password", values);
      setSent(true);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Something went wrong");
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Check your email
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          If that email exists, a reset link was sent.
        </p>
        <Link
          href="/login"
          className="rounded text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 dark:text-brand-400 dark:hover:text-brand-300 dark:focus-visible:ring-offset-slate-900"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Forgot password
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          className="h-11"
          error={errors.email?.message}
          {...register("email")}
        />
        <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-1 w-full">
          Send reset link
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="rounded font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 dark:text-brand-400 dark:hover:text-brand-300 dark:focus-visible:ring-offset-slate-900"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
