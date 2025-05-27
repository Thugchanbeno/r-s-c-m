"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminNavigation from "@/components/AdminNavigation";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (status === "unauthenticated") {
      console.log("AdminLayout: Unauthenticated, redirecting to signin.");
      redirect(`/api/auth/signin?callbackUrl=${pathname}`);
      return;
    }

    if (status === "authenticated") {
      const allowedRoles = ["admin", "hr"];
      const userRole = session.user?.role;

      if (!userRole || !allowedRoles.includes(userRole)) {
        console.warn(
          `AdminLayout: User ${session.user?.email} with role '${userRole}' attempted to access restricted admin route. Redirecting.`
        );
        redirect("/dashboard"); // Or show an "Access Denied" page
      }
    }
  }, [status, session, isLoading, pathname]);

  if (isLoading || status !== "authenticated") {
    return (
      <div className="flex justify-center items-center flex-grow p-10">
        <LoadingSpinner size={30} />
        <span className="ml-4 text-lg text-gray-600 dark:text-gray-400">
          Verifying access...
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <AdminNavigation />
        <div className="flex flex-col flex-1 h-screen overflow-hidden">
          <Navbar className="sticky top-0" />
          <div className="flex flex-col overflow-y-auto">
            <main className="flex-grow p-4 md:p-6 lg:p-8">
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
