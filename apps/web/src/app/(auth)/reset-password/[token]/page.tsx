"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { resetPasswordSchema, type ResetPasswordInput } from "@dialogue-room/shared";
import type { Me } from "@dialogue-room/shared";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(values: ResetPasswordInput) {
    try {
      const { user } = await api.patch<{ user: Me }>(
        `/auth/reset-password/${params.token}`,
        values,
      );
      setUser(user);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Password reset successfully");
      router.push("/home");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to reset password");
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Reset password
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Choose a new password below.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          className="h-11"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          className="h-11"
          error={errors.passwordConfirm?.message}
          {...register("passwordConfirm")}
        />
        <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-1 w-full">
          Reset password
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        <Link
          href="/login"
          className="rounded font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 dark:text-brand-400 dark:hover:text-brand-300 dark:focus-visible:ring-offset-slate-900"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}
