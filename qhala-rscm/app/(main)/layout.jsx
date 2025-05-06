"use client";
import Sidebar from "@/components/Sidebar.jsx";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function MainAppLayout({ children }) {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin?callbackUrl=/dashboard");
    },
  });

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size={30} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex h-screen bg-gray-100 dark:bg-slate-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto">
          <main className="flex-grow p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </>
  );
}
