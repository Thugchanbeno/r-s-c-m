"use client";
import { useState, useEffect } from "react";
import Button from "@/components/common/Button.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/common/Card.jsx";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Badge from "@/components/common/Badge";
import { CalendarIcon, AlertCircle, Briefcase } from "lucide-react";
// import SkillSelector from '@/components/profile/SkillSelector';

const initialProjectState = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "Planning",
  requiredSkills: [],
};

const ProjectForm = ({
  initialData = initialProjectState,
  onSubmit,
  isSubmitting = false,
  submitError = null,
  onCancel,
  isEditMode = false,
}) => {
  const [projectData, setProjectData] = useState(initialData);
  // const [allSkills, setAllSkills] = useState([]);
  // const [loadingSkills, setLoadingSkills] = useState(false);

  useEffect(() => {
    // If initialData changes (e.g., when switching to edit a different project),
    // update the form's state.
    setProjectData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(projectData);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Planning":
        return "primary";
      case "Active":
        return "success";
      case "On Hold":
        return "warning";
      case "Completed":
        return "secondary";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const inputBaseClasses =
    "mt-1 block w-full rounded-[var(--radius)] border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] shadow-sm focus:border-[rgb(var(--primary))] focus:ring-1 focus:ring-[rgb(var(--primary))] sm:text-sm transition-all duration-200 placeholder:text-[rgb(var(--muted-foreground))] disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <Card className="animate-fade-in overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[rgb(var(--primary-accent-background))] to-blue-100 border-b border-[rgb(var(--border))]">
        <CardTitle className="text-[rgb(var(--primary))] flex items-center gap-2">
          <Briefcase size={20} />
          {isEditMode ? "Edit Project" : "Create New Project"}
        </CardTitle>
        <CardDescription className="text-[rgb(var(--muted-foreground))]">
          {isEditMode
            ? "Update the project details below."
            : "Fill out the form to create a new project."}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="flex items-center p-4 mb-4 text-sm rounded-[var(--radius)] bg-red-50 text-red-700 border-l-4 border-red-500">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              <span>Error: {submitError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[rgb(var(--foreground))]"
              >
                Project Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={projectData.name}
                onChange={handleChange}
                required
                placeholder="Enter project name"
                className={`${inputBaseClasses.replace("p-2", "")} px-4 py-3 `}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-[rgb(var(--foreground))]"
              >
                Status*
              </label>
              <div className="relative">
                <select
                  id="status"
                  name="status"
                  value={projectData.status}
                  onChange={handleChange}
                  required
                  className={`${inputBaseClasses} appearance-none pl-3 pr-10 py-3`}
                >
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-[rgb(var(--muted-foreground))]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <Badge
                  variant={getStatusBadgeVariant(projectData.status)}
                  pill={true} // Or false for squared corners, matching original
                  size="sm" // text-xs, px-2.5 py-0.5
                >
                  {projectData.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-[rgb(var(--foreground))] flex items-center gap-2"
              >
                <CalendarIcon
                  size={16}
                  className="text-[rgb(var(--primary))]"
                />
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={projectData.startDate}
                onChange={handleChange}
                className={`${inputBaseClasses.replace("p-2", "")} px-4 py-3 `}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-[rgb(var(--foreground))] flex items-center gap-2"
              >
                <CalendarIcon
                  size={16}
                  className="text-[rgb(var(--primary))]"
                />
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={projectData.endDate}
                onChange={handleChange}
                className={`${inputBaseClasses.replace("p-2", "")} px-4 py-3 `}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-[rgb(var(--foreground))]"
              >
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={projectData.description}
                onChange={handleChange}
                required
                placeholder="Provide a detailed description of the project"
                rows={4}
                className={`${inputBaseClasses.replace("p-2", "")} px-4 py-2 `}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-[rgb(var(--foreground))]">
                Required Skills
              </label>
              <div className="min-h-[60px] p-4 rounded-[var(--radius)] border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--muted))]">
                {/* SkillSelector placeholder */}
                <p className="text-sm text-[rgb(var(--muted-foreground))] italic flex items-center gap-2 justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Skill selection UI to be implemented here.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-[rgb(var(--border))] mt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline" // Uses themed outline button
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary" // Uses themed primary button
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="flex items-center gap-2" // Keep gap for icon if isLoading
            >
              {/* isLoading prop handles spinner internally in Button component */}
              {isEditMode ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectForm;
