// components/dashboard/main-dashboard.jsx
import React from "react";
import EmployeeDashboard from "@/components/dashboard/employee-dashboard";
import PMDashboard from "@/components/dashboard/pm-dashboard";
import HRDashboard from "@/components/dashboard/hr-admin-dashboard";
import ManagerDashboard from "@/components/dashboard/line-manager-dashboard";

const Dashboard = ({ user }) => {
  const renderDashboard = () => {
    switch (user.role) {
      case "employee":
        return <EmployeeDashboard user={user} />;
        ``;
      case "pm":
        return <PMDashboard user={user} />;
      case "hr":
      case "admin":
        return <HRDashboard user={user} />;
      case "line_manager":
        return <ManagerDashboard user={user} />;
      default:
        return <EmployeeDashboard user={user} />;
    }
  };

  return <div className="min-h-screen">{renderDashboard()}</div>;
};

export default Dashboard;
