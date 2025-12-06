"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SkillsManagementNew from "@/components/admin/skills/SkillsManagementNew";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/lib/hooks/useAuth";

export default function AdminSkillsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !["admin", "hr"].includes(user.role))) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size={32} />
          <p className="mt-2 text-sm text-gray-600">
            Loading skills management...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !["admin", "hr"].includes(user.role)) {
    return null; // Will redirect via useEffect
  }

  return <SkillsManagementNew />;
}
