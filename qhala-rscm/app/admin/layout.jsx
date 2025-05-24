"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ContentHeader from "@/components/navigation/ContentHeader";
import ActionIconsCluster from "@/components/navigation/ActionIconsCluster";
import AdminSidebar from "@/components/navigation/AdminSidebar";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const pathname = usePathname();
  const isAdminArea = true;

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
      <div className="flex flex-col h-screen bg-[rgb(var(--background))]">
        <div className="flex flex-1 justify-center items-center p-10">
          <LoadingSpinner size={30} color="rgb(var(--primary))" />
          <span className="ml-4 text-lg text-[rgb(var(--muted-foreground))]">
            Verifying access...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen text-[rgb(var(--foreground))]">
      <AdminSidebar />
      <div
        className={cn(
          "flex-1 flex flex-col",
          isAdminArea ? "bg-slate-900" : "bg-[rgb(var(--card))]",
          "overflow-hidden"
        )}
      >
        <div className="px-1 md:px-2  pb-1 md:pt-2 md:pb-2 shrink-0">
          <ContentHeader isAdminArea={isAdminArea} />
        </div>
        <div className="fixed top-1 right-0 z-50 md:top-[6px]">
          <ActionIconsCluster isAdminArea={isAdminArea} />
        </div>
        <main
          className={cn(
            "flex-1 overflow-y-auto",
            "p-4 sm:p-6 md:p-8",
            "bg-[rgb(var(--background))]",
            "rounded-tl-lg",
            "pt-14 md:pt-16"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
