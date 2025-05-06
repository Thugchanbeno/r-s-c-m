"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Plus, Users, Calendar } from "lucide-react";

// Helper to get badge style based on project status
const getProjectStatusBadge = (status) => {
  // Map status values to badge variants and labels
  const statusMap = {
    planning: { label: "Planning", variant: "secondary" },
    active: { label: "Active", variant: "success" },
    completed: { label: "Completed", variant: "primary" },
    "on-hold": { label: "On Hold", variant: "warning" },
  };
  // Default badge if status is unknown
  const badge = statusMap[status?.toLowerCase()] || {
    label: "Unknown",
    variant: "default",
  };
  return <Badge variant={badge.variant}>{badge.label}</Badge>;
};

// Component for the New Project Form
const ProjectForm = ({
  newProject,
  onChange,
  onSubmit,
  onCancel,
  isLoading,
}) => (
  <Card className="mb-6 animate-slide-in">
    <CardHeader>
      <CardTitle>Create New Project</CardTitle>
      <CardDescription>
        Fill out the form to create a new project. Fields marked with * are
        required.
      </CardDescription>
    </CardHeader>
    <CardContent>
      {/* Form submission triggers the onSubmit handler */}
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input fields configuration */}
          {[
            { label: "Project Name*", name: "name", type: "text" },
            {
              label: "Status*",
              name: "status",
              type: "select",
              options: ["planning", "active", "on-hold", "completed"],
            },
            { label: "Start Date*", name: "startDate", type: "date" },
            { label: "End Date*", name: "endDate", type: "date" },
          ].map((field) => (
            <div key={field.name} className="space-y-2">
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {field.label}
              </label>
              {/* Render select dropdown or standard input based on field type */}
              {field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={newProject[field.name]}
                  onChange={onChange}
                  required
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm p-2 border"
                >
                  {/* Default empty option */}
                  <option value="" disabled>
                    Select status
                  </option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt} className="capitalize">
                      {opt.replace("-", " ")} {/* Make options more readable */}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={newProject[field.name]}
                  onChange={onChange}
                  required
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm p-2 border"
                />
              )}
            </div>
          ))}
          {/* Description Textarea */}
          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={newProject.description}
              onChange={onChange}
              required
              rows={3}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm p-2 border"
            />
          </div>
          {/* TODO: Add fields for selecting Required Skills and Team Members if needed */}
          {/* Example: <MultiSelect options={allSkills} selected={newProject.requiredSkills} onChange={handleSkillChange} /> */}
        </div>
        {/* Form action buttons */}
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} isLoading={isLoading}>
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
);

// Component to display a single Project Card
const ProjectCard = ({ project, isManager }) => {
  // Function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Function to display team member names (assuming API returns populated 'team' array)
  const getTeamMemberDisplay = (team) => {
    if (!team || team.length === 0) return "No members assigned";
    // Assuming team members are objects with a 'name' property
    return team.map((member) => member?.name || "Unknown").join(", ");
  };

  // Function to display required skills (assuming API returns populated 'requiredSkills' array)
  const getRequiredSkillsDisplay = (skills) => {
    if (!skills || skills.length === 0)
      return (
        <span className="text-xs italic text-gray-500">None specified</span>
      );
    // Assuming skills are objects with '_id' and 'name' properties
    return skills.map((skill) => (
      <Badge key={skill._id} variant="outline" className="text-xs">
        {skill.name || "Unknown Skill"}
      </Badge>
    ));
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {project.name || "Unnamed Project"}
          </CardTitle>
          {getProjectStatusBadge(project.status)}
        </div>
        <CardDescription className="line-clamp-2 h-10 mt-1">
          {project.description || "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        {/* Dates */}
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Calendar size={16} className="mr-2 flex-shrink-0" />
          <span className="text-sm">
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </span>
        </div>
        {/* Team Members */}
        <div className="flex items-start text-gray-600 dark:text-gray-400">
          <Users size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          {/* Ensure team member display wraps */}
          <span className="text-sm break-words">
            {getTeamMemberDisplay(project.team)}
          </span>
        </div>
        {/* Required Skills */}
        <div>
          <div className="text-sm font-medium mb-1 text-gray-800 dark:text-gray-300">
            Required Skills:
          </div>
          <div className="flex flex-wrap gap-1">
            {getRequiredSkillsDisplay(project.requiredSkills)}
          </div>
        </div>
      </CardContent>
      {/* Card Footer with Actions */}
      <CardFooter className="flex justify-between pt-4 border-t dark:border-gray-700 mt-auto">
        {/* Link to project details page */}
        <Button asChild size="sm" variant="outline">
          {/* TODO: Update link href to actual project detail route */}
          <a href={`/projects/${project._id}`}>View Details</a>
        </Button>
        {/* Conditional button for managers */}
        {isManager && (
          <Button asChild size="sm">
            {/* TODO: Update link href to actual team management route */}
            <a href={`/projects/${project._id}/manage`}>Manage Team</a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
