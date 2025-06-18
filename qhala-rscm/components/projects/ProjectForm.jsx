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
import { getStatusBadgeVariant } from "@/components/common/CustomColors";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDatePickerDate, parseDatePickerDate } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

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
    "block w-full rounded-md bg-background text-foreground shadow-sm sm:text-sm transition-all duration-200 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";
  const inputPadding = "px-3 py-2";

  const labelBaseClasses = "mb-1 block text-sm font-medium text-foreground";
  const sectionHeaderClasses = "mb-3 text-lg font-semibold text-foreground";
  const displayError = submitError || localSubmitError;

  const handleStartDateChange = (date) => {
    handleChange({
      target: { name: "startDate", value: formatDatePickerDate(date) },
    });
  };

  const handleEndDateChange = (date) => {
    handleChange({
      target: { name: "endDate", value: formatDatePickerDate(date) },
    });
  };

  return (
    <Card className="animate-fade-in overflow-hidden shadow-xl">
      <CardHeader className="shadow-sm bg-gradient-to-br from-primary-accent-background via-blue-50 to-purple-50 p-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-primary md:text-xl">
          <Briefcase size={22} />
          {isEditMode ? "Edit Project Details" : "Create Project"}
        </CardTitle>
        <CardDescription className="mt-1 text-sm text-muted-foreground">
          {isEditMode
            ? "Refine the project specifics and team requirements."
            : "Define your project, and let AI assist with skill identification."}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 md:p-6">
        <form onSubmit={handleSubmitLogic} className="space-y-6">
          {displayError && (
            <div className="flex items-center rounded-md border-l-4 border-destructive bg-destructive/15 p-3 text-sm text-destructive shadow-sm">
              <AlertCircle size={18} className="mr-2.5 flex-shrink-0" />
              <span>Error: {displayError}</span>
            </div>
          )}

          <section className="space-y-4">
            <h3 className={sectionHeaderClasses}>Project Overview</h3>
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
              <div className="space-y-0.5">
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
                  className={cn(inputBaseClasses, inputPadding)}
                />
              </div>
              <div className="space-y-0.5">
                <label
                  htmlFor="department"
                  className={cn(labelBaseClasses, "flex items-center gap-1.5")}
                >
                  <Building2 size={15} className="text-primary" /> Department*
                </label>
                <div className="relative">
                  <select
                    id="department"
                    name="department"
                    value={projectData.department}
                    onChange={handleChange}
                    required
                    className={cn(
                      inputBaseClasses,
                      "appearance-none pl-3 pr-8",
                      inputPadding
                    )}
                  >
                    {departmentEnum.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <div className="space-y-0.5">
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
                    className={cn(
                      inputBaseClasses,
                      "appearance-none pl-3 pr-8",
                      inputPadding
                    )}
                  >
                    {projectStatusEnum.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="mt-1.5">
                  <Badge
                    variant={getStatusBadgeVariant(projectData.status)}
                    pill={true}
                    size="sm"
                  >
                    {projectData.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-0.5">
                <label
                  htmlFor="startDate"
                  className={cn(labelBaseClasses, "flex items-center gap-1.5")}
                >
                  <CalendarDays size={15} className="text-primary" /> Start Date
                </label>
                <div className="relative w-full">
                  <DatePicker
                    selected={parseDatePickerDate(projectData.startDate)}
                    onChange={handleStartDateChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="YYYY-MM-DD"
                    className={cn(inputBaseClasses, inputPadding, "w-full")}
                    wrapperClassName="w-full"
                    showPopperArrow={false}
                    isClearable
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="space-y-0.5">
                <label
                  htmlFor="endDate"
                  className={cn(labelBaseClasses, "flex items-center gap-1.5")}
                >
                  <CalendarDays size={15} className="text-primary" /> End Date
                </label>
                <div className="relative w-full">
                  <DatePicker
                    selected={parseDatePickerDate(projectData.endDate)}
                    onChange={handleEndDateChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="YYYY-MM-DD"
                    className={cn(inputBaseClasses, inputPadding, "w-full")}
                    wrapperClassName="w-full"
                    showPopperArrow={false}
                    isClearable
                    minDate={parseDatePickerDate(projectData.startDate)}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className={sectionHeaderClasses}>
              Project Details & AI Skill Analysis
            </h3>
            <div className="space-y-0.5">
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
                rows={4}
                className={cn(inputBaseClasses, "px-3 py-2")}
              />{" "}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleProcessDescription}
              disabled={
                isProcessingDescription || !projectData.description.trim()
              }
              isLoading={isProcessingDescription}
              className="group mt-1.5 text-primary shadow-md hover:bg-primary-accent-background hover:text-primary text-sm px-4 py-2"
            >
              <Sparkles
                size={16}
                className="mr-1.5 transition-transform duration-300 ease-in-out group-hover:scale-125 group-hover:animate-pulse"
              />
              {descriptionProcessed && nlpSuggestedSkills.length > 0
                ? "Re-analyze"
                : "Analyze with AI"}
            </Button>
            {nlpError && (
              <p className="mt-1.5 rounded-md bg-destructive/15 p-2 text-xs text-destructive shadow-sm">
                {nlpError}
              </p>
            )}
          </section>

          {(descriptionProcessed ||
            nlpSuggestedSkills.length > 0 ||
            (isEditMode && projectData.requiredSkills.length > 0)) &&
            !isProcessingDescription && (
              <section
                className={cn(
                  "space-y-2 p-3 rounded-md shadow-sm",
                  "bg-primary-accent-background/40"
                )}
              >
                <h3 className="flex items-center text-sm font-semibold text-primary">
                  <CheckCircle size={16} className="mr-1.5" /> AI Skill
                  Suggestions
                </h3>
                {nlpSuggestedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {nlpSuggestedSkills.map((skill) => (
                      <Badge
                        key={skill.id}
                        variant="primary"
                        pill
                        size="xs"
                        className="bg-primary/15 text-primary text-sm p-2"
                      >
                        {skill.name}{" "}
                        {skill.category ? `(${skill.category})` : ""}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    {descriptionProcessed
                      ? "No specific skills identified. Add manually."
                      : "Analyze description for suggestions."}
                  </p>
                )}
              </section>
            )}
          <section className="space-y-2">
            <h3
              className={cn(
                sectionHeaderClasses,
                "flex items-center text-base"
              )}
            >
              <ListChecks size={18} className="mr-1.5 text-primary" /> Define
              Required Skills*
            </h3>
            <div className="rounded-md bg-background p-2 shadow-sm">
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
                <p className="mt-1 rounded-md bg-destructive/15 p-1.5 text-xs text-destructive shadow-sm">
                  Please select at least one required skill.
                </p>
              )}
          </section>

          <div className="mt-6 flex items-center justify-end space-x-3 p-1">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || isProcessingDescription}
                className="px-5 py-2 text-sm"
              >
                Cancel
              </Button>
            )}{" "}
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
              className="px-6 p-2 text-sm"
            >
              {isEditMode ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectForm;
