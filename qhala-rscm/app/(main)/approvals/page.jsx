"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import ApprovalsViewNew from "@/components/views/ApprovalsViewNew";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function ApprovalsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin?callbackUrl=/approvals");
    },
  });

  if (status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-10 text-center">
        <LoadingSpinner width={200} height={4} />
        <p className="mt-4 text-sm text-gray-600">
          Loading approvals...
        </p>
      </div>
    );
  }

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/approvals");
    return null;
  }

  if (!["line_manager", "hr", "admin", "pm"].includes(session.user.role)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-10 text-center">
        <p className="text-sm text-red-600">
          Access Denied: You don&apos;t have permission to view this page.
        </p>
      </div>
    );
  }

  return <ApprovalsViewNew user={session.user} />;
}
