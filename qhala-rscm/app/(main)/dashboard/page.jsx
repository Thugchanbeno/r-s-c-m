"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { motion } from "framer-motion";
import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard.jsx";
import HrAdminDashboard from "@/components/dashboard/HRAdminDashboard.jsx";
import PmDashboard from "@/components/dashboard/PMDashboard.jsx";
import { containerVariants } from "@/lib/animations.js";

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

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin?callbackUrl=/dashboard");
    },
  });

  if (status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[rgb(var(--background))] p-10 text-center">
        <LoadingSpinner size={30} />
        <p className="mt-3 text-[rgb(var(--muted-foreground))]">
          Loading dashboard...
        </p>
      </div>
    );
  }

  const userRole = session.user.role;
  const userName = session.user.name || session.user.email || "User";

  return (
    <motion.div
      className="p-4 md:p-6 bg-[rgb(var(--background))] min-h-screen rounded-lg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="mb-8" variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold text-[rgb(var(--foreground))]">
          Welcome back, {userName}!
        </h1>
        <p className="text-[rgb(var(--muted-foreground))] mt-1">
          Your Resource Management Dashboard
        </p>
      </motion.div>

      <div className="space-y-6">
        {(userRole === "employee" ||
          userRole === "pm" ||
          userRole === "hr" ||
          userRole === "admin") && (
          <motion.div variants={itemVariants}>
            <EmployeeDashboard user={session.user} />
          </motion.div>
        )}
        {(userRole === "pm" || userRole === "hr" || userRole === "admin") && (
          <motion.div variants={itemVariants}>
            <PmDashboard user={session.user} />
          </motion.div>
        )}
        {(userRole === "hr" || userRole === "admin") && (
          <motion.div variants={itemVariants}>
            <HrAdminDashboard user={session.user} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
