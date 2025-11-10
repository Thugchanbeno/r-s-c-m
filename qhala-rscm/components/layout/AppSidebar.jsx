"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  LogOut,
  UserCircle,
  ClipboardCheck,
} from "lucide-react";
import rscmLogo from "@/assets/RSCM.png";

const AppSidebar = () => {
  const { data: session } = useSession();
  const [expandedSection, setExpandedSection] = useState(null);
  const [activeHash, setActiveHash] = useState("");
  const pathname = usePathname();

  // Track hash changes for scrollspy
  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };
    
    // Set initial hash
    setActiveHash(window.location.hash);
    
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const userRole = session?.user?.role || "employee";
  const userName = session?.user?.name || session?.user?.email || "User";
  const userAvatar = session?.user?.image || "/images/default-avatar.png";

  const navigation = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      roles: ["admin", "hr", "pm", "employee", "line_manager"],
    },
    {
      id: "profile",
      name: "Profile",
      icon: UserCircle,
      href: "/profile",
      roles: ["admin", "hr", "pm", "employee", "line_manager"],
    },
    {
      id: "projects",
      name: "Projects",
      icon: Briefcase,
      href: "/projects",
      roles: ["admin", "hr", "pm", "employee", "line_manager"],
    },
    {
      id: "resources",
      name: "Resources",
      icon: Users,
      href: "/resources",
      roles: ["admin", "hr", "pm"],
    },
    {
      id: "approvals",
      name: "Approvals",
      icon: ClipboardCheck,
      href: "/approvals",
      roles: ["admin", "hr", "pm", "line_manager"],
    },
    {
      id: "admin",
      name: "Admin",
      icon: Settings,
      href: "/admin",
      roles: ["admin", "hr"],
    },
  ];

  const getQuickActions = (navId) => {
    const actionsByNav = {
      dashboard: [
        { label: "Manage users", href: "/admin/users", roles: ["admin", "hr"] },
        { label: "Manage skills", href: "/admin/skills", roles: ["admin", "hr"] },
        { label: "View analytics", href: "/admin/analytics", roles: ["admin", "hr"] },
        { label: "View approvals", href: "/approvals", roles: ["admin", "hr", "line_manager"] },
        { label: "My team", href: "/resources", roles: ["pm", "line_manager"] },
        { label: "Request resources", href: "/resources/requests", roles: ["pm"] },
      ],
      profile: [
        { label: "Overview", href: "/profile#overview", roles: ["admin", "hr", "pm", "employee", "line_manager"] },
        { label: "Skills & Development", href: "/profile#skills", roles: ["admin", "hr", "pm", "employee", "line_manager"] },
        { label: "Employment Details", href: "/profile#employment", roles: ["admin", "hr", "pm", "employee", "line_manager"] },
        { label: "Line Manager", href: "/profile#manager", roles: ["admin", "hr", "pm", "employee", "line_manager"] },
        { label: "Work Requests", href: "/profile#requests", roles: ["admin", "hr", "pm", "employee", "line_manager"] },
      ],
      projects: [
        { label: "Create project", href: "/projects/new", roles: ["admin", "hr", "pm"] },
        { label: "View all projects", href: "/projects", roles: ["admin", "hr", "pm", "employee", "line_manager"] },
        { label: "My projects", href: "/projects?filter=mine", roles: ["employee", "pm", "line_manager"] },
        { label: "Manage allocations", href: "/resources/allocations", roles: ["admin", "hr", "pm"] },
      ],
      resources: [
        { label: "Resource planning", href: "/resources?tab=planning", roles: ["admin", "hr", "pm"] },
        { label: "Capacity view", href: "/resources?tab=capacity", roles: ["admin", "hr", "pm"] },
        { label: "Allocations", href: "/resources?tab=allocations", roles: ["admin", "hr", "pm"] },
        { label: "Request resource", href: "/resources/requests", roles: ["pm"] },
      ],
      approvals: [
        { label: "Work Requests", href: "/approvals?tab=work", roles: ["admin", "hr", "pm", "line_manager"] },
        { label: "Resource Requests", href: "/approvals?tab=resources", roles: ["admin", "hr", "pm", "line_manager"] },
        { label: "Skill Verifications", href: "/approvals?tab=skills", roles: ["admin", "hr", "pm", "line_manager"] },
      ],
      admin: [
        { label: "Analytics & Insights", href: "/admin/analytics", roles: ["admin", "hr"] },
        { label: "Skills Management", href: "/admin/skills", roles: ["admin", "hr"] },
      ],
    };

    const actions = actionsByNav[navId] || [];
    return actions.filter((action) => action.roles.includes(userRole));
  };

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(userRole)
  );

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/admin") return pathname.startsWith("/admin");
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

        <div className="flex flex-col gap-0.5 pt-4 mt-auto w-full items-center border-t border-gray-200">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-10 h-10 flex items-center justify-center text-rscm-dark-purple hover:bg-white/50 rounded-md transition-all duration-200"
            title="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expandedSection && (
          <motion.div
            initial={{ opacity: 0, x: -20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 240 }}
            exit={{ opacity: 0, x: -20, width: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="bg-white rounded-lg shadow-sm p-4 my-3 ml-1 overflow-hidden"
          >
            <motion.div
              key={expandedSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <h3 className="font-semibold text-sm mb-4 text-rscm-violet">
                {filteredNavigation.find((n) => n.id === expandedSection)?.name}
              </h3>
              <div className="space-y-1">
                {getQuickActions(expandedSection).map((action, index) => {
                  const isActiveHash = action.href.includes("#") && action.href.endsWith(activeHash);
                  return (
                    <Link
                      key={index}
                      href={action.href}
                      className={`block px-3 py-2 text-sm rounded transition-colors ${
                        isActiveHash
                          ? "bg-rscm-violet text-white font-medium"
                          : "text-rscm-dark-purple hover:bg-rscm-dutch-white/30"
                      }`}
                    >
                      {action.label}
                    </Link>
                  );
                })}
                {getQuickActions(expandedSection).length === 0 && (
                  <p className="text-xs text-gray-400 px-3 py-2">
                    No quick actions available
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppSidebar;
