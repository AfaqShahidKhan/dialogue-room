"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import {
  FiHome,
  FiUser,
  FiSearch,
  FiMessageSquare,
  FiUsers,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { FaSun, FaMoon } from "react-icons/fa";
import Link from "next/link";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDarkMode = theme === "dark";

  return (
    <div
      className={`h-screen transition-all duration-300 flex flex-col sticky top-0 left-0 ${
        isCollapsed ? "w-15" : "w-40"
      } ${
        isDarkMode
          ? "bg-dark-muted text-dark-foreground"
          : "bg-light-muted text-light-foreground"
      }`}
    >
      <div className="flex items-center justify-end p-4">
        <button onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <FiMenu size={24} /> : <FiX size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex flex-col flex-grow">
        <SidebarItem
          href="/"
          icon={<FiHome size={24} />}
          text="Home"
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          href="/users/me"
          icon={<FiUser size={24} />}
          text="Profile"
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          href="/search"
          icon={<FiSearch size={24} />}
          text="Search"
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          href="/chat"
          icon={<FiMessageSquare size={24} />}
          text="Chat"
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          href="/friends"
          icon={<FiUsers size={24} />}
          text="Friends"
          isCollapsed={isCollapsed}
        />
        <div className=" flex items-center justify-between">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 p-2 rounded-full transition-colors duration-300"
          >
            {isDarkMode ? <FaSun size={24} /> : <FaMoon size={24} />}
            {!isCollapsed &&  <span>{isDarkMode ? "Light" : "Dark"} Mode</span>}
          </button>
        </div>
      </nav>
    </div>
  );
};

const SidebarItem = ({ href, icon, text, isCollapsed }) => {
  return (
    <Link
      href={href}
      className="flex items-center p-3 rounded-lg hover:bg-slate-400 transition-all duration-200"
    >
      {icon}
      {!isCollapsed && <span className="ml-3">{text}</span>}
    </Link>
  );
};

export default Sidebar;
