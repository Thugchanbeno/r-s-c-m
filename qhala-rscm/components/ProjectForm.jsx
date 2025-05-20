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
import { getSkillLevelColor } from "@/components/common/skillcolors";
import SkillSelector from "@/components/projects/SkillSelector";
import { departmentEnum, projectStatusEnum } from "@/lib/projectconstants";

const initialProjectState = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  status: projectStatusEnum[0],
  department: departmentEnum.includes("Unassigned")
    ? "Unassigned"
    : departmentEnum[0],
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
  const [projectData, setProjectData] = useState({
    ...initialProjectState,
    ...initialData,
    department: initialData.department || initialProjectState.department,
    startDate: initialData.startDate ? initialData.startDate.split("T")[0] : "",
    endDate: initialData.endDate ? initialData.endDate.split("T")[0] : "",
  });

  const [nlpSuggestedSkills, setNlpSuggestedSkills] = useState([]);
  const [isProcessingDescription, setIsProcessingDescription] = useState(false);
  const [nlpError, setNlpError] = useState(null);
  const [descriptionProcessed, setDescriptionProcessed] = useState(false);

  useEffect(() => {
    const effectiveInitialData = {
      ...initialProjectState,
      ...initialData,
      department: initialData.department || initialProjectState.department,
      startDate: initialData.startDate
        ? initialData.startDate.split("T")[0]
        : "",
      endDate: initialData.endDate ? initialData.endDate.split("T")[0] : "",
    };
    setProjectData(effectiveInitialData);

    setNlpSuggestedSkills(
      isEditMode && initialData.requiredSkills
        ? initialData.requiredSkills.map((s) => ({
            id: s.skillId,
            name: s.skillName,
            category: s.category || "N/A",
          }))
        : []
    );
    setDescriptionProcessed(
      !!(initialData.requiredSkills && initialData.requiredSkills.length > 0)
    );
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({ ...prev, [name]: value }));
    if (name === "description") {
      setDescriptionProcessed(false);
      setNlpSuggestedSkills([]);
      setNlpError(null);
    }
  };

  const handleProcessDescription = async () => {
    if (!projectData.description.trim()) {
      setNlpError("Please enter a project description first.");
      return;
    }
    setIsProcessingDescription(true);
    setNlpError(null);
    setNlpSuggestedSkills([]);
    try {
      const response = await fetch("/api/nlp/extract-from-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: projectData.description }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to extract skills from description."
        );
      }
      setNlpSuggestedSkills(result.data || []);
      setDescriptionProcessed(true);
    } catch (err) {
      setNlpError(err.message);
      setDescriptionProcessed(false);
    } finally {
      setIsProcessingDescription(false);
    }
  };

  const handleRequiredSkillsChange = (updatedRequiredSkills) => {
    setProjectData((prev) => ({
      ...prev,
      requiredSkills: updatedRequiredSkills,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEditMode && projectData.requiredSkills.length === 0 && !nlpError) {
      setNlpError(
        "Please process the description for skills or add required skills manually."
      );
      return;
    }
    const dataToSubmit = {
      ...projectData,
      startDate: projectData.startDate || null,
      endDate: projectData.endDate || null,
    };
    if (onSubmit) {
      onSubmit(dataToSubmit);
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
    "block w-full rounded-[var(--radius)] border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] shadow-sm focus:border-[rgb(var(--primary))] focus:ring-1 focus:ring-[rgb(var(--primary))] sm:text-sm transition-all duration-200 placeholder:text-[rgb(var(--muted-foreground))] disabled:opacity-50 disabled:cursor-not-allowed";
  const labelBaseClasses =
    "block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5";

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
        <form onSubmit={handleSubmit} className="space-y-8">
          {submitError && (
            <div className="flex items-center p-4 text-sm rounded-[var(--radius)] bg-red-50 text-red-700 border-l-4 border-red-500 shadow">
              <AlertCircle size={20} className="mr-3 flex-shrink-0" />
              <span>Error: {submitError}</span>
            </div>
          )}

          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] border-b border-[rgb(var(--border))] pb-2 mb-4">
              Project Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
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

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] border-b border-[rgb(var(--border))] pb-2 mb-4 flex items-center">
              <ListChecks
                size={20}
                className="mr-2 text-[rgb(var(--primary))]"
              />
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
                (!isEditMode && projectData.requiredSkills.length === 0)
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
