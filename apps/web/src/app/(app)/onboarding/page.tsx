"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { COUNTRIES, GENDERS, LANGUAGES } from "@dialogue-room/shared";
import type { Me } from "@dialogue-room/shared";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";

interface OnboardingForm {
  birthdate: string;
  country: string;
  gender: string;
  fluentLanguages: string[];
  learningLanguages: string[];
  bio: string;
}

const countryOptions = COUNTRIES.map((c) => ({ value: c, label: c }));
const genderOptions = GENDERS.map((g) => ({ value: g, label: g }));

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [languageError, setLanguageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingForm>({
    defaultValues: {
      birthdate: "",
      country: "",
      gender: "",
      fluentLanguages: [],
      learningLanguages: [],
      bio: "",
    },
  });

  async function onSubmit(values: OnboardingForm) {
    if (values.fluentLanguages.length === 0 || values.learningLanguages.length === 0) {
      setLanguageError("Select at least one fluent and one learning language");
      return;
    }
    setLanguageError(null);

    try {
      const { user } = await api.patch<{ user: Me }>("/users/me", {
        birthdate: values.birthdate || undefined,
        country: values.country || undefined,
        gender: values.gender || undefined,
        fluentLanguages: values.fluentLanguages,
        learningLanguages: values.learningLanguages,
        bio: values.bio || undefined,
      });
      queryClient.setQueryData(["me"], user);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/home");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to save your profile");
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Complete your profile
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400">
          Tell us a bit about yourself so we can match you with the right learners.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
        noValidate
      >
        <Input
          label="Birthdate"
          type="date"
          error={errors.birthdate?.message}
          {...register("birthdate", { required: "Birthdate is required" })}
        />

        <Controller
          name="country"
          control={control}
          rules={{ required: "Country is required" }}
          render={({ field }) => (
            <Select
              label="Country"
              placeholder="Select your country"
              options={countryOptions}
              error={errors.country?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="gender"
          control={control}
          rules={{ required: "Gender is required" }}
          render={({ field }) => (
            <Select
              label="Gender"
              placeholder="Select your gender"
              options={genderOptions}
              error={errors.gender?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="fluentLanguages"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Fluent languages"
              options={[...LANGUAGES]}
              value={field.value}
              onChange={field.onChange}
              placeholder="Languages you speak fluently"
            />
          )}
        />

        <Controller
          name="learningLanguages"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Learning languages"
              options={[...LANGUAGES]}
              value={field.value}
              onChange={field.onChange}
              placeholder="Languages you're learning"
            />
          )}
        />
        {languageError && <p className="text-xs text-rose-600 dark:text-rose-400">{languageError}</p>}

        <TextArea label="Bio (optional)" rows={4} {...register("bio")} />

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Finish setup
        </Button>
      </form>
    </div>
  );
}
