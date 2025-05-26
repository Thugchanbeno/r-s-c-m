"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/common/Card.jsx";
import Button from "@/components/common/Button.jsx";
import {
  Users,
  Wrench,
  Settings,
  TrendingUp,
  Eye,
  ArrowRight,
  Plus,
  ChevronRight,
  Shield,
  Activity,
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { cn } from "@/lib/utils";
import { containerVariants, itemVariants } from "@/lib/animations";

const adminCardDefinitions = [
  {
    id: "users",
    title: "User Management",
    description: "View, edit roles, and manage user accounts.",
    icon: Users,
    href: "/admin/users",
  },
  {
    id: "skills",
    title: "Skill Taxonomy",
    description: "Manage skill categories and individual skills.",
    icon: Wrench,
    href: "/admin/skills",
  },
  {
    id: "settings",
    title: "System Settings",
    description: "Configure application-wide settings and preferences.",
    icon: Settings,
    href: "/admin/settings",
  },
  {
    id: "analytics",
    title: "Analytics & Reports",
    description: "View system usage statistics and reports.",
    icon: TrendingUp,
    href: "/admin/analytics",
  },
];

const initialQuickActions = [
  {
    id: "add-user",
    title: "Add New User",
    icon: Users,
    href: "/admin/users/new",
    bgColor: "bg-[rgba(var(--primary),0.1)]",
    hoverBgColor: "hover:bg-[rgba(var(--primary),0.2)]",
    textColor: "text-[rgb(var(--primary))]",
  },
  {
    id: "add-skill",
    title: "Create Skill",
    icon: Wrench,
    href: "/admin/skills/new",
    bgColor: "bg-[rgba(var(--success),0.1)]",
    hoverBgColor: "hover:bg-[rgba(var(--success),0.2)]",
    textColor: "text-[rgb(var(--success))]",
  },
];

export default function AdminDashboardPage() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [cardStats, setCardStats] = useState({
    users: { value: 0, label: "active users", loading: true },
    skills: { value: 0, label: "skills defined", loading: true },
    settings: { value: "N/A", label: "Last updated", loading: true },
    analytics: { value: 0, label: "reports available", loading: true },
  });
  const [loadingPageData, setLoadingPageData] = useState(true);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingPageData(true);
      setPageError(null);
      try {
        const usersResponse = await fetch("/api/users?countOnly=true");
        if (!usersResponse.ok) throw new Error("Failed to fetch user count");
        const usersData = await usersResponse.json();
        setCardStats((prev) => ({
          ...prev,
          users: {
            value: usersData.data?.count || usersData.count || 0,
            label: "active users",
            loading: false,
          },
        }));

        const skillsResponse = await fetch("/api/skills?countOnly=true");
        if (!skillsResponse.ok) throw new Error("Failed to fetch skill count");
        const skillsData = await skillsResponse.json();
        setCardStats((prev) => ({
          ...prev,
          skills: {
            value: skillsData.data?.count || skillsData.count || 0,
            label: "skills defined",
            loading: false,
          },
        }));

        setTimeout(() => {
          setCardStats((prev) => ({
            ...prev,
            settings: {
              value: "2 days ago",
              label: "Last updated",
              loading: false,
            },
          }));
        }, 500);

        setTimeout(() => {
          setCardStats((prev) => ({
            ...prev,
            analytics: {
              value: 12,
              label: "reports available",
              loading: false,
            },
          }));
        }, 700);
      } catch (error) {
        console.error("Failed to load admin dashboard data:", error);
        setPageError(error.message || "Could not load dashboard data.");
        setCardStats((prev) => ({
          users: { ...prev.users, loading: false },
          skills: { ...prev.skills, loading: false },
          settings: { ...prev.settings, loading: false },
          analytics: { ...prev.analytics, loading: false },
        }));
      } finally {
        setLoadingPageData(false);
      }
    };
    fetchDashboardData();
  }, []);

  const headerTitleClasses = "text-3xl font-bold text-[rgb(var(--foreground))]";

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[rgb(var(--background))] p-4 sm:p-6 lg:p-8 rounded-lg"
    >
      <header className="pb-6 mb-6 border-b border-[rgb(var(--border))]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <motion.h1 variants={itemVariants} className={headerTitleClasses}>
                Admin Dashboard
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="mt-1 text-[rgb(var(--muted-foreground))]"
              >
                Manage and monitor your system
              </motion.p>
            </div>
            <div className="flex items-center gap-4">
              <motion.div variants={itemVariants}>
                <Button variant="outline" size="sm">
                  <Activity
                    size={16}
                    className="mr-2 text-[rgb(var(--primary))]"
                  />
                  System Status
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {pageError && (
        <motion.div
          variants={itemVariants}
          className="mb-6 p-4 rounded-md bg-[rgb(var(--destructive))]/15 text-[rgb(var(--destructive))] border border-[rgb(var(--destructive))]/40"
        >
          Error: {pageError}
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {adminCardDefinitions.map((cardDef) => {
            const IconComponent = cardDef.icon;
            return (
              <motion.div key={cardDef.id} variants={itemVariants}>
                <Link
                  href={cardDef.href}
                  className="block group"
                  onMouseEnter={() => setHoveredCard(cardDef.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <Card className="h-full bg-[rgb(var(--card))] border-[rgb(var(--border))] hover:border-[rgb(var(--accent))] transition-all duration-300 flex flex-col shadow-md hover:shadow-xl">
                    <CardHeader
                      className={cn(
                        "relative overflow-hidden p-5 rounded-t-[var(--radius)]",
                        "bg-slate-800"
                      )}
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <CardTitle
                          className={cn(
                            "flex items-center",
                            "text-[rgb(var(--accent))]"
                          )}
                        >
                          <span
                            className={cn(
                              "p-2 rounded-lg shadow-md mr-3",
                              "bg-slate-800"
                            )}
                          >
                            <IconComponent
                              size={22}
                              className="text-[rgb(var(--qhala-soft-peach-darker))]"
                            />
                          </span>
                          {cardDef.title}
                        </CardTitle>
                        <ArrowRight
                          size={20}
                          className={cn(
                            "transform transition-all duration-300",
                            hoveredCard === cardDef.id
                              ? "translate-x-1 text-[rgb(var(--accent))]"
                              : "text-[rgba(var(--accent),0.6)]"
                          )}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-5 flex-grow">
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">
                        {cardDef.description}
                      </p>
                    </CardContent>
                    <CardFooter className="text-xs text-[rgb(var(--muted-foreground))] flex items-center p-5">
                      {cardStats[cardDef.id]?.loading ? (
                        <LoadingSpinner size={12} className="mr-1.5" />
                      ) : (
                        <Eye size={12} className="mr-1.5" />
                      )}
                      {cardStats[cardDef.id]?.loading
                        ? "Loading..."
                        : `${cardStats[cardDef.id]?.value} ${
                            cardStats[cardDef.id]?.label
                          }`}
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div variants={itemVariants} className="mt-10">
          <Card className="bg-[rgb(var(--card))] shadow-md">
            <CardHeader className="border-b border-[rgb(var(--border))]">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[rgb(var(--card-foreground))]">
                  <Plus size={20} className="text-[rgb(var(--primary))]" />
                  Quick Actions
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                {initialQuickActions.map((action) => {
                  const IconComponent = action.icon;
                  const buttonClasses = cn(
                    "px-4 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors flex items-center gap-2 group",
                    action.bgColor,
                    action.hoverBgColor,
                    action.textColor
                  );
                  if (action.href) {
                    return (
                      <Link
                        href={action.href}
                        key={action.id}
                        className={buttonClasses}
                      >
                        <span className="group-hover:scale-110 transition-transform duration-200">
                          <IconComponent size={16} />
                        </span>
                        {action.title}
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={action.id}
                      onClick={action.onClick}
                      className={buttonClasses}
                    >
                      <span className="group-hover:scale-110 transition-transform duration-200">
                        <IconComponent size={16} />
                      </span>
                      {action.title}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
