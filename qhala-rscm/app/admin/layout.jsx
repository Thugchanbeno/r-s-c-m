"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ContentHeader from "@/components/navigation/ContentHeader";
import ActionIconsCluster from "@/components/navigation/ActionIconsCluster";
import AdminSidebar from "@/components/navigation/AdminSidebar";
import ContentFooter from "@/components/navigation/ContentFooter";
import DiscoverIconCluster from "@/components/navigation/DiscoverIconCluster";
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

  const iconClusterTopOffset = "top-[8px]";
  const iconClusterBottomOffset = "bottom-[8px]";

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
        <div className="px-3 md:px-4 pt-2 pb-1 md:pt-3 md:pb-2 shrink-0">
          <ContentHeader isAdminArea={isAdminArea} />
        </div>
        <div className={cn("fixed right-0 z-50", iconClusterTopOffset)}>
          <ActionIconsCluster />
        </div>
        <main
          className={cn(
            "flex-1 overflow-y-auto",
            "bg-[rgb(var(--background))]",
            "rounded-tl-lg rounded-bl-lg",
            "pt-14 md:pt-16 pb-14 md:pb-16",
            "px-4 sm:px-6 md:px-8"
          )}
        >
          {children}
        </main>
        <div className={cn("fixed right-0 z-50", iconClusterBottomOffset)}>
          <DiscoverIconCluster />
        </div>
        <div className="px-3 md:px-4 pt-1 pb-2 md:pt-2 md:pb-3 shrink-0">
          <ContentFooter isAdminArea={isAdminArea} />
        </div>
      </div>
    </div>
  );
}
