// components/dashboard/main-dashboard.jsx
import React from "react";
import EmployeeDashboardNew from "@/components/dashboard/EmployeeDashboardNew";
import PMDashboardNew from "@/components/dashboard/PMDashboardNew";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import LineManagerDashboardNew from "@/components/dashboard/LineManagerDashboardNew";

const Dashboard = ({ user }) => {
  const renderDashboard = () => {
    switch (user.role) {
      case "employee":
        return <EmployeeDashboardNew user={user} />;
      case "pm":
        return <PMDashboardNew user={user} />;
      case "hr":
      case "admin":
        return <AdminDashboard user={user} />;
      case "line_manager":
        return <LineManagerDashboardNew user={user} />;
      default:
        return <EmployeeDashboardNew user={user} />;
    }
  };

  return <div className="min-h-screen">{renderDashboard()}</div>;
};

export default Dashboard;
