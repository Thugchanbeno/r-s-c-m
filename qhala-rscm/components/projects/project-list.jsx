// components/projects/ProjectList.jsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/Card";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Users,
  Calendar,
  Filter,
  Search,
  Grid3X3,
  List,
  Building2,
  TrendingUp,
  Target,
  Briefcase,
} from "lucide-react";
import { useProjects } from "@/lib/hooks/useProjects";
import { getStatusBadgeVariant } from "@/components/common/CustomColors";
import { cn } from "@/lib/utils";

const ProjectList = () => {
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Use the hook here instead of receiving props
  const { projects, loading, authUser } = useProjects(null, filters);
  const router = useRouter();

  const filteredProjects = (projects || []).filter(
    (project) =>
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-background min-h-[400px]">
        <LoadingSpinner size={40} />
        <span className="mt-4 text-muted-foreground">Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            All Projects
          </h2>
          <p className="text-muted-foreground">
            {filteredProjects.length} project
            {filteredProjects.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            Filters
          </Button>

          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List size={16} />
            </Button>
          </div>

          {authUser && ["pm", "hr", "admin"].includes(authUser.role) && (
            <Link href="/projects/new">
              <Button size="sm" className="flex items-center gap-2">
                <Plus size={16} />
                New Project
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <input
            type="text"
            placeholder="Search projects, descriptions, or departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={filters.status || "all"}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="all">All Statuses</option>
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Department
                </label>
                <select
                  value={filters.department || "all"}
                  onChange={(e) =>
                    handleFilterChange("department", e.target.value)
                  }
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="all">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              {/* My Projects Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  My Projects
                </label>
                <select
                  value={filters.pmId || "all"}
                  onChange={(e) => handleFilterChange("pmId", e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="all">All Projects</option>
                  <option value={authUser?._id}>My Projects Only</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button onClick={clearFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          hasFilters={Object.keys(filters).length > 0}
        />
      ) : (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}
        >
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              authUser={authUser}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectCard = ({ project, authUser }) => {
  const utilizationPercentage = project.utilization?.utilizationPercentage || 0;
  const teamSize = project.utilization?.teamSize || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="truncate">{project.name}</span>
          <Badge variant={getStatusBadgeVariant(project.status)}>
            {project.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {project.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Users size={12} />
            {teamSize} members
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp size={12} />
            {utilizationPercentage}% utilized
          </span>
        </div>

        <div className="flex gap-2">
          <Link href={`/projects/${project._id}`} className="flex-1">
            <Button size="sm" variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
          {authUser && ["admin", "hr", "pm"].includes(authUser.role) && (
            <Link href={`/projects/${project._id}/edit`}>
              <Button size="sm">Edit</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ searchTerm, hasFilters }) => (
  <div className="text-center py-12">
    <Briefcase size={32} className="mx-auto text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">
      {searchTerm || hasFilters ? "No projects found" : "No projects yet"}
    </h3>
    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
      {searchTerm || hasFilters
        ? "Try adjusting your search terms or filters to find what you're looking for."
        : "Get started by creating your first project. Organize your team and track progress all in one place."}
    </p>
    <Link href="/projects/new">
      <Button>
        <Plus size={16} className="mr-2" />
        Create Project
      </Button>
    </Link>
  </div>
);

export default ProjectList;
