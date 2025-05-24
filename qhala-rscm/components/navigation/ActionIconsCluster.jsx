"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import NotificationDropdown from "@/components/user/NotificationDropdown";

const ActionIconsCluster = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [notificationCount, setNotificationCount] = useState(0);
  const { data: session, status: sessionStatus } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => setMounted(true), []);

  const fetchNotificationCount = useCallback(async () => {
    if (sessionStatus === "authenticated" && session?.user) {
      try {
        const response = await fetch("/api/notifications/count");
        if (response.ok) {
          const data = await response.json();
          if (data.success) setNotificationCount(data.count);
        }
      } catch (error) {
        // console.error("Failed to fetch notification count:", error);
      }
    } else if (sessionStatus === "unauthenticated") {
      setNotificationCount(0);
    }
  }, [sessionStatus, session]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchNotificationCount();
      const intervalId = setInterval(fetchNotificationCount, 120000);
      return () => clearInterval(intervalId);
    }
  }, [fetchNotificationCount, sessionStatus]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const toggleThemeCb = () => setTheme(theme === "dark" ? "light" : "dark");
  const toggleDropdownCb = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen && sessionStatus === "authenticated")
      fetchNotificationCount();
  };
  const handleMarkAllReadSuccessCb = () => setNotificationCount(0);
  const handleDropdownNotificationsUpdateCb = (newUnreadCount) => {
    if (typeof newUnreadCount === "number")
      setNotificationCount(newUnreadCount);
    else if (sessionStatus === "authenticated") fetchNotificationCount();
  };

  const outerSeamlessBg = "bg-slate-900";
  const innerElevatedBg = "bg-slate-900";
  const iconColor = "text-[rgb(var(--accent))]";
  const iconHoverBg = "hover:bg-slate-00";
  const ringOffsetColor = "focus-visible:ring-offset-slate-800";

  return (
    <div
      className={cn(
        "pt-[6px] pb-[6px] pl-3 pr-[7px]",
        "rounded-l-full",
        outerSeamlessBg
      )}
    >
      <div
        className={cn(
          "flex items-center space-x-1",
          "p-1",
          "rounded-xl",
          innerElevatedBg,
          "shadow-sm"
        )}
      >
        {sessionStatus === "authenticated" && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdownCb}
              className={cn(
                "relative p-1.5 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                iconColor,
                iconHoverBg,
                "focus-visible:ring-[rgb(var(--ring))]",
                ringOffsetColor
              )}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {notificationCount > 0 && (
                <span
                  className={cn(
                    "absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none transform translate-x-1/2 -translate-y-1/2 rounded-full",
                    "bg-[rgb(var(--destructive))] text-[rgb(var(--destructive-foreground))]"
                  )}
                >
                  {notificationCount}
                </span>
              )}
            </button>
            <NotificationDropdown
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              onMarkAllReadSuccess={handleMarkAllReadSuccessCb}
              onNotificationRead={handleDropdownNotificationsUpdateCb}
            />
          </div>
        )}
        {mounted && (
          <button
            onClick={toggleThemeCb}
            className={cn(
              "p-1.5 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              iconColor,
              iconHoverBg,
              "focus-visible:ring-[rgb(var(--ring))]",
              ringOffsetColor
            )}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionIconsCluster;
