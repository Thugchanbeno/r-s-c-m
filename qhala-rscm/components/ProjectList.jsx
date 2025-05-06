//component to display projects from the db.
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/common/LoadingSpinner.jsx";

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
          } catch (error) {
            throw new Error(errorMsg);
          }
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
      <div className="flex items-center justify-center p-10">
        <LoadingSpinner loading={loading} size={32} />
        <span className="ml-3 text-gray-600"></span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center p-6 bg-red-100 text-red-700 border border-red-300 rounded-md">
        <p>
          <strong>Error loading projects:</strong>
        </p>
        <p>{error}</p>
      </div>
    );
  }
  if (projects.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500 border border-dashed rounded-md">
        No projects found.
      </div>
    );
  }

  // Render the list of projects
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div
          key={project._id}
          className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-indigo-700 mb-1">
              <Link
                href={`/projects/${project._id}`}
                className="hover:underline"
              >
                {project.name}
              </Link>
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                project.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : project.status === "Completed"
                  ? "bg-blue-100 text-blue-800"
                  : project.status === "Planning"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {project.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {" "}
            {project.description}
          </p>
          <div className="text-xs text-gray-500">
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
      ))}
    </div>
  );
};

export default ProjectList;
