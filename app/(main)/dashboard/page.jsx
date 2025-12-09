// app/dashboard/page.jsx
"use client";
import { useAuth } from "@/lib/hooks/useAuth";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/main-dashboard";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 gap-4">
        <LoadingSpinner width={200} height={4} />
        <p className="text-sm text-rscm-dark-purple">Loading your dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
    return null;
  }

  return <Dashboard user={user} />;
}
