"use client";

import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaSun, FaMoon } from "react-icons/fa";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDarkMode = theme === "dark";

  return (
    <header
      className={`w-full p-4 shadow-md transition-colors duration-300 ${
        isDarkMode
          ? "bg-dark-background text-dark-foreground"
          : "bg-light-background text-light-foreground"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dialogue Room</h1>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-lg font-medium hover:underline">
            Login
          </Link>
          <Link
            href="/register"
            className={`px-4 py-2 rounded-lg ${
              isDarkMode
                ? "bg-dark-primary text-dark-foreground"
                : "bg-light-primary text-light-foreground"
            } transition`}
          >
            Register
          </Link>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors duration-300 ${
              isDarkMode
                ? "bg-dark-primary text-dark-foreground"
                : "bg-light-primary text-light-foreground"
            }`}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <FaSun size={24} /> : <FaMoon size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
