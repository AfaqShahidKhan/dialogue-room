"use client";

import React, { forwardRef } from "react";
import { useTheme } from "@/context/ThemeContext";

const Checkbox = forwardRef(({ label, className = "", ...props }, ref) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const themeColors = isDarkMode ? "dark" : "light";

  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        ref={ref} // Forward ref to support React Hook Form
        {...props} // Spread props (including register)
        className={`w-4 h-4 accent-${themeColors}-primary`}
      />
      {label && (
        <span className={`text-${themeColors}-foreground`}>{label}</span>
      )}
    </label>
  );
});

Checkbox.displayName = "Checkbox"; // Needed for forwardRef

export default Checkbox;
