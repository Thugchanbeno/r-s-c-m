"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/common/Card.jsx";
import {
  Users,
  Wrench,
  Settings,
  TrendingUp,
  Eye,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [hoveredCard, setHoveredCard] = useState(null);
  //might need to be moved to a separate component for granularity
  const adminCards = [
    {
      id: "users",
      title: "User Management",
      description: "View, edit roles, and manage user accounts.",
      icon: <Users size={22} />,
      href: "/admin/users",
      stats: "24 active users",
      color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: "skills",
      title: "Skill Taxonomy",
      description: "Manage skill categories and individual skills.",
      icon: <Wrench size={22} />,
      href: "/admin/skills",
      stats: "86 skills defined",
      color: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      id: "settings",
      title: "System Settings",
      description: "Configure application-wide settings and preferences.",
      icon: <Settings size={22} />,
      href: "/admin/settings",
      stats: "Last updated 2 days ago",
      color: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "View system usage statistics and reports.",
      icon: <TrendingUp size={22} />,
      href: "/admin/analytics",
      stats: "12 reports available",
      color: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3  dark:text-gray-100">
          Admin Dashboard
        </h1>
        <p className="text-gray-950 dark:text-gray-100 max-w-2xl">
          Welcome to the administration panel. Manage all aspects of your system
          from this central dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminCards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className="block group"
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <Card
              className={`h-full border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 ${
                hoveredCard === card.id
                  ? "shadow-lg transform -translate-y-1"
                  : "shadow"
              }`}
            >
              <CardHeader className={`${card.color} rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-gray-950 dark:text-gray-100">
                    <span className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm mr-3">
                      {card.icon}
                    </span>
                    {card.title}
                  </CardTitle>
                  <ArrowRight
                    size={20}
                    className={`text-gray-400 transform transition-transform duration-300 ${
                      hoveredCard === card.id
                        ? "translate-x-1 text-blue-500"
                        : ""
                    }`}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-100">
                  {card.description}
                </p>
              </CardContent>
              <CardFooter className="text-xs text-gray-500 dark:text-gray-100 flex items-center">
                <Eye size={12} className="mr-1" />
                {card.stats}
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Quick Actions
        </h2>
        {/* this section's functionality hasn't been implemented yet */}
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-800 dark:text-blue-200 rounded-md transition-colors flex items-center">
            <Users size={16} className="mr-2" />
            Add New User
          </button>
          <button className="px-4 py-2 text-sm bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/40 text-emerald-800 dark:text-emerald-200 rounded-md transition-colors flex items-center">
            <Wrench size={16} className="mr-2" />
            Create Skill
          </button>
          <button className="px-4 py-2 text-sm bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-800/40 text-purple-800 dark:text-purple-200 rounded-md transition-colors flex items-center">
            <Settings size={16} className="mr-2" />
            System Backup
          </button>
        </div>
      </div>
    </div>
  );
}
