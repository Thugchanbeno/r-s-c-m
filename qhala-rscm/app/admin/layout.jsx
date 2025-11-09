"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AppLayout from "@/components/layout/AppLayout";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (status === "unauthenticated") {
      redirect(`/api/auth/signin?callbackUrl=${pathname}`);
      return;
    }
    if (status === "authenticated") {
      const allowedRoles = ["admin", "hr"];
      const userRole = session.user?.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        redirect("/dashboard");
      }
    }
  }, [status, session, isLoading, pathname]);

  if (isLoading || status !== "authenticated") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 gap-4">
        <LoadingSpinner width={200} height={4} />
        <p className="text-sm text-rscm-dark-purple">Verifying access...</p>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
