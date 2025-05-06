"use client";
import ProfileView from "@/components/views/ProfileView.jsx"; // Adjust path if needed
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function ProfilePage() {
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
      <ProfileView />
    </div>
  );
}
