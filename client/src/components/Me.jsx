"use client";

import { updateUserData } from "@/store/services/userService";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Input from "./ui/Input";
import Select from "./ui/Select";
import { Toaster, toast } from "react-hot-toast";
import Button from "./ui/Button";
import Image from "next/image";
import { countriesOptions, languageOptions } from "./SearchUser";

const genderOptions = [
  { label: "Select Gender", value: "" },
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Non-Binary", value: "Non-Binary" },
  { label: "Other", value: "Other" },
];

const Me = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [formError, setFormError] = useState("");
  const [user, setUser] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setPhotoPreview(
          parsedUser.photo
            ? `http://localhost:8000/images/users/${parsedUser.photo}`
            : null
        );

        const formattedBirthdate = parsedUser.birthdate
          ? new Date(parsedUser.birthdate).toISOString().split("T")[0]
          : "";

        reset({
          ...parsedUser,
          birthdate: formattedBirthdate,
          country: parsedUser.country || "",
          learningLanguage: parsedUser.learningLanguage || [],
          fluentIn: parsedUser.fluentIn || [],
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [reset]);

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    const { password, photo, ...filteredData } = data;
    const formData = new FormData();

    for (const key in filteredData) {
      formData.append(key, filteredData[key]);
    }
    if (photo?.[0]) {
      formData.append("photo", photo[0]);
    }

    try {
      const result = await updateUserData(formData);
      toast.success("User updated successfully!");
      return result;
    } catch (error) {
      toast.error("Failed to update user!");
      setFormError(error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 rounded-lg">
      <div className="flex justify-center mb-4">
        {photoPreview && (
          <Image
            src={photoPreview}
            alt="User Photo"
            width={128}
            height={128}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border border-gray-300"
          />
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          name="name"
          {...register("name", { required: "Name is required" })}
          placeholder="Name"
          defaultValue={user?.name}
        />

        <Input
          name="email"
          type="email"
          {...register("email", { required: "Email is required" })}
          placeholder="Email"
          defaultValue={user?.email}
        />

        <Input
          type="file"
          name="photo"
          {...register("photo")}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          onChange={handlePhotoChange}
        />

        <div>
          <label htmlFor="birthdate" className="block text-md font-medium">
            Birthdate <span>(YYYY-MM-DD)</span>
          </label>
          <Input
            type="date"
            name="birthdate"
            {...register("birthdate", {
              required: "Birthdate is required",
            })}
            defaultValue={
              user?.birthdate
                ? new Date(user.birthdate).toISOString().split("T")[0]
                : ""
            }
          />
        </div>

        <Select
          label="Country"
          name="country"
          options={countriesOptions}
          register={register}
        />

        <Select
          name="gender"
          label="Gender"
          options={genderOptions}
          register={register}
          required
          defaultValue={user?.gender}
        />

        <Select
          label="Learning Language"
          name="learningLanguage"
          options={languageOptions}
          register={register}
          defaultValue={user?.learningLanguage}
          required
        />

        <Select
          label="Fluent In"
          name="fluentIn"
          options={languageOptions}
          register={register}
          defaultValue={user?.fluentIn}
          required
        />

        {formError && <span className="text-red-500 text-sm">{formError}</span>}

        <Button type="submit" className="w-full">
          Update Me
        </Button>
      </form>
    </div>
  );
};

export default Me;
