"use client";

import { useTheme } from "@/context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <header
      className={`w-full p-4 shadow-md transition-colors duration-300 ${
        isDarkMode ? "bg-dark-background text-dark-foreground" : "bg-light-background text-light-foreground"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dialogue Room</h1>
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors duration-300 ${
            isDarkMode ? "bg-dark-primary text-dark-foreground" : "bg-light-primary text-light-foreground"
          }`}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <FaSun size={24} /> : <FaMoon size={24} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
