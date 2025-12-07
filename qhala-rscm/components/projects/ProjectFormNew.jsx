"use client";
import { useState, useEffect } from "react";
import { useProjectFormData } from "@/lib/hooks/useProjectFormData";
import { departmentEnum, projectStatusEnum } from "@/lib/projectconstants";
import { formatDatePickerDate, parseDatePickerDate } from "@/lib/dateUtils";
import SkillSelectorNew from "@/components/projects/SkillSelectorNew";
import QuickAsk from "@/components/projects/quick-ask";
import { TaskManagerLocal } from "@/components/projects/TaskManagerNew";
import { useAI } from "@/lib/hooks/useAI";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Briefcase,
  Building2,
  Calendar,
  Sparkles,
  Wrench,
  CheckSquare,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";

const ProjectFormNew = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode = false,
  isSubmitting = false,
  submitError = null,
}) => {
  const { user } = useAuth();
  const {
    projectData,
    localSubmitError,
    handleChange,
    handleRequiredSkillsChange,
  } = useProjectFormData(initialData, isEditMode, onSubmit);

  const {
    quickAskQuery,
    setQuickAskQuery,
    quickAskSuggestions,
    quickAskLoading,
    quickAskError,
    showQuickAskSuggestions,
    handleQuickAskSearch,
    handleQuickAskClear,
    handleExtractSkills,
  } = useAI();

  const createProjectAction = useAction(api.api.createProjectAction);
  const createTask = useMutation(api.tasks.create);
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [createConfirmation, setCreateConfirmation] = useState(false);

  // Local state for Description Analysis UI
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nlpErrorState, setNlpError] = useState(null);
  const [nlpSuggestions, setNlpSuggestions] = useState([]);
  const [analysisDone, setAnalysisDone] = useState(false);

  const displayError = submitError || localSubmitError;

  useEffect(() => {
    if (createConfirmation) {
      const timer = setTimeout(() => {
        setCreateConfirmation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [createConfirmation]);

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

  const canProceedFromDetails = () => {
    return (
      projectData.name.trim() !== "" &&
      projectData.description.trim() !== "" &&
      projectData.department &&
      projectData.status
    );
  };

  const canProceedFromSkills = () => {
    return !isEditMode
      ? projectData.requiredSkills.length > 0 || analysisDone
      : true;
  };

  const handleNext = () => {
    if (currentStep === 1 && canProceedFromDetails()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedFromSkills()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onAnalyzeDescription = async () => {
    if (!projectData.description.trim()) return;

    setIsAnalyzing(true);
    setNlpError(null);

    try {
      const skills = await handleExtractSkills(null, projectData.description);

      if (skills && skills.length > 0) {
        setNlpSuggestions(skills);
        setAnalysisDone(true);
      } else {
        setNlpError("No skills identified. Try adding more technical details.");
      }
    } catch (err) {
      console.error(err);
      setNlpError("Failed to analyze description.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickAskSkillSelected = (skill) => {
    const skillId = skill.id || skill._id || `temp-${Date.now()}`;
    const skillName = skill.name || skill;

    const isAlreadySelected = projectData.requiredSkills.some(
      (s) => s.skillId === skillId || s.skillName === skillName
    );

    if (!isAlreadySelected) {
      const newSkill = {
        skillId: skillId,
        skillName: skillName,
        category: skill.category || "General",
        proficiencyLevel: 3,
        isRequired: true,
      };
      handleRequiredSkillsChange([...projectData.requiredSkills, newSkill]);
    }
  };

  const handleAddSkill = (skill) => {
    handleQuickAskSkillSelected(skill);
  };

  const handleFormSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (currentStep !== 3) {
      return;
    }

    if (
      !isEditMode &&
      projectData.requiredSkills.length === 0 &&
      analysisDone
    ) {
      return;
    }

    if (!createConfirmation) {
      setCreateConfirmation(true);
      return;
    }

    setIsLocalSubmitting(true);

    try {
      if (isEditMode) {
        const dataToSubmit = {
          projectData: {
            ...projectData,
            startDate: projectData.startDate
              ? new Date(projectData.startDate).getTime()
              : null,
            endDate: projectData.endDate
              ? new Date(projectData.endDate).getTime()
              : null,
          },
          tasks: tasks,
        };
        if (onSubmit) onSubmit(dataToSubmit);
      } else {
        const result = await createProjectAction({
          title: projectData.name,
          description: projectData.description,
          status: projectData.status,
          startDate: projectData.startDate || undefined,
          endDate: projectData.endDate || undefined,
          email: user?.email,
          department: projectData.department,
        });

        const newProjectId = result.projectId;
        toast.success("Project created successfully");

        // Persist local tasks now that we have a real projectId
        for (const t of tasks) {
          try {
            await createTask({
              email: user?.email,
              projectId: newProjectId,
              title: t.title,
              description: t.description || undefined,
              status: t.status || "todo",
              priority: t.priority || "medium",
              estimatedHours: t.estimatedHours || undefined,
              dueDate: t.dueDate || undefined,
              // For local creation we shouldn't have assignees yet
            });
          } catch (taskErr) {
            console.error("Failed to create task:", taskErr);
          }
        }

        if (onSubmit) {
          onSubmit({ projectId: newProjectId });
        }
      }
    } catch (error) {
      console.error(error);
      const msg = error.message?.includes("Python")
        ? "Backend Error: Failed to generate project analysis."
        : "Failed to create project.";
      toast.error(msg);
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Planning: "bg-rscm-lilac/20 text-rscm-violet",
      Active: "bg-green-50 text-green-700",
      "On Hold": "bg-yellow-50 text-yellow-700",
      Completed: "bg-gray-100 text-gray-600",
      Cancelled: "bg-red-50 text-red-600",
    };
    return colors[status] || colors.Planning;
  };

  const steps = [
    { number: 1, label: "Details", icon: Briefcase },
    { number: 2, label: "Skills", icon: Wrench },
    { number: 3, label: "Tasks", icon: CheckSquare },
  ];

  const isLoading = isSubmitting || isLocalSubmitting;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {onCancel && (
          <div className="px-6 py-3 border-b border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-rscm-violet transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Projects
            </button>
          </div>
        )}

        <div className="px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rscm-violet to-rscm-plum flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-rscm-dark-purple">
                {isEditMode ? "Edit Project" : "Create New Project"}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {isEditMode
                  ? "Update project details and requirements"
                  : "Define your project and let AI identify required skills"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const Icon = step.icon;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-rscm-violet text-white"
                          : isCompleted
                            ? "bg-rscm-lilac/20 text-rscm-violet"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isActive || isCompleted
                          ? "text-rscm-dark-purple"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-3 h-0.5 bg-gray-100">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? "bg-rscm-violet" : "bg-transparent"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {displayError && (
        <div className="bg-red-50 rounded-lg px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-red-900">Error</h4>
            <p className="text-xs text-red-700 mt-0.5">{displayError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleFormSubmit}>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {currentStep === 1 && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-rscm-dark-purple mb-3">
                  Basic Information
                </h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Project Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={projectData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Q4 Marketing Campaign"
                      className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      Department*
                    </label>
                    <div className="relative">
                      <select
                        name="department"
                        value={projectData.department}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none transition-all appearance-none pr-8"
                      >
                        {departmentEnum.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status*
                    </label>
                    <div className="relative">
                      <select
                        name="status"
                        value={projectData.status}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none transition-all appearance-none pr-8"
                      >
                        {projectStatusEnum.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="mt-1.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium ${getStatusColor(
                          projectData.status
                        )}`}
                      >
                        {projectData.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Start Date
                    </label>
                    <DatePicker
                      selected={parseDatePickerDate(projectData.startDate)}
                      onChange={handleStartDateChange}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="YYYY-MM-DD"
                      className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none transition-all"
                      wrapperClassName="w-full"
                      showPopperArrow={false}
                      isClearable
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      End Date
                    </label>
                    <DatePicker
                      selected={parseDatePickerDate(projectData.endDate)}
                      onChange={handleEndDateChange}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="YYYY-MM-DD"
                      className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none transition-all"
                      wrapperClassName="w-full"
                      showPopperArrow={false}
                      isClearable
                      minDate={parseDatePickerDate(projectData.startDate)}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-base font-semibold text-rscm-dark-purple mb-3">
                  Project Description
                </h2>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={projectData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Provide a detailed project scope, objectives, and deliverables..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none transition-all resize-none"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-rscm-dark-purple mb-2">
                  Project Description
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {projectData.description}
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-rscm-dark-purple mb-3">
                  AI Skill Analysis
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                  Analyze your project description to automatically extract
                  required skills
                </p>
                <button
                  type="button"
                  onClick={onAnalyzeDescription}
                  disabled={isAnalyzing || !projectData.description.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rscm-violet text-white text-xs font-medium rounded-lg hover:bg-rscm-plum transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      {analysisDone && nlpSuggestions.length > 0
                        ? "Re-analyze"
                        : "Analyze with AI"}
                    </>
                  )}
                </button>

                {nlpErrorState && (
                  <div className="mt-3 bg-red-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-red-700">{nlpErrorState}</p>
                  </div>
                )}

                {analysisDone && nlpSuggestions.length > 0 && !isAnalyzing && (
                  <div className="mt-3 bg-rscm-lilac/10 rounded-lg px-4 py-3">
                    <h3 className="flex items-center gap-1.5 text-xs font-semibold text-rscm-violet mb-2">
                      <CheckCircle className="w-3.5 h-3.5" />
                      AI Skill Suggestions
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {nlpSuggestions.map((skill, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => handleAddSkill(skill)}
                          className="px-2.5 py-1 bg-white text-rscm-violet text-xs font-medium rounded-full cursor-pointer hover:bg-gray-50 transition-colors border border-rscm-lilac/20"
                        >
                          {skill.name || skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-base font-semibold text-rscm-dark-purple mb-3">
                  Manual Search
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                  Search for additional skills beyond the project description
                </p>
                <QuickAsk
                  query={quickAskQuery}
                  onQueryChange={setQuickAskQuery}
                  onSearch={handleQuickAskSearch}
                  onClear={handleQuickAskClear}
                  suggestions={quickAskSuggestions}
                  loading={quickAskLoading}
                  error={quickAskError}
                  showSuggestions={showQuickAskSuggestions}
                  onSkillSelected={handleAddSkill}
                />
              </div>

              <div>
                <h2 className="flex items-center gap-1.5 text-base font-semibold text-rscm-dark-purple mb-3">
                  <Wrench className="w-4 h-4" />
                  Required Skills*
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                  Review and manage all selected skills for this project
                </p>
                <SkillSelectorNew
                  initialSelectedSkills={projectData.requiredSkills}
                  nlpSuggestedSkills={nlpSuggestions}
                  onChange={handleRequiredSkillsChange}
                  title="Project Skills"
                  description="Select the skills required for this project"
                />
                {projectData.requiredSkills.length === 0 &&
                  !isEditMode &&
                  analysisDone && (
                    <div className="mt-2 bg-red-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-red-700">
                        Please select at least one required skill.
                      </p>
                    </div>
                  )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="p-6">
              <TaskManagerLocal initialTasks={tasks} onTasksChange={setTasks} />
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onCancel && currentStep === 1 && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !canProceedFromDetails()) ||
                    (currentStep === 2 && !canProceedFromSkills())
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rscm-violet text-white text-sm font-medium rounded-lg hover:bg-rscm-plum transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  {createConfirmation && (
                    <div className="flex items-center gap-2 text-sm animate-pulse">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-600">
                        Click again to confirm
                      </span>
                      <Clock className="w-3 h-3 text-green-600" />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      (!isEditMode &&
                        projectData.requiredSkills.length === 0 &&
                        analysisDone)
                    }
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                      createConfirmation
                        ? "bg-green-500 hover:bg-green-600 text-white scale-105 shadow-lg"
                        : "bg-rscm-violet hover:bg-rscm-plum text-white"
                    }`}
                  >
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {createConfirmation ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Confirm Creation
                      </>
                    ) : (
                      <>{isEditMode ? "Save Changes" : "Create Project"}</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProjectFormNew;
