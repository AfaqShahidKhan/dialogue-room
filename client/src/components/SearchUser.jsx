"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { fetchAllUsers } from "@/store/services/userService";
import toast from "react-hot-toast";
import Image from "next/image";
import UserCard from "./ui/UserCard";
import { postFriendRequest } from "@/store/services/friendService";

const selectGenderOption = [
  { label: "Select Gender", value: "" },
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Non-Binary", value: "Non-Binary" },
  { label: "Other", value: "Other" },
];

import countriesData from "@/utils/countryMockData.json";

export const countriesOptions = [
  { label: "Select Country", value: "" },
  ...countriesData.countries.map((country) => ({
    label: country.name,
    value: country.name,
  })),
];

const languageSet = new Set();
countriesData.countries.forEach((country) => {
  country.languages.forEach((lang) => languageSet.add(lang));
});

export const languageOptions = [
  { label: "Select Language", value: "" },
  ...Array.from(languageSet).map((lang) => ({
    label: lang,
    value: lang,
  })),
];

const SearchUser = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      country: "",
      gender: "",
      age: "",
      learningLanguage: "",
      fluentIn: "",
    },
  });
  const [users, setUsers] = useState([]);
  const pathname = usePathname();
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  const handleSendFriendRequest = async (userId) => {
    const result = await postFriendRequest(userId);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const onSubmit = async (data) => {
    try {
      console.log("Form Data:", data);

      const queryParams = [];

      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            // Handle array values (e.g., for the `country` field)
            value.forEach((val) => {
              if (val) {
                const encodedValue = val.replace(/ /g, "+");
                queryParams.push(`${key}=${encodedValue}`);
              }
            });
          } else {
            // Handle string values
            const encodedValue = value.replace(/ /g, "+");
            if (key === "age") {
              queryParams.push(`age[lte]=${encodedValue}`);
            } else {
              queryParams.push(`${key}=${encodedValue}`);
            }
          }
        }
      });

      const queryString = queryParams.join("&");

      router.push(`${pathname}?${queryString}`);

      console.log(`Updated URL: ${pathname}?${queryString}`);

      // Fetch users based on new search criteria
      const response = await fetchAllUsers(queryString);

      if (response.success) {
        toast.success("Searched successfully!");
        setUsers(response.users.data);
      } else {
        console.error("Failed to fetch users:", response);
      }

      console.log("Users are", response.users.data);
    } catch (error) {
      toast.error("Searching failed");
      console.error("Error in onSubmit:", error);
    }
  };

  return (
    <>
      <div className="p-6 shadow-md rounded-md">
        <h2 className="text-xl font-bold mb-4">Search Users</h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 sm:max-w-screen-sm md:max-w-screen-md mx-auto"
        >
          <Select
            label="Country"
            name="country"
            options={countriesOptions}
            register={register}
            multiple
          />

          <Select
            label="Gender"
            name="gender"
            options={selectGenderOption}
            register={register}
          />

          <Input
            label="Max Age"
            name="age"
            type="number"
            placeholder="Enter maximum age"
            {...register("age")}
          />

          <Select
            label="Learning Language"
            name="learningLanguage"
            options={languageOptions}
            register={register}
          />

          <Select
            label="Fluent In"
            name="fluentIn"
            options={languageOptions}
            register={register}
          />

          <Button type="submit" className="w-full">
            Search
          </Button>
        </form>
      </div>

      {users && (
        <div className="mt-6 mx-auto max-w-6xl px-4">
          <h3 className="text-xl font-bold mb-4 text-center sm:text-left">
            Results:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {users.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                sendFriendRequest={handleSendFriendRequest}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default SearchUser;
