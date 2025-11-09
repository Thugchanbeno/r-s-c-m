"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import rscmLogo from "@/assets/RSCM.png";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Bell,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";

const AppSidebar = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const { data: session } = useSession();
  const pathname = usePathname();

  const userRole = session?.user?.role || "employee";
  const userName = session?.user?.name || session?.user?.email || "User";
  const userAvatar = session?.user?.image || "/images/default-avatar.png";

  const navigation = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      roles: ["admin", "hr", "pm", "employee"],
    },
    {
      id: "projects",
      name: "Projects",
      icon: Briefcase,
      href: "/projects",
      roles: ["admin", "hr", "pm", "employee"],
    },
    {
      id: "resources",
      name: "Resources",
      icon: Users,
      href: "/resources",
      roles: ["admin", "hr", "pm"],
    },
  ];

  const getQuickActions = (navId) => {
    const actionsByNav = {
      dashboard: [
        { label: "Manage users", href: "/admin/users", roles: ["admin", "hr"] },
        { label: "Manage skills", href: "/admin/skills", roles: ["admin", "hr"] },
        { label: "View analytics", href: "/admin/analytics", roles: ["admin", "hr"] },
        { label: "View approvals", href: "/approvals", roles: ["admin", "hr", "line_manager"] },
        { label: "My profile", href: "/profile", roles: ["employee", "pm", "line_manager"] },
        { label: "My team", href: "/resources", roles: ["pm", "line_manager"] },
        { label: "Request resources", href: "/resources/requests", roles: ["pm"] },
      ],
      projects: [
        { label: "Create project", href: "/projects/new", roles: ["admin", "hr", "pm"] },
        { label: "View all projects", href: "/projects", roles: ["admin", "hr", "pm", "employee", "line_manager"] },
        { label: "My projects", href: "/projects?filter=mine", roles: ["employee", "pm", "line_manager"] },
        { label: "Manage allocations", href: "/resources/allocations", roles: ["admin", "hr", "pm"] },
      ],
      resources: [
        { label: "Resource planning", href: "/resources", roles: ["admin", "hr", "pm"] },
        { label: "Capacity view", href: "/resources/capacity", roles: ["admin", "hr", "pm"] },
        { label: "Allocations", href: "/resources/allocations", roles: ["admin", "hr", "pm"] },
        { label: "Request resource", href: "/resources/requests", roles: ["pm"] },
      ],
    };

    const actions = actionsByNav[navId] || [];
    return actions.filter((action) => action.roles.includes(userRole));
  };

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(userRole)
  );

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="flex h-full">
      <div className="w-14 flex flex-col items-center py-3">
        <Link
          href="/dashboard"
          className="mb-6 flex items-center justify-center w-10 h-10"
        >
          <Image
            src={rscmLogo}
            alt="RSCM"
            width={24}
            height={24}
            className="w-6 h-6"
            priority
          />
        </Link>

        <div className="flex-1 flex flex-col gap-0.5 w-full items-center">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isExpanded = expandedSection === item.id;

            const hasActions = getQuickActions(item.id).length > 0;
            
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => toggleSection(item.id)}
                  title={item.name}
                  className={`
                    w-10 h-10 flex items-center justify-center rounded-md transition-all duration-200
                    ${
                      active || isExpanded
                        ? "bg-rscm-violet text-white"
                        : "text-rscm-dark-purple hover:bg-white/50"
                    }
                  `}
                >
                  <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                </button>
                {hasActions && !isExpanded && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-rscm-lilac rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-0.5 pt-4 mt-4 w-full items-center">
          <Link
            href="/profile"
            className="w-10 h-10 flex items-center justify-center text-rscm-dark-purple hover:bg-white/50 rounded-md transition-all duration-200"
            title="Profile"
          >
            <UserCircle size={20} />
          </Link>

          {(userRole === "admin" || userRole === "hr") && (
            <Link
              href="/admin"
              className="w-10 h-10 flex items-center justify-center text-rscm-dark-purple hover:bg-white/50 rounded-md transition-all duration-200"
              title="Settings"
            >
              <Settings size={20} />
            </Link>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-10 h-10 flex items-center justify-center text-rscm-dark-purple hover:bg-white/50 rounded-md transition-all duration-200"
            title="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {expandedSection && (
        <div className="w-60 bg-white rounded-lg shadow-sm p-4 my-3 ml-1 animate-in slide-in-from-left duration-200">
          <h3 className="font-semibold text-sm mb-4 text-rscm-violet">
            {filteredNavigation.find((n) => n.id === expandedSection)?.name}
          </h3>
          <div className="space-y-1">
            {getQuickActions(expandedSection).map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="block px-3 py-2 text-sm text-rscm-dark-purple hover:bg-rscm-dutch-white/30 rounded transition-colors"
                onClick={() => setExpandedSection(null)}
              >
                {action.label}
              </Link>
            ))}
            {getQuickActions(expandedSection).length === 0 && (
              <p className="text-xs text-gray-400 px-3 py-2">
                No quick actions available
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppSidebar;
