"use client";
import ProjectList from "@/components/ProjectList.jsx";
import Link from "next/link";
import Button from "@/components/common/Button.jsx";
import { PlusCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function ProjectsPage() {
  const { data: session, status } = useSession({ required: true });

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center pt-20">
        <LoadingSpinner size={30} />
      </div>
    );
  }

  const canCreateProject =
    session?.user?.role && ["admin", "hr", "pm"].includes(session.user.role);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Projects
        </h1>

        {canCreateProject && (
          <Link href="/projects/new">
            <Button>
              <PlusCircle size={18} className="mr-2" /> Create New Project
            </Button>
          </Link>
        )}
      </div>
      {/* TODO: Modify ProjectList to potentially accept filters based on role if needed */}
      <ProjectList />
    </div>
  );
}
