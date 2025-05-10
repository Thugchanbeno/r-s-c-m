"use client";
import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProjectForm from "@/components/ProjectForm";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/common/Card";

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

      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectData),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(
            result.error || `Error ${response.status}: ${response.statusText}`
          );
        }
        const newProjectId = result.data?._id;
        if (newProjectId) {
          router.push(`/projects/${newProjectId}`);
        } else {
          router.push("/projects");
        }
      } catch (err) {
        console.error("Failed to create project:", err);
        setError(
          err.message || "Could not create project. Please check details."
        );
      } finally {
        let requestSuccessful = false;
        if (typeof response !== "undefined" && typeof result !== "undefined") {
          requestSuccessful = response.ok && result.success;
        }
        if (error || !requestSuccessful) {
          setIsSubmitting(false);
        }
      }
    },
    [router, error]
  );

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[rgb(var(--background))]">
        <LoadingSpinner size={30} />
      </div>
    );
  }

  if (!canCreateProject) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[rgb(var(--muted))] p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <p className="text-lg font-medium text-red-600 mb-4">
              Access Denied
            </p>
            <p className="text-[rgb(var(--muted-foreground))] mb-6">
              You do not have permission to create projects.
            </p>
            <Link
              href="/dashboard"
              className="text-[rgb(var(--primary))] hover:underline font-medium"
            >
              Go to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/projects"
          className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] inline-flex items-center text-sm font-medium"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Projects
        </Link>
      </div>
      <ProjectForm
        onSubmit={handleCreateProject}
        isSubmitting={isSubmitting}
        submitError={error}
        onCancel={() => router.push("/projects")}
      />
    </div>
  );
}
