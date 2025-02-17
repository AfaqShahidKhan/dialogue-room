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

const selectGenderOption = [
  { label: "Select Gender", value: "" },
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Non-Binary", value: "Non-Binary" },
  { label: "Other", value: "Other" },
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
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const pathname = usePathname();
  const router = useRouter();
  const currentSearchParams = useSearchParams();
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


  const sendFriendRequest = async()=>{
    console.log('this');
    
  }


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
      <div className="p-6 max-w-lg mx-auto shadow-md rounded-md">
        <h2 className="text-xl font-bold mb-4">Search Users</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Country"
            name="country"
            options={countries}
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
            options={languages}
            register={register}
          />

          <Select
            label="Fluent In"
            name="fluentIn"
            options={languages}
            register={register}
          />

          <Button type="submit" className="w-full">
            Search
          </Button>
        </form>
      </div>

      {users && (
        <div className="mt-6 mx-auto max-w-6xl px-4">
        <h3 className="text-xl font-bold mb-4 text-center sm:text-left">Results:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex flex-col items-center sm:flex-row gap-4 p-4 border rounded-lg shadow-sm hover:shadow-md transition-all bg-white"
            >
              <Image
                src={`${
                  process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000"
                }/images/users/${user.photo}`}
                alt={user.name}
                width={48}
                height={48}
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div className="text-center sm:text-left flex-1">
                <h4 className="text-lg font-semibold">{user.name}</h4>
                <p className="text-sm text-gray-600">{user.country} - {user.age} years old</p>
                <p className="text-sm"><span className="font-medium">Fluent In:</span> {user.fluentIn}</p>
                <p className="text-sm"><span className="font-medium">Interested In:</span> {user.learningLanguage}</p>
              </div>
              <button
                className="mt-2 sm:mt-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all"
                onClick={() => sendFriendRequest(user._id)}
              >
                Send Request
              </button>
            </div>
          ))}
        </div>
      </div>
      
      
      )}
    </>
  );
};

export default SearchUser;
