"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/hooks/useAuth";
import ProjectCard from "./ProjectCard";
import ProjectFilters from "./ProjectFilters";
import { Grid2X2, List, Plus } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function ProjectsListNew() {
  const { user } = useAuth();
  
  const queryArgs = user?.email ? { email: user.email } : "skip";
  const allProjects = useQuery(api.projects.getAll, queryArgs);
  const allocationsResponse = useQuery(api.allocations.getAll, { 
    ...queryArgs, 
    limit: 1000 // Get all allocations for filtering
  });
  
  const allAllocations = allocationsResponse?.data || [];
  
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    department: "all"
  });

  const canViewAllProjects = useMemo(() => {
    if (!user) return false;
    return ["Project Manager", "Line Manager", "HR", "Admin"].includes(user.role);
  }, [user]);

  const canCreateProject = useMemo(() => {
    if (!user) return false;
    return ["Project Manager", "HR", "Admin"].includes(user.role);
  }, [user]);

  const projects = allProjects;

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    return projects.filter((project) => {
      const matchesSearch = 
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = 
        filters.status === "all" || project.status === filters.status;
      
      const matchesDepartment = 
        filters.department === "all" || project.department === filters.department;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [projects, filters]);

  const getProjectAllocations = (projectId) => {
    if (!allAllocations || allAllocations.length === 0) return [];
    
    // Filter allocations for this project (status "active" not "approved")
    // Map enriched data to match ProjectCard expectations
    return allAllocations
      .filter((alloc) => alloc.projectId === projectId && alloc.status === "active")
      .map((alloc) => ({
        ...alloc,
        userId: {
          _id: alloc.userId,
          name: alloc.userName,
          email: alloc.userEmail,
          avatarUrl: alloc.userAvatar,
        },
      }));
  };

  const enrichedProjects = useMemo(() => {
    if (!filteredProjects || !allAllocations) return [];
    
    return filteredProjects.map((project) => ({
      ...project,
      allocations: getProjectAllocations(project._id)
    }));
  }, [filteredProjects, allAllocations]);

  const canEditProject = (project) => {
    if (!user) return false;
    if (["HR", "Admin"].includes(user.role)) return true;
    return project.pmId === user._id;
  };

  if (projects === undefined || allocationsResponse === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <LoadingSpinner width={200} height={4} />
        <p className="text-sm text-rscm-dark-purple">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rscm-dark-purple">Projects</h1>
          <p className="text-sm text-gray-600 mt-1">
            {canViewAllProjects ? "All projects" : "Your projects"}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-rscm-violet shadow-sm"
                  : "text-gray-600 hover:text-rscm-violet"
              }`}
              title="Grid view"
            >
              <Grid2X2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white text-rscm-violet shadow-sm"
                  : "text-gray-600 hover:text-rscm-violet"
              }`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {canCreateProject && (
            <button
              className="flex items-center gap-2 bg-rscm-violet text-white px-4 py-2 rounded-lg hover:bg-rscm-plum transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          )}
        </div>
      </div>

      <ProjectFilters filters={filters} onFilterChange={setFilters} />

      {enrichedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-medium text-rscm-dark-purple">No projects found</p>
            <p className="text-sm text-gray-600 mt-1">
              {filters.search || filters.status !== "all" || filters.department !== "all"
                ? "Try adjusting your filters"
                : canViewAllProjects
                ? "Create a new project to get started"
                : "You don't have any projects assigned yet"}
            </p>
          </div>
          {canCreateProject && (
            <button
              className="flex items-center gap-2 bg-rscm-violet text-white px-4 py-2 rounded-lg hover:bg-rscm-plum transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Project
            </button>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          {enrichedProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              allocations={project.allocations || []}
              canEdit={canEditProject(project)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
