"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/common/Card.jsx"; // Themed
import Button from "@/components/common/Button.jsx"; // Themed
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

// Animation variants (unchanged)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

export default function AdminDashboardPage() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const adminCards = [
    {
      id: "users",
      title: "User Management",
      description: "View, edit roles, and manage user accounts.",
      icon: <Users size={22} />,
      href: "/admin/users",
      stats: "24 active users",
      color: "bg-[rgb(var(--primary-accent-background))]",
      gradient:
        "from-[rgba(var(--primary),0.1)] to-[rgba(var(--primary),0.15)]",
    },
    {
      id: "skills",
      title: "Skill Taxonomy",
      description: "Manage skill categories and individual skills.",
      icon: <Wrench size={22} />,
      href: "/admin/skills",
      stats: "86 skills defined",
      color: "bg-emerald-50",
      gradient: "from-emerald-500/10 to-emerald-600/10",
    },
    {
      id: "settings",
      title: "System Settings",
      description: "Configure application-wide settings and preferences.",
      icon: <Settings size={22} />,
      href: "/admin/settings",
      stats: "Last updated 2 days ago",
      color: "bg-purple-50",
      gradient: "from-purple-500/10 to-purple-600/10",
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "View system usage statistics and reports.",
      icon: <TrendingUp size={22} />,
      href: "/admin/analytics",
      stats: "12 reports available",
      color: "bg-amber-50",
      gradient: "from-amber-500/10 to-amber-600/10",
    },
  ];

  const quickActions = [
    {
      id: "add-user",
      title: "Add New User",
      icon: <Users size={16} />,
      color:
        "bg-[rgba(var(--primary),0.1)] hover:bg-[rgba(var(--primary),0.2)]",
      textColor: "text-[rgb(var(--primary))]",
    },
    {
      id: "add-skill",
      title: "Create Skill",
      icon: <Wrench size={16} />,
      color: "bg-emerald-100 hover:bg-emerald-200",
      textColor: "text-emerald-800",
    },
    {
      id: "backup",
      title: "System Backup",
      icon: <Shield size={16} />,
      color: "bg-purple-100 hover:bg-purple-200",
      textColor: "text-purple-800",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[rgb(var(--muted))] p-4 sm:p-6 lg:p-8 rounded-lg"
    >
      <header className="pb-6 mb-6 border-b border-[rgb(var(--border))]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <motion.h1
                variants={itemVariants}
                className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              >
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
                  <Activity size={16} className="mr-2" />
                  System Status
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto">
        {/* Admin Cards */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {adminCards.map((card) => (
            <motion.div key={card.id} variants={itemVariants}>
              <Link
                href={card.href}
                className="block group"
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Card className="h-full border-transparent hover:border-[rgba(var(--primary),0.5)] transition-all duration-300 flex flex-col">
                  <CardHeader
                    className={`relative overflow-hidden ${card.color} rounded-t-[var(--radius)] p-5`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${
                        card.gradient
                      } transform transition-transform duration-500 ${
                        hoveredCard === card.id ? "scale-110" : "scale-100"
                      }`}
                    />
                    <div className="relative z-10 flex items-center justify-between">
                      <CardTitle className="flex items-center text-[rgb(var(--card-foreground))]">
                        <span className="p-2 rounded-lg bg-[rgba(var(--card),0.8)] shadow-sm backdrop-blur-sm mr-3">
                          {card.icon}
                        </span>
                        {card.title}
                      </CardTitle>
                      <ArrowRight
                        size={20}
                        className={`text-[rgb(var(--muted-foreground))] transform transition-all duration-300 ${
                          hoveredCard === card.id
                            ? "translate-x-1 text-[rgb(var(--primary))]"
                            : ""
                        }`}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 flex-grow">
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      {card.description}
                    </p>
                  </CardContent>
                  <CardFooter className="text-xs text-[rgb(var(--muted-foreground))] flex items-center p-5">
                    <Eye size={12} className="mr-1" />
                    {card.stats}
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mt-8">
          <Card>
            <CardHeader className="border-b border-[rgb(var(--border))]">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[rgb(var(--card-foreground))]">
                  <Plus size={20} className="text-[rgb(var(--primary))]" />
                  Quick Actions
                </CardTitle>
                <button className="text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] flex items-center gap-1">
                  View All
                  <ChevronRight size={16} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    className={`px-4 py-2 rounded-[var(--radius)] text-sm font-medium ${action.color} ${action.textColor} transition-colors flex items-center gap-2 group`}
                  >
                    <span className="group-hover:scale-110 transition-transform duration-200">
                      {action.icon}
                    </span>
                    {action.title}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
