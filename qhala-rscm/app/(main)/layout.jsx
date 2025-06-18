"use client";
import AdminSidebar from "@/components/navigation/AdminSidebar.jsx";
import Sidebar from "@/components/navigation/Sidebar.jsx";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import ContentHeader from "@/components/navigation/ContentHeader";
import ActionIconsCluster from "@/components/navigation/ActionIconsCluster";
import ContentFooter from "@/components/navigation/ContentFooter";
import DiscoverIconCluster from "@/components/navigation/DiscoverIconCluster";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function MainAppLayout({ children }) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin?callbackUrl=/dashboard");
    },
  });
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith("/admin");
  const useAdminStyling = isAdminPath;

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[rgb(var(--background))]">
        <LoadingSpinner size={30} />
      </div>
    );
  }

  const headerBandBg = useAdminStyling ? "bg-slate-900" : "bg-slate-900";
  const footerBandBg = useAdminStyling ? "bg-slate-900" : "bg-slate-900";

  const iconClusterTopOffset = "top-[8px]";
  const iconClusterBottomOffset = "bottom-[8px]";

  return (
    <div className="flex h-screen text-[rgb(var(--foreground))]">
      {useAdminStyling ? <AdminSidebar /> : <Sidebar />}
      <div
        className={cn("flex-1 flex flex-col", headerBandBg, "overflow-hidden")}
      >
        <div className="px-3 md:px-4 pt-2 pb-1 md:pt-3 md:pb-2 shrink-0">
          <ContentHeader isAdminArea={useAdminStyling} />
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
          <ContentFooter isAdminArea={useAdminStyling} />
        </div>
      </div>
    </div>
  );
}
