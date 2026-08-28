"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { COUNTRIES, GENDERS, LANGUAGES } from "@dialogue-room/shared";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { DiscoveryFilters } from "@/hooks/useDiscovery";

const countryOptions = COUNTRIES.map((c) => ({ value: c, label: c }));
const genderOptions = GENDERS.map((g) => ({ value: g, label: g }));
const languageOptions = LANGUAGES.map((l) => ({ value: l, label: l }));

export interface SearchFiltersState {
  q: string;
  country: string;
  gender: string;
  minAge: string;
  maxAge: string;
  fluentLanguage: string;
  learningLanguage: string;
}

export const EMPTY_FILTERS: SearchFiltersState = {
  q: "",
  country: "",
  gender: "",
  minAge: "",
  maxAge: "",
  fluentLanguage: "",
  learningLanguage: "",
};

export function toDiscoveryFilters(state: SearchFiltersState, page: number): DiscoveryFilters {
  return {
    q: state.q || undefined,
    country: state.country || undefined,
    gender: state.gender || undefined,
    minAge: state.minAge ? Number(state.minAge) : undefined,
    maxAge: state.maxAge ? Number(state.maxAge) : undefined,
    fluentLanguage: state.fluentLanguage || undefined,
    learningLanguage: state.learningLanguage || undefined,
    page,
  };
}

function hasActiveFilters(state: SearchFiltersState): boolean {
  return Object.values(state).some((v) => v !== "");
}

interface SearchFiltersProps {
  value: SearchFiltersState;
  onChange: (next: SearchFiltersState) => void;
}

export function SearchFiltersCard({ value, onChange }: SearchFiltersProps) {
  const [nameInput, setNameInput] = useState(value.q);

  // 400ms debounce on the name search field only.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (nameInput !== value.q) {
        onChange({ ...value, q: nameInput });
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameInput]);

  useEffect(() => {
    setNameInput(value.q);
  }, [value.q]);

  function set<K extends keyof SearchFiltersState>(key: K, next: SearchFiltersState[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Filters
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Narrow down learners by name, location and languages.
          </p>
        </div>
        {hasActiveFilters(value) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="animate-in-fade shrink-0 gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          label="Name"
          placeholder="Search by name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />

        <Select
          label="Country"
          placeholder="Any country"
          options={countryOptions}
          value={value.country}
          onChange={(e) => set("country", e.target.value)}
        />

        <Select
          label="Gender"
          placeholder="Any gender"
          options={genderOptions}
          value={value.gender}
          onChange={(e) => set("gender", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Min age"
            type="number"
            min={13}
            max={120}
            placeholder="18"
            value={value.minAge}
            onChange={(e) => set("minAge", e.target.value)}
          />

          <Input
            label="Max age"
            type="number"
            min={13}
            max={120}
            placeholder="99"
            value={value.maxAge}
            onChange={(e) => set("maxAge", e.target.value)}
          />
        </div>

        <Select
          label="Fluent in"
          placeholder="Any language"
          options={languageOptions}
          value={value.fluentLanguage}
          onChange={(e) => set("fluentLanguage", e.target.value)}
        />

        <Select
          label="Learning"
          placeholder="Any language"
          options={languageOptions}
          value={value.learningLanguage}
          onChange={(e) => set("learningLanguage", e.target.value)}
        />
      </div>
    </div>
  );
}
