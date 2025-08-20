"use client";
import { useEffect, useState } from "react";
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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

  const handleMobileSidebarToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  if (isLoading || status !== "authenticated") {
    return (
      <div className="flex flex-col h-screen bg-[rgb(var(--background))]">
        <div className="flex flex-1 justify-center items-center p-4 sm:p-10">
          <div className="flex flex-col sm:flex-row items-center">
            <LoadingSpinner size={30} color="rgb(var(--primary))" />
            <span className="mt-2 sm:mt-0 sm:ml-4 text-base sm:text-lg text-[rgb(var(--muted-foreground))] text-center">
              Verifying access...
            </span>
          </div>
        </div>
      </div>
    );
  }

  const iconClusterTopOffset = "top-[8px] sm:top-[12px]";
  const iconClusterBottomOffset = "bottom-[8px] sm:bottom-[12px]";

  return (
    <div className="flex h-screen text-[rgb(var(--foreground))] relative">
      <AdminSidebar 
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={handleMobileSidebarClose}
      />
      <div
        className={cn(
          "flex-1 flex flex-col",
          isAdminArea ? "bg-slate-900" : "bg-[rgb(var(--card))]",
          "overflow-hidden",
          "w-full min-w-0"
        )}
      >
        <div className="px-0 md:px-2 lg:px-3 xl:px-4 pt-1 pb-1 sm:pt-2 sm:pb-1 md:pt-3 md:pb-2 shrink-0">
          <ContentHeader isAdminArea={isAdminArea} />
        </div>
        <div className={cn(
          "fixed z-40",
          "left-0 right-0 md:left-auto md:right-2 lg:md:right-0",
          iconClusterTopOffset
        )}>
          <ActionIconsCluster 
            onMobileSidebarToggle={handleMobileSidebarToggle}
            showMobileSidebarToggle={true}
          />
        </div>

        <main
          className={cn(
            "flex-1 overflow-y-auto",
            "bg-[rgb(var(--background))]",
            "rounded-tl-lg rounded-bl-lg",
            "pt-16 sm:pt-18 md:pt-20",
            "pb-16 sm:pb-18 md:pb-20",
            "px-2 sm:px-4 md:px-6 lg:px-8",
            "min-h-0"
          )}
        >
          <div className="w-full max-w-full overflow-hidden">
            {children}
          </div>
        </main>
        <div className={cn("fixed right-2 sm:right-0 z-40", iconClusterBottomOffset)}>
          <DiscoverIconCluster />
        </div>

        <div className="px-0 md:px-2 lg:px-3 xl:px-4 pt-1 pb-1 sm:pt-1 sm:pb-2 md:pt-2 md:pb-3 shrink-0">
          <ContentFooter isAdminArea={isAdminArea} />
        </div>
      </div>
    </div>
  );
}