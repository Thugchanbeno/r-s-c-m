// app/(main)/projects/page.jsx
"use client";
import { useProjects } from "@/lib/hooks/useProjects";
import ProjectList from "@/components/projects/project-list";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plus, AlertCircle } from "lucide-react";

const ProjectsPage = () => {
  const { projects, authUser, loading } = useProjects();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner size={40} />
          <p className="mt-4 text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        {authUser && ["pm", "hr", "admin"].includes(authUser.role) && (
          <Link href="/projects/new">
            <Button>
              <Plus size={16} className="mr-2" />
              New Project
            </Button>
          </Link>
        )}
      </div>

      {/* Show error state if projects failed to load */}
      {projects === undefined && !loading ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <AlertCircle size={32} className="mx-auto text-destructive mb-3" />
            <h3 className="font-medium text-destructive mb-2">
              Failed to Load Projects
            </h3>
            <p className="text-sm text-destructive/80">
              There was an error loading your projects. Please try refreshing
              the page.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ProjectList />
      )}
    </div>
  );
};

export default ProjectsPage;
