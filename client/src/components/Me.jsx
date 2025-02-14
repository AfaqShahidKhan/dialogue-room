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

const selectGenderOption = [
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
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        reset(parsedUser);
        setPhotoPreview(
          parsedUser.photo
            ? `http://localhost:8000/images/users/${parsedUser.photo}`
            : null
        );

        console.log(`user is ${JSON.stringify(parsedUser.name)}`);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [reset]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();
        const countryOptions = data.map((country) => ({
          label: country.name.common,
          value: country.name.common,
        }));
        setCountries([
          { label: "Select Country", value: "" },
          ...countryOptions,
        ]);

        const languageSet = new Set();
        data.forEach((country) => {
          if (country.languages) {
            Object.values(country.languages).forEach((lang) =>
              languageSet.add(lang)
            );
          }
        });
        const languageOptions = Array.from(languageSet).map((lang) => ({
          label: lang,
          value: lang,
        }));
        setLanguages([
          { label: "Select Language", value: "" },
          ...languageOptions,
        ]);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    console.log("Submitted user data:", data);
    const { password, photo, ...filteredData } = data;

    const formData = new FormData();
    for (const key in filteredData) {
      formData.append(key, filteredData[key]);
    }
    if (photo[0]) {
      console.log("Photo file:", photo[0]);
      console.log("Photo name:", photo[0].name);
      console.log("Photo type:", photo[0].type);
      console.log("Photo size:", photo[0].size);      
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
    <>
      <div className="max-w-2xl mx-auto p-6 mt-10 rounded-lg ">
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
          <Select
            name="country"
            label="Country"
            options={countries}
            register={register}
            required
            defaultValue={user?.country}
          />
          <Select
            name="gender"
            label="Gender"
            options={selectGenderOption}
            register={register}
            required
            defaultValue={user?.gender}
          />
          <Select
            name="learningLanguage"
            label="Learning Language"
            options={languages}
            register={register}
            required
            multiple
            defaultValue={user?.learningLanguage}
          />
          <Select
            name="fluentIn"
            label="Fluent In"
            options={languages}
            register={register}
            required
            multiple
            defaultValue={user?.fluentIn}
          />
          {formError && (
            <span className="text-red-500 text-sm">{formError}</span>
          )}
          <Button type="submit" className="w-full">
            Update Me
          </Button>
        </form>
      </div>
    </>
  );
};

export default Me;
