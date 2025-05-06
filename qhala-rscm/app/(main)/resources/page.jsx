"use client";
import ResourcesView from "@/components/views/ResourcesView.jsx"; // Adjust path
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function ResourcesPage() {
  const { status } = useSession({ required: true });

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center pt-20">
        <LoadingSpinner size={30} />
      </div>
    );
  }

  return (
    <div>
      <ResourcesView />
    </div>
  );
}
