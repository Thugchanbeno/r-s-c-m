// app/dashboard/page.jsx
"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/main-dashboard";
import { LoadingSpinner } from "@/components/dashboard/dashboard-components";

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin?callbackUrl=/dashboard");
    },
  });

  if (status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-10 text-center">
        <LoadingSpinner size={32} />
        <p className="mt-4 text-lg text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
    return null;
  }

  return <Dashboard user={session.user} />;
}
