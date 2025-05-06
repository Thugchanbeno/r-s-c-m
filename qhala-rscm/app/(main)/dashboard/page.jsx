"use client";
import React from "react";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard.jsx";
import HRAdminDashboard from "@/components/dashboard/HRAdminDashboard.jsx";
import PMDashboard from "@/components/dashboard/PMDashboard.jsx";

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // redirect('/api/auth/signin?callbackUrl=/dashboard');
      console.log("Redirecting unauthenticated user from dashboard...");
    },
  });
  const isLoadingSession = status === "loading";

  const renderDashboardContent = () => {
    const userRole = session.user.role;
    const userName = session.user.name || session.user.email || "User";

    return (
      <div className="space-y-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-900">
            Welcome back, {userName}!
          </h1>
          <p className="text-gray-900 dark:text-gray-900">
            Resource Management Dashboard
          </p>
        </div>
        {(userRole === "employee" ||
          userRole === "pm" ||
          userRole === "hr" ||
          userRole === "admin") && <EmployeeDashboard user={session.user} />}
        {(userRole === "pm" || userRole === "hr" || userRole === "admin") && (
          <PMDashboard user={session.user} />
        )}
        {(userRole === "hr" || userRole === "admin") && (
          <HRAdminDashboard user={session.user} />
        )}
      </div>
    );
  };
  if (isLoadingSession) {
    return (
      <div className="flex justify-center items-center pt-20">
        <LoadingSpinner size={30} />
      </div>
    );
  }
  return <div>{renderDashboardContent()}</div>;
}
