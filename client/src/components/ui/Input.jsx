"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

const Input = ({ 
  type = "text", 
  placeholder = "", 
  value, 
  onChange, 
  className = "", 
  ...props 
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2 border rounded-md focus:outline-none transition duration-300
        ${
          isDarkMode
            ? "bg-dark-muted border-dark-primary text-dark-foreground focus:ring-2 focus:ring-dark-accent"
            : "bg-light-muted border-light-primary text-light-foreground focus:ring-2 focus:ring-light-accent"
        } ${className}`}
      {...props}
    />
  );
};

export default Input;
