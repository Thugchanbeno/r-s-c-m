"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import NotificationsViewNew from "@/components/views/NotificationsViewNew";

export default function NotificationsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin?callbackUrl=/notifications");
    },
  });

  if (status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-10 text-center">
        <LoadingSpinner width={200} height={4} />
        <p className="mt-4 text-sm text-gray-600">
          Loading notifications...
        </p>
      </div>
    );
  }

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/notifications");
    return null;
  }

  return <NotificationsViewNew />;
}
