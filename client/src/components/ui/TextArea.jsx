"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

const TextArea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  className = "", 
  required = false 
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const themeColors = isDarkMode ? "dark" : "light";

  return (
    <div className="flex flex-col gap-1">
      {label && <label className={`font-medium text-${themeColors}-foreground`}>{label}</label>}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`p-2 border rounded-lg focus:ring-2 outline-none transition duration-300
          bg-${themeColors}-background text-${themeColors}-foreground
          border-${themeColors}-muted focus:ring-${themeColors}-primary ${className}`}
      />
    </div>
  );
};

export default TextArea;
