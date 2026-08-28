"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import {
  COUNTRIES,
  GENDERS,
  LANGUAGES,
  updatePasswordSchema,
  type UpdatePasswordInput,
} from "@dialogue-room/shared";
import type { Me } from "@dialogue-room/shared";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useMe } from "@/hooks/useMe";
import { api, ApiError } from "@/lib/api";

interface ProfileForm {
  name: string;
  bio: string;
  country: string;
  gender: string;
  birthdate: string;
  fluentLanguages: string[];
  learningLanguages: string[];
}

const countryOptions = COUNTRIES.map((c) => ({ value: c, label: c }));
const genderOptions = GENDERS.map((g) => ({ value: g, label: g }));

function toDateInputValue(value?: string) {
  if (!value) return "";
  return value.slice(0, 10);
}

export default function ProfilePage() {
  const { data: user } = useMe();
  const queryClient = useQueryClient();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    values: user
      ? {
          name: user.name,
          bio: user.bio ?? "",
          country: user.country ?? "",
          gender: user.gender ?? "",
          birthdate: toDateInputValue(user.birthdate),
          fluentLanguages: user.fluentLanguages,
          learningLanguages: user.learningLanguages,
        }
      : undefined,
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<UpdatePasswordInput>({ resolver: zodResolver(updatePasswordSchema) });

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function onSubmit(values: ProfileForm) {
    if (!user) return;
    try {
      const formData = new FormData();
      if (values.name !== user.name) formData.append("name", values.name);
      if ((values.bio ?? "") !== (user.bio ?? "")) formData.append("bio", values.bio);
      if ((values.country ?? "") !== (user.country ?? "")) formData.append("country", values.country);
      if ((values.gender ?? "") !== (user.gender ?? "")) formData.append("gender", values.gender);
      if (toDateInputValue(user.birthdate) !== values.birthdate && values.birthdate) {
        formData.append("birthdate", values.birthdate);
      }
      formData.append("fluentLanguages", JSON.stringify(values.fluentLanguages));
      formData.append("learningLanguages", JSON.stringify(values.learningLanguages));
      if (photoFile) formData.append("photo", photoFile);

      const { user: updated } = await api.patch<{ user: Me }>("/users/me", formData);
      queryClient.setQueryData(["me"], updated);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      setPhotoFile(null);
      setPhotoPreview(null);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to update profile");
    }
  }

  async function onPasswordSubmit(values: UpdatePasswordInput) {
    try {
      await api.patch("/auth/update-password", values);
      toast.success("Password updated");
      resetPasswordForm();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to update password");
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Your profile
        </h1>
        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
          Update your details so language learners get to know you.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
        noValidate
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            {photoPreview ? (
              <span className="relative inline-block size-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <Image src={photoPreview} alt="New avatar preview" fill className="object-cover" unoptimized />
              </span>
            ) : (
              <Avatar photo={user.photo} name={user.name} size={64} />
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm ring-2 ring-white transition-colors duration-150 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 dark:ring-slate-900 dark:focus-visible:ring-offset-slate-900"
              aria-label="Change photo"
            >
              <Camera className="size-3.5" aria-hidden="true" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
        </div>

        <Input label="Name" error={errors.name?.message} {...register("name")} />

        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <Select label="Country" placeholder="Select your country" options={countryOptions} {...field} />
          )}
        />

        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Select label="Gender" placeholder="Select your gender" options={genderOptions} {...field} />
          )}
        />

        <Input label="Birthdate" type="date" {...register("birthdate")} />

        <Controller
          name="fluentLanguages"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Fluent languages"
              options={[...LANGUAGES]}
              value={field.value}
              onChange={field.onChange}
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
            />
          )}
        />

        <TextArea label="Bio" rows={4} {...register("bio")} />

        <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-fit">
          Save changes
        </Button>
      </form>

      <form
        onSubmit={handlePasswordSubmit(onPasswordSubmit)}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
        noValidate
      >
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Change password
        </h2>
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          error={passwordErrors.currentPassword?.message}
          {...registerPassword("currentPassword")}
        />
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          error={passwordErrors.password?.message}
          {...registerPassword("password")}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={passwordErrors.passwordConfirm?.message}
          {...registerPassword("passwordConfirm")}
        />
        <Button type="submit" isLoading={isPasswordSubmitting} className="w-full sm:w-fit">
          Update password
        </Button>
      </form>
    </div>
  );
}
