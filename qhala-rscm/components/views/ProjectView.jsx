// app/projects/page.jsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProjectList from "@/components/projects/project-list";
import { useProjects } from "@/lib/hooks/useProjects";
import {
  Plus,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Filter,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ProjectsPage = () => {
  const { projects, authUser } = useProjects();
  const [showStats, setShowStats] = useState(true);

  // Calculate statistics
  const stats = {
    total: projects?.length || 0,
    active: projects?.filter((p) => p.status === "Active").length || 0,
    planning: projects?.filter((p) => p.status === "Planning").length || 0,
    completed: projects?.filter((p) => p.status === "Completed").length || 0,
    onHold: projects?.filter((p) => p.status === "On Hold").length || 0,
    myProjects: projects?.filter((p) => p.pmId === authUser?.id).length || 0,
    avgUtilization:
      projects?.length > 0
        ? Math.round(
            projects.reduce(
              (acc, p) => acc + (p.utilization?.utilizationPercentage || 0),
              0
            ) / projects.length
          )
        : 0,
  };

  const canCreateProject =
    authUser && ["pm", "hr", "admin"].includes(authUser.role);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your organization's projects
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2"
          >
            <BarChart3 size={16} />
            {showStats ? "Hide" : "Show"} Stats
          </Button>

          {canCreateProject && (
            <Button asChild className="flex items-center gap-2">
              <Link href="/projects/create">
                <Plus size={16} />
                New Project
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Dashboard */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Projects"
            value={stats.total}
            icon={BarChart3}
            color="bg-blue-500"
            description="All projects in system"
          />

          <StatsCard
            title="Active Projects"
            value={stats.active}
            icon={TrendingUp}
            color="bg-green-500"
            description="Currently running"
          />

          <StatsCard
            title="My Projects"
            value={stats.myProjects}
            icon={Users}
            color="bg-purple-500"
            description="Projects you manage"
          />

          <StatsCard
            title="Avg Utilization"
            value={`${stats.avgUtilization}%`}
            icon={Clock}
            color="bg-orange-500"
            description="Team capacity usage"
          />
        </div>
      )}

      {/* Status Overview */}
      {showStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              Project Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatusBadge
                label="Planning"
                count={stats.planning}
                variant="secondary"
                icon={Clock}
              />
              <StatusBadge
                label="Active"
                count={stats.active}
                variant="success"
                icon={TrendingUp}
              />
              <StatusBadge
                label="Completed"
                count={stats.completed}
                variant="primary"
                icon={CheckCircle}
              />
              <StatusBadge
                label="On Hold"
                count={stats.onHold}
                variant="warning"
                icon={AlertTriangle}
              />
              <StatusBadge
                label="Total"
                count={stats.total}
                variant="outline"
                icon={BarChart3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {canCreateProject && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickActionCard
                title="Create Project"
                description="Start a new project with AI-powered setup"
                icon={Plus}
                href="/projects/create"
                color="bg-primary"
              />

              <QuickActionCard
                title="View Analytics"
                description="Analyze project performance and utilization"
                icon={BarChart3}
                href="/projects/analytics"
                color="bg-blue-500"
              />

              <QuickActionCard
                title="Resource Planning"
                description="Manage team allocations and requests"
                icon={Users}
                href="/resources"
                color="bg-green-500"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Project List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Projects</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter size={16} className="mr-2" />
                Advanced Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectList />
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-blue-50 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                Getting Started with Projects
              </h3>
              <p className="text-muted-foreground mb-4">
                Create and manage projects with our AI-powered tools. Get skill
                recommendations, track team utilization, and manage tasks all in
                one place.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/help/projects">View Documentation</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/projects/templates">Browse Templates</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, description }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className={cn("p-2 rounded-lg", color, "bg-opacity-10")}>
            <Icon size={20} className={cn("text-white")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Status Badge Component
const StatusBadge = ({ label, count, variant, icon: Icon }) => {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
      <Icon size={16} className="text-muted-foreground" />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <Badge variant={variant} size="sm">
          {count}
        </Badge>
      </div>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon: Icon, href, color }) => {
  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer">
      <Link href={href}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg", color, "bg-opacity-10")}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ProjectsPage;
