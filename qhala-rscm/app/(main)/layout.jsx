"use client";
import AdminSidebar from "@/components/navigation/AdminSidebar.jsx";
import Sidebar from "@/components/navigation/Sidebar.jsx";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import ContentHeader from "@/components/navigation/ContentHeader";
import ActionIconsCluster from "@/components/navigation/ActionIconsCluster";
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

  return (
    <div className="flex h-screen text-[rgb(var(--foreground))]">
      {useAdminStyling ? <AdminSidebar /> : <Sidebar />}

      <div
        className={cn("flex-1 flex flex-col", headerBandBg, "overflow-hidden")}
      >
        <div className="px-1 md:px-2  pb-1 md:pt-2 md:pb-2 shrink-0">
          <ContentHeader isAdminArea={useAdminStyling} />
        </div>
        <div className="fixed top-1 right-0 z-50 md:top-[6px]">
          <ActionIconsCluster isAdminArea={useAdminStyling} />
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
