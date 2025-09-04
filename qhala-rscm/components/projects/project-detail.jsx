"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/Card";
import { Progress } from "@/components/ui/progress";
import { TaskManagerConvex } from "@/components/projects/task-manager";
import {
  Briefcase,
  Users,
  Calendar,
  Target,
  TrendingUp,
  ArrowLeft,
  Settings,
  UserPlus,
  SearchCheck,
  Info,
  Wrench,
} from "lucide-react";
import { getStatusBadgeVariant } from "@/components/common/CustomColors";

const ProjectDetail = ({
  project,
  allocations = [],
  tasks = [],
  utilization,
  recommendations = [],
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onCreateResourceRequest,
  onGetRecommendations,
  loadingRecommendations = false,
  showRecommendations = false,
  canManageTeam = false,
}) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const utilizationPercentage = utilization?.utilizationPercentage || 0;
  const teamSize = utilization?.teamSize || allocations.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <Badge variant={getStatusBadgeVariant(project.status)}>
            {project.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href="/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase size={18} />
            Project Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Description
            </h3>
            <p className="text-foreground">
              {project.description || "No description provided."}
            </p>
          </div>

          {/* Project Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Start Date
              </h3>
              <p className="flex items-center gap-2">
                <Calendar size={14} />
                {formatDate(project.startDate)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                End Date
              </h3>
              <p className="flex items-center gap-2">
                <Calendar size={14} />
                {formatDate(project.endDate)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Department
              </h3>
              <p>{project.department}</p>
            </div>
          </div>

          {/* Required Skills */}
          {project.requiredSkills && project.requiredSkills.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Wrench size={14} />
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills.map((skill) => (
                  <Badge key={skill.skillId} variant="outline">
                    {skill.skillName}
                    {skill.proficiencyLevel && (
                      <span className="ml-1 text-xs opacity-70">
                        (Level {skill.proficiencyLevel})
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Utilization */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <TrendingUp size={14} />
              Team Utilization
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Overall Utilization</span>
                <span className="text-sm font-medium">
                  {utilizationPercentage}%
                </span>
              </div>
              <Progress value={utilizationPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Team size: {teamSize}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allocations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={18} />
            Allocated Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allocations.length > 0 ? (
            <div className="space-y-3">
              {allocations.map((alloc) => (
                <div
                  key={alloc._id}
                  className="flex justify-between items-center p-3 border rounded-lg bg-muted/30"
                >
                  <div>
                    <h4 className="font-medium">
                      {alloc.userId?.name || "Unknown User"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Role: {alloc.role} • {formatDate(alloc.startDate)} -{" "}
                      {formatDate(alloc.endDate)}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {alloc.allocationPercentage}%
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users
                size={32}
                className="mx-auto text-muted-foreground/30 mb-3"
              />
              <h3 className="font-medium mb-1">No team members allocated</h3>
              <p className="text-sm text-muted-foreground">
                Use the team management section below to find and request team
                members.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/*  Manage Team & Recommendations Section */}
      {canManageTeam && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus size={18} />
              Manage Team & Find Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Recommendations Button */}
            <div className="flex gap-2">
              <Button
                onClick={onGetRecommendations}
                disabled={loadingRecommendations}
                className="gap-2"
              >
                {loadingRecommendations ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Finding Matches...
                  </>
                ) : (
                  <>
                    <SearchCheck size={16} />
                    Find Matching Users (AI)
                  </>
                )}
              </Button>
              <Button variant="outline" className="gap-2">
                <UserPlus size={16} />
                Manual Request
              </Button>
            </div>

            {/* Recommendations Display */}
            {showRecommendations && (
              <div className="space-y-3">
                {recommendations.length > 0 ? (
                  <>
                    <h4 className="font-medium text-sm">AI Recommendations</h4>
                    {recommendations.map((user) => (
                      <div
                        key={user._id}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div>
                          <h5 className="font-medium">{user.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {user.department} • Match:{" "}
                            {Math.round((user.matchScore || 0) * 100)}%
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onCreateResourceRequest?.(user)}
                        >
                          Request
                        </Button>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-6 border rounded-lg bg-muted/30">
                    <Info
                      size={24}
                      className="mx-auto text-muted-foreground/50 mb-2"
                    />
                    <p className="text-sm text-muted-foreground">
                      No specific recommendations found. Try manual search.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/*  Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={18} />
            Project Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TaskManagerConvex
            projectId={project._id}
            tasks={tasks}
            onCreateTask={onCreateTask}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetail;
