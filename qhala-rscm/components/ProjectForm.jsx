"use client";
import { useState, useEffect } from "react";
import Button from "@/components/common/Button.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/common/Card.jsx";
import LoadingSpinner from "@/components/common/LoadingSpinner";
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

  // TODO: Fetch all skills if implementing skill selector here
  // useEffect(() => { fetch skills... setAllSkills... }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({ ...prev, [name]: value }));
  };

  // TODO: Implement handler for skill selection component
  // const handleSkillsChange = (selectedSkillIds) => {
  //   setProjectData((prev) => ({ ...prev, requiredSkills: selectedSkillIds }));
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      const dataToSend = {
        ...projectData,
        // Ensure dates are in correct format if needed by backend
        // startDate: projectData.startDate ? new Date(projectData.startDate).toISOString() : null,
        // endDate: projectData.endDate ? new Date(projectData.endDate).toISOString() : null,
        // Ensure requiredSkills contains only IDs if using selector component
      };
      onSubmit(dataToSend);
    }
  };

  // Status badge styling based on status value
  const getStatusBadgeClass = (status) => {
    const baseClass =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
    switch (status) {
      case "Planning":
        return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      case "Active":
        return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case "On Hold":
        return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case "Completed":
        return `${baseClass} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`;
      case "Cancelled":
        return `${baseClass} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
    }
  };

  return (
    <Card className="animate-fade-in shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg">
      {/* Remove Header if rendered on page already */}
      {/* <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
          <Briefcase size={20} />
          {isEditMode ? 'Edit Project' : 'Create New Project'}
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          {isEditMode ? 'Update the project details below.' : 'Fill out the form to create a new project.'}
        </CardDescription>
      </CardHeader> */}
      <CardContent className="pt-6 px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="flex items-center p-4 mb-4 text-sm rounded-lg bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-l-4 border-red-500 dark:border-red-500">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              <span>Error: {submitError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all duration-200 
                placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm appearance-none pl-3 pr-10 py-2 transition-all duration-200"
                >
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
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
                <span className={getStatusBadgeClass(projectData.status)}>
                  {projectData.status}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <CalendarIcon size={16} className="text-indigo-500" />
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={projectData.startDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <CalendarIcon size={16} className="text-indigo-500" />
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={projectData.endDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all duration-200"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all duration-200
                placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Required Skills
              </label>
              <div className="min-h-[60px] p-4 rounded-md border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40">
                {/* <SkillSelector
                      allSkills={allSkillsTaxonomy}
                      selectedSkillIds={projectData.requiredSkills}
                      onChange={handleSkillsChange}
                      loading={loadingSkills}
                  /> */}
                <p className="text-sm text-gray-500 dark:text-gray-400 italic flex items-center gap-2 justify-center">
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

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : isEditMode ? (
                "Update Project"
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectForm;
