"use client";
import { useState, useEffect } from "react";
import qlogo from "@/assets/qlogo.png";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Sun, Moon, Bell } from "lucide-react";

const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [notificationCount, setNotificationCount] = useState(0);

  // This useEffect ensures hydration is complete before rendering theme-dependent elements
  useEffect(() => {
    setMounted(true);
    //  replace with actual implementation later once messaging or requests functionality is implemented.

    setNotificationCount(2);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="bg-blue-950 dark:bg-gray-900 text-white p-4 flex justify-between items-center shadow-md transition-colors duration-300">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src={qlogo}
            alt="Qhala Logo"
            width={32}
            height={32}
            className="h-8 pt-1 w-auto"
          />
          <span className="text-xl font-bold">Qhala RSCM</span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications Button */}
        <button
          className="relative p-2 text-gray-200 hover:text-white rounded-full hover:bg-blue-900 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-gray-500"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Theme Toggle Button */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-200 hover:text-white rounded-full hover:bg-blue-900 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-gray-500"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
