"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import LineManagerRequestsView from "@/components/views/LineManagerRequestsView";
import { LoadingSpinner } from "@/components/dashboard/dashboard-components";

export default function ApprovalsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin?callbackUrl=/approvals");
    },
  });

  if (status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[rgb(var(--background))] p-10 text-center">
        <LoadingSpinner size={32} />
        <p className="mt-4 text-lg text-[rgb(var(--muted-foreground))]">
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
      <div className="flex flex-col justify-center items-center min-h-screen bg-[rgb(var(--background))] p-10 text-center">
        <p className="text-lg text-[rgb(var(--destructive))]">
          Access Denied: You don&apos;t have permission to view this page.
        </p>
      </div>
    );
  }

  return <LineManagerRequestsView user={session.user} />;
}
