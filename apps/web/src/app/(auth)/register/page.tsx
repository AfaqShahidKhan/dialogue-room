"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { signupSchema, type SignupInput } from "@dialogue-room/shared";
import type { Me } from "@dialogue-room/shared";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { agreedToTerms: false },
  });

  async function onSubmit(values: SignupInput) {
    try {
      const { user } = await api.post<{ user: Me }>("/auth/signup", values);
      setUser(user);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/home");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to sign up");
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Create an account
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Start practicing languages with real people.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="Name"
          autoComplete="name"
          className="h-11"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          className="h-11"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          className="h-11"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          className="h-11"
          error={errors.passwordConfirm?.message}
          {...register("passwordConfirm")}
        />
        <Checkbox
          label={
            <>
              I agree to the{" "}
              <Link
                href="/terms"
                className="rounded text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 dark:text-brand-400 dark:hover:text-brand-300 dark:focus-visible:ring-offset-slate-900"
              >
                Terms and Conditions
              </Link>
            </>
          }
          error={errors.agreedToTerms?.message}
          {...register("agreedToTerms")}
        />
        <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-1 w-full">
          Sign up
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
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
