"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/common/LoadingSpinner.jsx";
import Badge from "@/components/common/Badge";
import { Card } from "@/components/common/Card";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) {
          let errorMsg = `Error: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg || errorData.error;
          } catch (parseError) {
            console.error("Error parsing error response:", parseError);
          }
          throw new Error(errorMsg);
        }

        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setProjects(result.data);
        } else {
          throw new Error(result.error || "Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError(error.message || "Failed to fetch projects");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-[rgb(var(--background))] min-h-[200px]">
        <LoadingSpinner loading={loading} size={32} />
        <span className="ml-3 mt-2 text-[rgb(var(--muted-foreground))]">
          Loading projects...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 text-red-700 border border-red-200 rounded-[var(--radius)] shadow-sm">
        <p className="font-semibold">Error loading projects:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center p-6 text-[rgb(var(--muted-foreground))] border border-dashed border-[rgb(var(--border))] rounded-[var(--radius)]">
        No projects found.
      </div>
    );
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Completed":
        return "primary";
      case "Planning":
        return "warning";
      default:
        return "default";
    }
  };
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project._id} className="overflow-hidden">
          {" "}
          {/* Use themed Card */}
          {/* CardContent will provide padding and themed background */}
          <div className="p-4">
            {" "}
            {/* Explicit padding if CardContent isn't used directly or for override */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-1">
                <Link
                  href={`/projects/${project._id}`}
                  className="text-[rgb(var(--primary))] hover:underline"
                >
                  {project.name}
                </Link>
              </h3>
              <Badge
                variant={getStatusBadgeVariant(project.status)}
                size="sm"
                pill={false}
              >
                {project.status}
              </Badge>
            </div>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3 line-clamp-2">
              {project.description}
            </p>
            <div className="text-xs text-[rgb(var(--muted-foreground))]">
              {project.pmId?.name
                ? `PM: ${project.pmId.name}`
                : "PM: Not Assigned"}

              {project.requiredSkills && project.requiredSkills.length > 0 && (
                <span className="ml-4">
                  Skills Required: {project.requiredSkills.length}
                </span>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProjectList;
