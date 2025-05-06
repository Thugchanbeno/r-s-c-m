"use client";
import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProjectForm from "@/components/ProjectForm";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ArrowLeft } from "lucide-react";

export default function NewProjectPage() {
  const { data: session, status } = useSession({ required: true });
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canCreateProject =
    session?.user?.role && ["admin", "hr", "pm"].includes(session.user.role);

  const handleCreateProject = useCallback(
    async (projectData) => {
      setIsSubmitting(true);
      setError(null);
      console.log("Submitting new project data:", projectData);

      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectData),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(
            result.error || `Error ${response.status}: ${response.statusText}`
          );
        }
        if (!result.success) {
          throw new Error(result.error || "API returned success: false");
        }

        console.log("Project created successfully:", result.data);

        // alert('Project created successfully!'); set up toast
        router.push("/projects");
        // router.refresh(); // Optionally refresh data on the target page if needed
      } catch (err) {
        console.error("Failed to create project:", err);
        setError(
          err.message || "Could not create project. Please check details."
        );
        setIsSubmitting(false);
      }
    },
    [router]
  );

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center pt-20">
        <LoadingSpinner size={30} />
      </div>
    );
  }

  if (!canCreateProject) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">
          Access Denied: You do not have permission to create projects.
        </p>
        <Link
          href="/dashboard"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/projects"
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 inline-flex items-center mb-2 text-sm"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Create New Project
        </h1>
      </div>

      <ProjectForm
        onSubmit={handleCreateProject}
        isSubmitting={isSubmitting}
        submitError={error}
        // onCancel={() => router.push('/projects')}
        // isEditMode={false} // Explicitly set if form is reused for editing
      />
    </div>
  );
}
