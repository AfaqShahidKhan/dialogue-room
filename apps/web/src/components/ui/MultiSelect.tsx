"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface MultiSelectProps {
  label?: string;
  error?: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOption(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  }

  function removeOption(option: string) {
    onChange(value.filter((v) => v !== option));
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)} ref={containerRef}>
      {label && (
        <label id={`${id}-label`} className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={label ? `${id}-label` : undefined}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-left text-sm shadow-sm transition-colors duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-900",
            error && "border-rose-500",
          )}
        >
          {value.length === 0 && (
            <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
          )}
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-md bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900 dark:text-brand-200"
            >
              {v}
              <span
                role="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  removeOption(v);
                }}
                className="rounded-full hover:bg-brand-200 dark:hover:bg-brand-800"
              >
                <X className="size-3" aria-hidden="true" />
                <span className="sr-only">Remove {v}</span>
              </span>
            </span>
          ))}
          <ChevronDown className="ml-auto size-4 shrink-0 text-slate-400" aria-hidden="true" />
        </button>
        {open && (
          <ul
            role="listbox"
            aria-multiselectable="true"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            {options.map((option) => {
              const checked = value.includes(option);
              return (
                <li key={option}>
                  <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOption(option)}
                      className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600"
                    />
                    <span className="text-slate-900 dark:text-slate-100">{option}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
