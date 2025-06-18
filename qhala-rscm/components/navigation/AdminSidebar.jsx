"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import qlogo from "@/assets/qlogo.png";
import Image from "next/image";
import {
  Users,
  LayoutDashboard,
  Settings,
  UserCircle,
  FileText,
  Menu,
  ChevronLeft,
  X,
  LogOut,
  UserCog,
  Home,
  Briefcase,
  Shield,
} from "lucide-react";
import Button from "@/components/common/Button.jsx";
import { cn } from "@/lib/utils";

const AdminSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const userRole = session?.user?.role || "admin";
  const userName = session?.user?.name || session?.user?.email || "Admin User";
  const userAvatar = session?.user?.image || "/images/default-avatar.png";

  const toggleSidebar = () => setIsExpanded(!isExpanded);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const sidebarTheme = {
    bg: "bg-slate-900",
    textPrimary: "text-slate-100",
    textSecondary: "text-slate-400",
    titleText: "text-[rgb(var(--accent))]",
    hoverBg: "bg-slate-800",
    inactiveLinkHoverText: "hover:text-[rgb(var(--accent))]",
    activeColor: "text-[rgb(var(--accent))]",
    adminPanelButtonBg: "bg-[rgb(var(--accent))]",
    adminPanelButtonText: "text-[rgb(var(--accent-foreground))]",
    adminPanelButtonHoverBg: "hover:bg-[rgb(var(--qhala-soft-peach-darker))]",
  };

  const adminNavigation = [
    {
      name: "Admin Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      roles: ["admin", "hr"],
      exactMatch: true,
    },
    {
      name: "User Management",
      icon: Users,
      href: "/admin/users",
      roles: ["admin", "hr"],
    },
    {
      name: "Allocations",
      icon: UserCog,
      href: "/admin/allocations",
      roles: ["admin", "hr"],
    },
    {
      name: "Projects",
      icon: Briefcase,
      href: "/projects",
      roles: ["admin", "hr", "pm"],
    },
    {
      name: "Reports",
      icon: FileText,
      href: "/admin/reports",
      roles: ["admin", "hr"],
    },
    {
      name: "Site Settings",
      icon: Settings,
      href: "/admin/settings",
      roles: ["admin"],
    },
  ];

  const backToMainAppItem = {
    name: "Home",
    icon: Home,
    href: "/dashboard",
    roles: ["admin", "hr", "pm", "employee"],
    exactMatch: true,
  };

  const filteredNavigation = [
    backToMainAppItem,
    ...adminNavigation.filter((item) => item.roles.includes(userRole)),
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleNavLinkClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const isActiveLink = (item) => {
    if (item.exactMatch) {
      return pathname === item.href;
    }
    if (pathname.startsWith(item.href)) {
      if (item.href === "/admin" && pathname !== "/admin") return false;
      // The dashboard check was specific to AdminSidebar, keep if needed
      // if (item.href === "/dashboard" && pathname !== "/dashboard") return false;
      return true;
    }
    return false;
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileOpen]);

  const sidebarWidthClass = isExpanded ? "w-60" : "w-[72px]";
  const mobileTransformClass = isMobileOpen
    ? "translate-x-0"
    : "-translate-x-full";

  return (
    <>
      <div className="fixed top-3 left-3 z-[60] md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileSidebar}
          className="p-2 rounded-md shadow-lg bg-[rgb(var(--card))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
          aria-label="Open admin sidebar"
        >
          <Menu size={20} />
        </Button>
      </div>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[55] md:hidden"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          `fixed left-0 top-0 z-50 h-full flex flex-col 
           transition-all duration-300 ease-in-out md:sticky md:translate-x-0`,
          sidebarTheme.bg,
          sidebarTheme.textPrimary,
          sidebarWidthClass,
          mobileTransformClass
        )}
        aria-label="Admin Sidebar"
      >
        <div className="flex h-full flex-col">
          <div
            className={cn(
              `flex items-center shrink-0 px-4`,
              isExpanded ? "justify-between h-16" : "justify-center h-14"
            )}
          >
            {isExpanded && (
              <div className="flex items-center gap-2">
                <Image src={qlogo} alt="Qhala Logo" width={24} height={24} />
                <span
                  className={cn(
                    "text-xl font-bold whitespace-nowrap font-display",
                    sidebarTheme.titleText
                  )}
                >
                  Qhala
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                "hidden md:inline-flex p-2",
                sidebarTheme.textSecondary,
                "hover:bg-slate-700",
                `hover:${sidebarTheme.textPrimary}`
              )}
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <ChevronLeft
                size={20}
                className={cn(
                  `transform transition-transform duration-300 ease-in-out`,
                  isExpanded ? "" : "rotate-180"
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileSidebar}
              className={cn(
                "md:hidden p-2",
                sidebarTheme.textSecondary,
                "hover:bg-slate-700",
                `hover:${sidebarTheme.textPrimary}`
              )}
              aria-label="Close admin sidebar"
            >
              <X size={20} />
            </Button>
          </div>

          {isExpanded && (
            <div className="px-3 pt-2 pb-4">
              <Link
                href="/admin"
                onClick={handleNavLinkClick}
                className={cn(
                  "flex items-center justify-center w-full text-sm font-medium",
                  "px-2.5 py-2.5",
                  sidebarTheme.adminPanelButtonBg,
                  sidebarTheme.adminPanelButtonText,
                  sidebarTheme.adminPanelButtonHoverBg,
                  "rounded-lg",
                  "transition-colors duration-150 ease-in-out shadow-sm"
                )}
              >
                <Shield size={16} className="mr-2" />
                Admin Panel
              </Link>
            </div>
          )}

          <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-1">
            {filteredNavigation.map((item) => {
              const isLinkActive = isActiveLink(item);
              const IconComponent = item.icon;

              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    onClick={handleNavLinkClick}
                    title={isExpanded ? "" : item.name}
                    className={cn(
                      `flex items-center p-2.5 rounded-[var(--radius)] text-sm group transition-colors duration-150 ease-in-out`,
                      isLinkActive
                        ? `${sidebarTheme.hoverBg} ${sidebarTheme.activeColor} font-medium shadow-sm`
                        : `${sidebarTheme.textPrimary} hover:${sidebarTheme.hoverBg} ${sidebarTheme.inactiveLinkHoverText} font-normal`
                    )}
                  >
                    <IconComponent
                      size={18}
                      strokeWidth={isLinkActive ? 2 : 1.5}
                      className={cn(
                        isLinkActive
                          ? sidebarTheme.activeColor
                          : sidebarTheme.textSecondary,
                        !isLinkActive &&
                          `group-hover:${sidebarTheme.activeColor}`
                      )}
                    />
                    {isExpanded && (
                      <span className={cn("ml-3 whitespace-nowrap")}>
                        {item.name}
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className={cn("shrink-0 p-3")}>
            <div
              className={cn(
                "flex items-center",
                !isExpanded && "justify-center"
              )}
            >
              <Image
                className="h-9 w-9 rounded-full object-cover"
                src={userAvatar}
                alt="User avatar"
                width={36}
                height={36}
              />
              {isExpanded && (
                <>
                  <div className="ml-2.5 flex flex-col overflow-hidden">
                    <span
                      className={cn(
                        "font-semibold text-sm truncate",
                        sidebarTheme.textPrimary
                      )}
                    >
                      {userName}
                    </span>
                    <span
                      className={cn(
                        "text-xs capitalize",
                        sidebarTheme.textSecondary
                      )}
                    >
                      {userRole}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    title="Sign out"
                    className={cn(
                      "ml-auto p-2",
                      sidebarTheme.textSecondary,
                      "hover:bg-slate-700",
                      `hover:${sidebarTheme.textPrimary}`
                    )}
                    aria-label="Sign out"
                  >
                    <LogOut size={18} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
