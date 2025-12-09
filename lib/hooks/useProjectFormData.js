import { useState, useEffect, useCallback } from "react";
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
  nlpExtractedSkills: [],
};

export const useProjectFormData = (
  initialData = initialProjectState,
  isEditMode = false,
  onSubmitForm
) => {
  const [projectData, setProjectData] = useState(() => {
    const effectiveInitial = {
      ...initialProjectState,
      ...initialData,
      department: initialData.department || initialProjectState.department,
      startDate: initialData.startDate
        ? initialData.startDate.split("T")[0]
        : "",
      endDate: initialData.endDate ? initialData.endDate.split("T")[0] : "",
      nlpExtractedSkills: initialData.nlpExtractedSkills || [],
    };
    return effectiveInitial;
  });

  const [nlpSuggestedSkills, setNlpSuggestedSkills] = useState([]);
  const [isProcessingDescription, setIsProcessingDescription] = useState(false);
  const [nlpError, setNlpError] = useState(null);
  const [descriptionProcessed, setDescriptionProcessed] = useState(false);
  const [localSubmitError, setLocalSubmitError] = useState(null);

  useEffect(() => {
    const effectiveInitial = {
      ...initialProjectState,
      ...initialData,
      department: initialData.department || initialProjectState.department,
      startDate: initialData.startDate
        ? initialData.startDate.split("T")[0]
        : "",
      endDate: initialData.endDate ? initialData.endDate.split("T")[0] : "",
      nlpExtractedSkills: initialData.nlpExtractedSkills || [],
    };
    setProjectData(effectiveInitial);

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
      !!(initialData.requiredSkills && initialData.requiredSkills.length > 0) ||
        !!(
          initialData.nlpExtractedSkills &&
          initialData.nlpExtractedSkills.length > 0
        )
    );
    setLocalSubmitError(null);
    setNlpError(null);
  }, [initialData, isEditMode]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({ ...prev, [name]: value }));
    if (name === "description") {
      setDescriptionProcessed(false);
      setNlpSuggestedSkills([]);
      setNlpError(null);
      setProjectData((prev) => ({ ...prev, nlpExtractedSkills: [] }));
    }
  }, []);

  const handleProcessDescription = useCallback(async () => {
    if (!projectData.description.trim()) {
      setNlpError("Please enter a project description first.");
      return;
    }
    setIsProcessingDescription(true);
    setNlpError(null);
    setNlpSuggestedSkills([]);
    setProjectData((prev) => ({ ...prev, nlpExtractedSkills: [] }));

    try {
      const response = await fetch("/api/recommendations/skills", {
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
      const suggestedForUI = result.data || [];
      setNlpSuggestedSkills(suggestedForUI);

      const rawSkillStrings = suggestedForUI.map((skill) => skill.name);
      setProjectData((prev) => ({
        ...prev,
        nlpExtractedSkills: rawSkillStrings,
      }));

      setDescriptionProcessed(true);
    } catch (err) {
      setNlpError(err.message);
      setDescriptionProcessed(false);
    } finally {
      setIsProcessingDescription(false);
    }
  }, [projectData.description]);

  const handleRequiredSkillsChange = useCallback((updatedRequiredSkills) => {
    setProjectData((prev) => ({
      ...prev,
      requiredSkills: updatedRequiredSkills,
    }));
    setLocalSubmitError(null);
  }, []);

  const handleSubmitLogic = useCallback(
    (e) => {
      e.preventDefault();
      setLocalSubmitError(null);

      if (!isEditMode && projectData.requiredSkills.length === 0 && !nlpError) {
        setLocalSubmitError(
          "Please process the description for skills or add required skills manually."
        );
        return;
      }

      const dataToSubmit = {
        ...projectData,
        startDate: projectData.startDate || null,
        endDate: projectData.endDate || null,
      };
      if (onSubmitForm) {
        onSubmitForm(dataToSubmit);
      }
    },
    [projectData, isEditMode, nlpError, onSubmitForm]
  );

  return {
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
  };
};
