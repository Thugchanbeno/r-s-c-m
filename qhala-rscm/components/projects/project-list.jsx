"use client";

import Link from "next/link";
import { useProjects } from "@/lib/hooks/useProjects";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { User, Star } from "lucide-react";

const ProjectList = () => {
  const { projects } = useProjects();

  if (projects === undefined) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <LoadingSpinner size={32} />
        <p className="mt-2 text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center p-6 border border-dashed rounded-lg text-muted-foreground">
        No projects found.{" "}
        <Link href="/projects/new" className="text-primary hover:underline">
          Create one
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <Card key={project._id} className="p-4 hover:shadow-md transition">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">
              <Link
                href={`/projects/${project._id}`}
                className="hover:underline text-primary"
              >
                {project.name}
              </Link>
            </h3>
            <Badge
              variant={
                project.status === "Active"
                  ? "success"
                  : project.status === "Completed"
                    ? "primary"
                    : project.status === "Planning"
                      ? "warning"
                      : "default"
              }
            >
              {project.status}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <User size={14} /> {project.pmId?.name || "Unassigned"}
          </div>

          {project.requiredSkills?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {project.requiredSkills.slice(0, 4).map((s) => (
                <Badge key={s.skillId} variant="outline" size="sm">
                  {s.skillName}
                </Badge>
              ))}
              {project.requiredSkills.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{project.requiredSkills.length - 4} more
                </span>
              )}
            </div>
          )}

          {project.utilization && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Utilization</span>
                <span>{project.utilization.utilizationPercentage}%</span>
              </div>
              <Progress value={project.utilization.utilizationPercentage} />
            </div>
          )}

          {project.feedbackSummary && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star size={14} className="text-yellow-500" />
              {project.feedbackSummary.avgRating.toFixed(1)} (
              {project.feedbackSummary.count} reviews)
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ProjectList;
