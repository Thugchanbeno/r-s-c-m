"use client";
import Button from "@/components/common/Button.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/common/Card.jsx";
import Badge from "@/components/common/Badge";
import {
  AlertCircle,
  Briefcase,
  ListChecks,
  CheckCircle,
  Sparkles,
  Building2,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import SkillSelector from "@/components/projects/SkillSelector";
import { departmentEnum, projectStatusEnum } from "@/lib/projectconstants";
import { useProjectFormData } from "@/lib/hooks/useProjectFormData";
import {
  getStatusBadgeVariant,
  getSkillLevelColor,
} from "@/components/common/skillcolors";

const ProjectForm = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitError = null,
  onCancel,
  isEditMode = false,
}) => {
  const {
    projectData,
    nlpSuggestedSkills,
    isProcessingDescription,
    nlpError,
    descriptionProcessed,
    localSubmitError,
    handleChange,
    handleProcessDescription,
    handleRequiredSkillsChange,
    handleSubmitLogic,
  } = useProjectFormData(initialData, isEditMode, onSubmit);

  const inputBaseClasses =
    "block w-full rounded-[var(--radius)] border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] shadow-sm focus:border-[rgb(var(--primary))] focus:ring-1 focus:ring-[rgb(var(--primary))] sm:text-sm transition-all duration-200 placeholder:text-[rgb(var(--muted-foreground))] disabled:opacity-50 disabled:cursor-not-allowed";
  const labelBaseClasses =
    "block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5";

  const displayError = submitError || localSubmitError;

  return (
    <Card className="animate-fade-in overflow-hidden shadow-xl">
      <CardHeader className="bg-gradient-to-br from-[rgb(var(--primary-accent-background))] via-blue-50 to-purple-50 border-b border-[rgb(var(--border))] p-6">
        <CardTitle className="text-xl font-semibold text-[rgb(var(--primary))] flex items-center gap-2.5">
          <Briefcase size={24} />
          {isEditMode ? "Edit Project Details" : "Create Project"}
        </CardTitle>
        <CardDescription className="text-[rgb(var(--muted-foreground))] mt-1">
          {isEditMode
            ? "Refine the project specifics and team requirements."
            : "Define your project, and let AI assist with skill identification."}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmitLogic} className="space-y-8">
          {displayError && (
            <div className="flex items-center p-4 text-sm rounded-[var(--radius)] bg-red-50 text-red-700 border-l-4 border-red-500 shadow">
              <AlertCircle size={20} className="mr-3 flex-shrink-0" />
              <span>Error: {displayError}</span>
            </div>
          )}
          {/* Project Overview Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] border-b border-[rgb(var(--border))] pb-2 mb-4">
              Project Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Name */}
              <div className="space-y-1">
                <label htmlFor="name" className={labelBaseClasses}>
                  Project Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={projectData.name}
                  onChange={handleChange}
                  required
                  placeholder="E.g., Q4 Marketing Campaign"
                  className={`${inputBaseClasses} px-3 py-2.5`}
                />
              </div>
              {/* Department */}
              <div className="space-y-1">
                <label
                  htmlFor="department"
                  className={`${labelBaseClasses} flex items-center gap-2`}
                >
                  <Building2 size={16} className="text-[rgb(var(--primary))]" />{" "}
                  Department*
                </label>
                <div className="relative">
                  <select
                    id="department"
                    name="department"
                    value={projectData.department}
                    onChange={handleChange}
                    required
                    className={`${inputBaseClasses} appearance-none pl-3 pr-10 py-2.5`}
                  >
                    {departmentEnum.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                  </div>
                </div>
              </div>
              {/* Status */}
              <div className="space-y-1">
                <label htmlFor="status" className={labelBaseClasses}>
                  Status*
                </label>
                <div className="relative">
                  <select
                    id="status"
                    name="status"
                    value={projectData.status}
                    onChange={handleChange}
                    required
                    className={`${inputBaseClasses} appearance-none pl-3 pr-10 py-2.5`}
                  >
                    {projectStatusEnum.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                  </div>
                </div>
                <div className="mt-2">
                  <Badge
                    variant={getStatusBadgeVariant(projectData.status)}
                    pill={true}
                    size="sm"
                  >
                    {projectData.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                {" "}
                {/* Placeholder for alignment */}{" "}
              </div>
              {/* Start Date */}
              <div className="space-y-1">
                <label
                  htmlFor="startDate"
                  className={`${labelBaseClasses} flex items-center gap-2`}
                >
                  <CalendarDays
                    size={16}
                    className="text-[rgb(var(--primary))]"
                  />{" "}
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={projectData.startDate}
                    onChange={handleChange}
                    className={`${inputBaseClasses} px-3 py-2.5 pr-8`}
                  />
                  <CalendarDays className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))] pointer-events-none" />
                </div>
              </div>
              {/* End Date */}
              <div className="space-y-1">
                <label
                  htmlFor="endDate"
                  className={`${labelBaseClasses} flex items-center gap-2`}
                >
                  <CalendarDays
                    size={16}
                    className="text-[rgb(var(--primary))]"
                  />{" "}
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={projectData.endDate}
                    onChange={handleChange}
                    className={`${inputBaseClasses} px-3 py-2.5 pr-8`}
                  />
                  <CalendarDays className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))] pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* Project Details & AI Skill Analysis Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] border-b border-[rgb(var(--border))] pb-2 mb-4">
              Project Details & AI Skill Analysis
            </h3>
            <div className="space-y-1">
              <label htmlFor="description" className={labelBaseClasses}>
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={projectData.description}
                onChange={handleChange}
                required
                placeholder="Provide a detailed project scope, objectives, and deliverables..."
                rows={5}
                className={`${inputBaseClasses} px-3 py-2`}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleProcessDescription}
              disabled={
                isProcessingDescription || !projectData.description.trim()
              }
              isLoading={isProcessingDescription}
              className="mt-2 text-sm border-[rgb(var(--primary))] text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-accent-background))] hover:text-[rgb(var(--primary))] group"
            >
              <Sparkles
                size={18}
                className="mr-2 transition-transform duration-300 ease-in-out group-hover:scale-125 group-hover:animate-pulse"
              />
              {descriptionProcessed && nlpSuggestedSkills.length > 0
                ? "Re-analyze with AI"
                : "Analyze with AI for Skill Suggestions"}
            </Button>
            {nlpError && (
              <p className="text-sm text-red-600 mt-2 p-2 bg-red-50 border border-red-200 rounded-[var(--radius)]">
                {nlpError}
              </p>
            )}
          </section>

          {/* AI Skill Suggestions Display Section */}
          {(descriptionProcessed ||
            nlpSuggestedSkills.length > 0 ||
            (isEditMode && projectData.requiredSkills.length > 0)) &&
            !isProcessingDescription && (
              <section className="space-y-3 p-4 border border-dashed border-blue-300 rounded-[var(--radius)] bg-blue-50/50 shadow-sm">
                <h3 className="text-md font-semibold text-blue-700 flex items-center">
                  <CheckCircle size={18} className="mr-2" /> AI Skill
                  Suggestions
                </h3>
                {nlpSuggestedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {nlpSuggestedSkills.map((skill) => (
                      <Badge
                        key={skill.id}
                        variant="info_outline"
                        pill
                        size="sm"
                        className="border-blue-400 text-blue-700"
                      >
                        {skill.name}{" "}
                        {skill.category ? `(${skill.category})` : ""}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    {descriptionProcessed
                      ? "No specific skills identified by AI. Please add skills manually below."
                      : "Analyze description to see AI suggestions."}
                  </p>
                )}
              </section>
            )}

          {/* Define Required Skills Section */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] border-b border-[rgb(var(--border))] pb-2 mb-4 flex items-center">
              <ListChecks
                size={20}
                className="mr-2 text-[rgb(var(--primary))]"
              />{" "}
              Define Required Skills*
            </h3>
            <div className="p-3 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--background))] shadow-inner">
              <SkillSelector
                initialSelectedSkills={projectData.requiredSkills}
                nlpSuggestedSkills={nlpSuggestedSkills}
                onChange={handleRequiredSkillsChange}
              />
            </div>
            {projectData.requiredSkills &&
              projectData.requiredSkills.length === 0 &&
              !isEditMode &&
              descriptionProcessed && (
                <p className="text-xs text-red-500 mt-1 p-2 bg-red-50 border border-red-200 rounded-[var(--radius)]">
                  Please select at least one required skill for the project.
                </p>
              )}
          </section>

          {/* Action Buttons Section */}
          <div className="flex justify-end items-center space-x-4 pt-6 border-t border-[rgb(var(--border))] mt-8">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || isProcessingDescription}
                className="px-6 py-2.5"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={
                isSubmitting ||
                isProcessingDescription ||
                (!isEditMode &&
                  projectData.requiredSkills.length === 0 &&
                  descriptionProcessed)
              }
              isLoading={isSubmitting}
              className="px-8 py-2.5 text-base"
            >
              {isEditMode ? "Save Changes" : "Finalize & Create Project"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectForm;
