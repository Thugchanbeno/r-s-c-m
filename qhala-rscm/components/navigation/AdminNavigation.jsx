"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
} from "lucide-react";
import Button from "@/components/common/Button.jsx";

const AdminSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const userRole = session?.user?.role || "admin";
  const userName = session?.user?.name || session?.user?.email || "Admin";
  const userAvatar = session?.user?.image || "/images/default-avatar.png";

  const toggleSidebar = () => setIsExpanded(!isExpanded);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const adminNavigation = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/admin",
      roles: ["admin", "hr"],
      exactMatch: true,
    },
    {
      name: "User Management",
      icon: <Users size={20} />,
      href: "/admin/users",
      roles: ["admin", "hr"],
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
      href: "/admin/settings",
      roles: ["admin"],
    },
    {
      name: "Reports",
      icon: <FileText size={20} />,
      href: "/admin/reports",
      roles: ["admin", "hr"],
    },
    {
      name: "My Profile",
      icon: <UserCircle size={20} />,
      href: "/profile",
      roles: ["admin", "hr"],
    },
    {
      name: "Allocations",
      icon: <UserCog size={20} />,
      href: "/admin/allocations",
      roles: ["admin", "hr"],
    },
  ];

  const filteredNavigation = adminNavigation.filter((item) =>
    item.roles.includes(userRole)
  );

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleNavLinkClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
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

  const sidebarWidthClass = isExpanded ? "w-64" : "w-20";
  const mobileTransformClass = isMobileOpen
    ? "translate-x-0"
    : "-translate-x-full";

  const sidebarBg = "bg-slate-900";
  const sidebarBorder = "border-slate-700";
  const sidebarTextPrimary = "text-slate-100";
  const sidebarTextSecondary = "text-slate-400";
  const sidebarHoverBg = "hover:bg-slate-800";
  const sidebarActiveBg = "bg-[rgb(var(--primary))]";
  const sidebarActiveText = "text-white";

  return (
    <>
      {/* Mobile Menu Button (Hamburger) - Uses page theme */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Button
          variant="ghost"
          onClick={toggleMobileSidebar}
          className="text-[rgb(var(--muted-foreground))] bg-[rgb(var(--background))] hover:bg-[rgb(var(--muted))] p-2 shadow-md rounded-md"
          aria-label="Open admin sidebar"
        >
          <Menu size={24} />
        </Button>
      </div>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-500 ease-in-out"
          onClick={toggleMobileSidebar}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen ${sidebarBg} border-r ${sidebarBorder}
                   transition-all duration-300 ease-in-out md:sticky md:translate-x-0
                   ${sidebarWidthClass} ${mobileTransformClass}`}
        aria-label="Admin Sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div
            className={`flex h-16 items-center border-b ${sidebarBorder} px-4 shrink-0 ${
              isExpanded ? "justify-between" : "justify-center"
            } transition-all duration-300 ease-in-out`}
          >
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
              }`}
            >
              <Link
                href="/admin"
                className="text-xl font-bold text-blue-400 whitespace-nowrap" // Light blue for title
              >
                Qhala Admin
              </Link>
            </div>
            <Button
              variant="ghost"
              onClick={toggleSidebar}
              className={`hidden md:inline-flex ${sidebarTextSecondary} ${sidebarHoverBg}`}
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <ChevronLeft
                size={20}
                className={`transform transition-transform duration-300 ease-in-out ${
                  isExpanded ? "" : "rotate-180"
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              onClick={toggleMobileSidebar}
              className={`md:hidden ${sidebarTextSecondary} ${sidebarHoverBg}`}
              aria-label="Close admin sidebar"
            >
              <X size={24} />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = item.exactMatch
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={handleNavLinkClick}
                      className={`flex items-center p-2 rounded-md text-base font-medium group transition-all duration-300 ease-in-out
                                  ${
                                    isActive
                                      ? `${sidebarActiveBg} ${sidebarActiveText}`
                                      : `${sidebarTextPrimary} ${sidebarHoverBg}`
                                  }
                                  ${!isExpanded ? "justify-center" : ""}`}
                    >
                      <span
                        className={`transition-colors duration-300 ease-in-out ${
                          isActive
                            ? sidebarActiveText
                            : `${sidebarTextSecondary} group-hover:${sidebarTextPrimary}`
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={`ml-3 transition-all duration-300 ease-in-out ${
                          isExpanded
                            ? "opacity-100 w-auto"
                            : "opacity-0 w-0 overflow-hidden"
                        }`}
                      >
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className={`shrink-0 border-t ${sidebarBorder} p-4`}>
            <div className="flex items-center gap-3">
              <Image
                className="h-10 w-10 rounded-full object-cover transition-all duration-300 ease-in-out"
                src={userAvatar}
                alt="User avatar"
                width={40}
                height={40}
              />
              <div
                className={`flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
                }`}
              >
                <span
                  className={`font-medium text-sm truncate ${sidebarTextPrimary}`}
                >
                  {userName}
                </span>
                <span className={`text-xs ${sidebarTextSecondary} capitalize`}>
                  {userRole}
                </span>
              </div>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className={`ml-auto ${sidebarTextSecondary} ${sidebarHoverBg} transition-all duration-300 ease-in-out ${
                  !isExpanded ? "w-full justify-center" : ""
                }`}
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
