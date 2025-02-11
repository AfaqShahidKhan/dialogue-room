"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

const Button = ({ 
  children, 
  onClick, 
  type = "button", 
  className = "", 
  variant = "primary", 
  disabled = false 
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const themeColors = isDarkMode ? "dark" : "light";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : `bg-${themeColors}-${variant} text-${themeColors}-foreground hover:opacity-80`
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
