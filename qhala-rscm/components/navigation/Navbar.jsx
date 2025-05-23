"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import qlogo from "@/assets/qlogo.png";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Sun, Moon, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import NotificationDropdown from "@/components/user/NotificationDropdown";
import { toast } from "react-toastify";

const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [notificationCount, setNotificationCount] = useState(0);
  const { data: session, status: sessionStatus } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  const fetchNotificationCount = useCallback(async () => {
    if (sessionStatus === "authenticated" && session?.user) {
      try {
        const response = await fetch("/api/notifications/count");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setNotificationCount(data.count);
          }
        }
      } catch (error) {
        console.error("Failed to fetch notification count:", error);
      }
    } else if (sessionStatus === "unauthenticated") {
      setNotificationCount(0);
    }
  }, [sessionStatus, session]);

  useEffect(() => {
    fetchNotificationCount();
    const intervalId = setInterval(fetchNotificationCount, 120000);
    return () => clearInterval(intervalId);
  }, [fetchNotificationCount]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      fetchNotificationCount();
    }
  };
  const handleMarkAllReadSuccess = () => {
    setNotificationCount(0); // Optimistically update count
    fetchNotificationCount(); // Or refetch for certainty
  };
  const handleDropdownNotificationsUpdate = (newUnreadCount) => {
    if (typeof newUnreadCount === "number") {
      setNotificationCount(newUnreadCount);
    } else {
      // If specific count isn't passed, just refetch
      fetchNotificationCount();
    }
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
        <Link href="/dashboard" className="flex items-center space-x-2">
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
        {sessionStatus === "authenticated" && (
          <div className="relative" ref={dropdownRef}>
            {" "}
            {/* Relative container for dropdown */}
            <button
              onClick={toggleDropdown}
              className={`relative p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 ${navbarFocusRing} ${navbarTextSecondary} ${navbarHoverBg} hover:text-slate-100`}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
                  {" "}
                  {/* Added animate-pulse */}
                  {notificationCount}
                </span>
              )}
            </button>
            <NotificationDropdown
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              onMarkAllReadSuccess={handleMarkAllReadSuccess}
              onNotificationRead={handleDropdownNotificationsUpdate}
            />
          </div>
        )}
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
