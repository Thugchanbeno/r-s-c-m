// components/projects/project-form.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Briefcase,
  ListChecks,
  Sparkles,
  CalendarDays,
  ChevronDown,
  Zap,
  ChevronRight,
  CheckCircle2,
  Clock,
  Target,
} from "lucide-react";
import SkillSelector from "@/components/projects/skill-selector";
import QuickAsk from "@/components/projects/quick-ask";
import { TaskManagerLocal } from "@/components/projects/task-manager";
import { departmentEnum, projectStatusEnum } from "@/lib/projectconstants";
import { getStatusBadgeVariant } from "@/components/common/CustomColors";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDatePickerDate, parseDatePickerDate } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { useAI } from "@/lib/hooks/useAI";
import { useProjects } from "@/lib/hooks/useProjects";
import { toast } from "sonner";

const ProjectForm = ({
  initialData = null,
  isEditMode = false,
  projectId = null,
}) => {
  const router = useRouter();
  const { handleCreateProject } = useProjects();

  // Form state with description persistence
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: projectStatusEnum[0],
    department: departmentEnum.includes("Unassigned")
      ? "Unassigned"
      : departmentEnum[0],
    requiredSkills: [],
    nlpExtractedSkills: [],
    tasks: [],
  });

  // AI state
  const {
    quickAskQuery,
    setQuickAskQuery,
    quickAskSuggestions,
    quickAskLoading,
    quickAskError,
    showQuickAskSuggestions,
    handleQuickAskSearch,
    handleQuickAskClear,
  } = useAI();

  // UI state
  const [activeTab, setActiveTab] = useState("project");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isProcessingDescription, setIsProcessingDescription] = useState(false);
  const [nlpSuggestedSkills, setNlpSuggestedSkills] = useState([]);
  const [nlpError, setNlpError] = useState(null);
  const [descriptionProcessed, setDescriptionProcessed] = useState(false);

  // Double-click confirmation state
  const [createConfirmation, setCreateConfirmation] = useState(false);

  // Reset confirmation after timeout
  useEffect(() => {
    if (createConfirmation) {
      const timer = setTimeout(() => {
        setCreateConfirmation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [createConfirmation]);

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        startDate: initialData.startDate
          ? formatDatePickerDate(new Date(initialData.startDate))
          : "",
        endDate: initialData.endDate
          ? formatDatePickerDate(new Date(initialData.endDate))
          : "",
        status: initialData.status || projectStatusEnum[0],
        department: initialData.department || departmentEnum[0],
        requiredSkills: initialData.requiredSkills || [],
        nlpExtractedSkills: initialData.nlpExtractedSkills || [],
        tasks: [],
      });
    }
  }, [initialData]);

  const inputClasses =
    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({ ...prev, [field]: formatDatePickerDate(date) }));
  };

  const handleProcessDescription = async () => {
    if (!formData.description.trim()) {
      toast.error("Please enter a project description first");
      return;
    }

    setIsProcessingDescription(true);
    setNlpError(null);

    try {
      const response = await fetch("/api/ai/extract-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: formData.description }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to analyze description");
      }

      setNlpSuggestedSkills(result.data || []);
      setDescriptionProcessed(true);
      toast.success("Description analyzed successfully!");
    } catch (err) {
      setNlpError(err.message);
      toast.error("Failed to analyze description");
    } finally {
      setIsProcessingDescription(false);
    }
  };

  const handleRequiredSkillsChange = (updatedRequiredSkills) => {
    setFormData((prev) => ({ ...prev, requiredSkills: updatedRequiredSkills }));
  };

  const handleQuickAskSkillSelected = (skill) => {
    const newSkill = {
      skillId: skill.id,
      skillName: skill.name,
      proficiencyLevel: 3,
      isRequired: true,
      category: skill.category,
    };

    setFormData((prev) => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, newSkill],
    }));
    toast.success(`Added ${skill.name} to required skills`);
  };

  const handleTasksChange = (updatedTasks) => {
    setFormData((prev) => ({ ...prev, tasks: updatedTasks }));
  };

  const handleCreateProjectSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        department: formData.department,
        status: formData.status,
        startDate: formData.startDate
          ? parseDatePickerDate(formData.startDate)?.getTime()
          : null,
        endDate: formData.endDate
          ? parseDatePickerDate(formData.endDate)?.getTime()
          : null,
        requiredSkills: formData.requiredSkills,
        nlpExtractedSkills: formData.nlpExtractedSkills,
      };
      const tasksData = formData.tasks.map((task) => ({
        title: task.title,
        description: task.description || "",
        priority: task.priority || "medium",
        status: task.status || "todo",
        estimatedHours: task.estimatedHours || null,
        dueDate: task.dueDate || null,
        // Remove any local _id fields
      }));
      const newProjectId = await handleCreateProject({
        projectData,
        tasks: tasksData,
      });

      toast.success("Project created successfully!");
      router.push(`/projects/${newProjectId}`);
    } catch (err) {
      console.error("Project creation error:", err);
      setSubmitError(err.message);
      toast.error("Failed to create project: " + err.message);
    } finally {
      setIsSubmitting(false);
      setCreateConfirmation(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!createConfirmation) {
      setCreateConfirmation(true);
      return;
    }

    await handleCreateProjectSubmit();
  };

  const tabs = [
    {
      id: "project",
      label: "Project Details",
      icon: Briefcase,
      completed: formData.name && formData.description && formData.department,
      description: "Basic project information",
    },
    {
      id: "skills",
      label: "Skills & AI",
      icon: Sparkles,
      completed: formData.requiredSkills.length > 0,
      description: "Define required skills",
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: ListChecks,
      completed: formData.tasks && formData.tasks.length > 0,
      description: "Add project tasks",
    },
  ];

  const currentTabIndex = tabs.findIndex((t) => t.id === activeTab);
  const completedTabs = tabs.filter((tab) => tab.completed).length;
  const progressPercentage = Math.round((completedTabs / tabs.length) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header with Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {isEditMode ? "Edit Project" : "Create New Project"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEditMode
                  ? "Update project details and requirements"
                  : "Set up your project with AI-powered insights"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/projects")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedTabs} of {tabs.length} sections completed
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Getting Started</span>
              <span>Ready to Create</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-2 px-6 py-4 border-b-2 transition-all duration-200",
                  activeTab === tab.id
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "p-1.5 rounded-full transition-colors",
                      tab.completed
                        ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        : activeTab === tab.id
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tab.completed ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <tab.icon size={16} />
                    )}
                  </div>
                  <span className="font-medium">{tab.label}</span>
                </div>
                <span className="text-xs text-center">{tab.description}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {submitError && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-destructive" />
                <div>
                  <h4 className="font-medium text-destructive">
                    Error occurred
                  </h4>
                  <p className="text-sm text-destructive/80">{submitError}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Details Tab */}
        {activeTab === "project" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase size={18} />
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="E.g., Q4 Marketing Campaign"
                  className={inputClasses}
                />
              </div>

              {/* Department and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <div className="relative">
                    <select
                      name="Department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      className={cn(inputClasses, "appearance-none pr-8")}
                    >
                      {departmentEnum.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status*</label>
                  <div className="space-y-2">
                    <div className="relative">
                      <select
                        name="Status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className={cn(inputClasses, "appearance-none pr-8")}
                      >
                        {projectStatusEnum.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                    </div>
                    <Badge
                      variant={getStatusBadgeVariant(formData.status)}
                      className="w-fit"
                    >
                      {formData.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <div className="relative">
                    <DatePicker
                      selected={parseDatePickerDate(formData.startDate)}
                      onChange={(date) => handleDateChange("startDate", date)}
                      dateFormat="YYYY-MM-DD"
                      placeholderText="Select start date"
                      className={inputClasses}
                      isClearable
                    />
                    <CalendarDays
                      size={16}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <div className="relative">
                    <DatePicker
                      selected={parseDatePickerDate(formData.endDate)}
                      onChange={(date) => handleDateChange("endDate", date)}
                      dateFormat="YYYY-MM-DD"
                      placeholderText="Select end date"
                      className={inputClasses}
                      isClearable
                      minDate={parseDatePickerDate(formData.startDate)}
                    />
                    <CalendarDays
                      size={16}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Project Description*
                </label>
                <textarea
                  name="Description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your project scope, objectives, and key deliverables..."
                  rows={4}
                  className={cn(inputClasses, "resize-none")}
                />
                <p className="text-xs text-muted-foreground">
                  Detailed descriptions help AI provide better skill
                  recommendations
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills & AI Tab */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            {/* Show Current Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles size={18} />
                  Smart Description Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Show the description being analyzed */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h4 className="font-medium mb-2 text-sm">
                    Current Description:
                  </h4>
                  <p className="text-sm text-muted-foreground italic">
                    {formData.description ||
                      "No description provided yet. Go back to Project Details to add one."}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleProcessDescription}
                  disabled={
                    isProcessingDescription || !formData.description.trim()
                  }
                  className="w-full gap-2 border-dashed"
                >
                  {isProcessingDescription && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  <Sparkles size={16} />
                  {descriptionProcessed && nlpSuggestedSkills.length > 0
                    ? "Re-analyze Description"
                    : "Analyze Description for Skills"}
                </Button>

                {nlpError && (
                  <Card className="border-destructive/20 bg-destructive/5">
                    <CardContent className="p-3">
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle size={14} />
                        {nlpError}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {descriptionProcessed && nlpSuggestedSkills.length > 0 && (
                  <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                        <Sparkles size={14} />
                        AI-Detected Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {nlpSuggestedSkills.map((skill) => (
                          <Badge
                            key={skill.id}
                            variant="outline"
                            className="bg-background border-emerald-200 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300 cursor-pointer hover:bg-emerald-50"
                            onClick={() => handleQuickAskSkillSelected(skill)}
                          >
                            {skill.name}
                            <span className="ml-1 text-xs">+</span>
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Quick Ask */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap size={16} />
                  Quick Skill Discovery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuickAsk
                  query={quickAskQuery}
                  onQueryChange={setQuickAskQuery}
                  onSearch={handleQuickAskSearch}
                  onClear={handleQuickAskClear}
                  suggestions={quickAskSuggestions}
                  loading={quickAskLoading}
                  error={quickAskError}
                  showSuggestions={showQuickAskSuggestions}
                  onSkillSelected={handleQuickAskSkillSelected}
                />
              </CardContent>
            </Card>

            {/* Skill Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={18} />
                  Define Required Skills*
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SkillSelector
                  initialSelectedSkills={formData.requiredSkills}
                  nlpSuggestedSkills={nlpSuggestedSkills}
                  onChange={handleRequiredSkillsChange}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks size={18} />
                Task Management
                <Badge variant="secondary">
                  {formData.tasks?.length || 0} tasks
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaskManagerLocal
                initialTasks={formData.tasks || []}
                onTasksChange={handleTasksChange}
              />
            </CardContent>
          </Card>
        )}

        {/* Footer Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {activeTab !== "project" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const prevTabIndex = Math.max(0, currentTabIndex - 1);
                      setActiveTab(tabs[prevTabIndex].id);
                    }}
                    disabled={isSubmitting}
                  >
                    <ChevronRight size={16} className="mr-1 rotate-180" />
                    Back
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Progress */}
                <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
                  <span>
                    Step {currentTabIndex + 1} of {tabs.length}
                  </span>
                  <div className="flex gap-1">
                    {tabs.map((tab, index) => (
                      <div
                        key={tab.id}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-200",
                          index < currentTabIndex
                            ? "bg-green-500"
                            : index === currentTabIndex
                              ? "bg-primary"
                              : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs">
                    {progressPercentage}% complete
                  </span>
                </div>

                {/* Action Buttons */}
                {activeTab !== "tasks" ? (
                  <Button
                    type="button"
                    onClick={() => {
                      const nextTabIndex = Math.min(
                        tabs.length - 1,
                        currentTabIndex + 1
                      );
                      setActiveTab(tabs[nextTabIndex].id);
                    }}
                    disabled={isSubmitting}
                  >
                    Continue
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-3">
                    {/* Confirmation Status */}
                    {createConfirmation && (
                      <div className="flex items-center gap-2 text-sm animate-pulse">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-500 dark:text-green-400">
                          Click again to confirm creation
                        </span>
                        <Clock size={12} className="text-green-500" />
                      </div>
                    )}

                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting || isProcessingDescription}
                      className={cn(
                        "transition-all duration-300 min-w-[140px]",
                        createConfirmation &&
                          "bg-green-500 hover:bg-green-600 scale-105 shadow-lg"
                      )}
                    >
                      {isSubmitting && (
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      )}
                      {createConfirmation ? (
                        <>
                          <CheckCircle2 size={16} className="mr-2" />
                          Confirm Creation
                        </>
                      ) : (
                        <>{isEditMode ? "Save Changes" : "Create Project"}</>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ProjectForm;
