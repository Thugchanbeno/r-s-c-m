"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useNotificationCount } from "@/lib/hooks/useNotificationCount";
import NotificationDropdownWrapper from "@/components/user/NotificationDropdownWrapper";

const ActionIconsCluster = ({ 
  onMobileSidebarToggle, 
  showMobileSidebarToggle = false 
}) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session, status: sessionStatus } = useSession();
  const { count: notificationCount } = useNotificationCount();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => setMounted(true), []);

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
  const toggleDropdownCb = () => setIsDropdownOpen(!isDropdownOpen);
  
  // These callbacks are now handled by the enhanced notification hook
  const handleMarkAllReadSuccessCb = () => {}; // No-op, handled by hook
  const handleDropdownNotificationsUpdateCb = () => {}; // No-op, handled by hook

  const outerSeamlessBg = "bg-slate-900";
  const innerElevatedBg = "bg-slate-900";
  const iconColor = "text-[rgb(var(--accent))]";
  const iconHoverBg = "hover:bg-slate-800";
  const ringOffsetColor = "focus-visible:ring-offset-slate-800";

  return (
    <>
      <div className="md:hidden flex items-center justify-between w-full">
        {showMobileSidebarToggle && (
          <div
            className={cn(
              "pt-[2px] pb-[2px] pr-3 pl-[7px]",
              "rounded-r-full",
              outerSeamlessBg
            )}
          >
            <div
              className={cn(
                "flex items-center",
                "p-1",
                "rounded-xl",
                innerElevatedBg,
                "shadow-sm"
              )}
            >
              <button
                onClick={onMobileSidebarToggle}
                className={cn(
                  "p-1.5 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  iconColor,
                  iconHoverBg,
                  "focus-visible:ring-[rgb(var(--ring))]",
                  ringOffsetColor
                )}
                aria-label="Toggle sidebar"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        )}
        <div
          className={cn(
            "pt-[2px] pb-[2px] pl-3 pr-[7px]",
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
                <NotificationDropdownWrapper
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
      </div>
      <div className="hidden md:block">
        <div
          className={cn(
            "pt-[2px] pb-[2px] pl-3 pr-[7px]",
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
                <NotificationDropdownWrapper
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
      </div>
    </>
  );
};

export default ActionIconsCluster;