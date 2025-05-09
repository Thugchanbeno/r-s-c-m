"use client";
import { useState, useEffect } from "react";
import qlogo from "@/assets/qlogo.png";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Sun, Moon, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    setNotificationCount(2);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navbarBg = "bg-slate-900";
  const navbarTextPrimary = "text-slate-100";
  const navbarTextSecondary = "text-slate-400";
  const navbarHoverBg = "hover:bg-slate-800";
  const navbarFocusRing = "focus:ring-slate-500";
  const logoTextColor = "text-blue-400";

  return (
    <nav
      className={cn(
        navbarBg,
        navbarTextPrimary,
        "p-4 flex justify-between items-center shadow-md transition-colors duration-300"
      )}
    >
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2">
          <>
            <Image
              src={qlogo}
              alt="Qhala Logo"
              width={32}
              height={32}
              className="h-8 pt-1 w-auto"
            />
            <span className={cn("text-xl font-bold", logoTextColor)}>
              Qhala
            </span>
          </>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <button
          className={cn(
            "relative p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2",
            navbarFocusRing,
            navbarTextSecondary,
            navbarHoverBg,
            "hover:text-slate-100"
          )}
          aria-label="Notifications"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {notificationCount}
            </span>
          )}
        </button>
        {mounted && (
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2",
              navbarFocusRing,
              navbarTextSecondary,
              navbarHoverBg,
              "hover:text-slate-100"
            )}
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
