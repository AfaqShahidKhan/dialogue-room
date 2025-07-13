"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

const Select = ({
  label,
  name,
  options = [],
  className = "",
  required = false,
  multiple = false,
  register,
  defaultValue,
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const themeColors = isDarkMode ? "dark" : "light";

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className={`font-medium text-${themeColors}-background`}>
          {label}
        </label>
      )}
      <select
        {...register(name, { required })}
        multiple={multiple}
        size={multiple ? 7 : undefined}
        defaultValue={defaultValue}
        className={`p-2 border rounded-lg focus:ring-2 outline-none transition duration-300
          bg-${themeColors}-background text-${themeColors}-foreground
          border-${themeColors}-muted focus:ring-${themeColors}-primary ${className}`}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
