"use client";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AppLayout from "@/components/layout/AppLayout";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function MainAppLayout({ children }) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin?callbackUrl=/dashboard");
    },
  });

  if (status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 gap-4">
        <LoadingSpinner width={200} height={4} />
        <p className="text-sm text-rscm-dark-purple">Authenticating...</p>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
