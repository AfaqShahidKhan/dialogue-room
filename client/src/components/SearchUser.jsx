"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { fetchAllUsers } from "@/store/services/userService";

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

  const onSubmit = async (data) => {
    console.log("Form Data:", data);

    const response = await fetchAllUsers();

    if (response.success) {
      setUsers(response.users.data);
    }

    console.log("Users are", response.users.data);
  };

  return (
    <div className="p-6 max-w-lg mx-auto shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Search Users</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Country"
          name="country"
          options={countries}
          register={register}
          required
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

      {users.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Results:</h3>
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user._id} className="p-2 border rounded-md">
                {user.name} - {user.country} - {user.age} years old
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchUser;
