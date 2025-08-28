"use client";

import { useState } from "react";
import { useProjects } from "@/lib/hooks/useProjects";
import ProjectForm from "@/components/projects/project-form";
import ProjectList from "@/components/projects/project-list";

export default function ProjectsPage() {
  const {
    handleCreateProject,
    handleUpdateProject,
    handleExtractSkills,
    loading,
  } = useProjects();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "Planning",
    department: "Unassigned",
    requiredSkills: [],
    tasks: [],
  });
  const [nlpSuggestedSkills, setNlpSuggestedSkills] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnalyze = async () => {
    if (!formData.description.trim()) return;
    const skills = await handleExtractSkills(formData.description);
    setNlpSuggestedSkills(skills);
  };

  const handleQuickAskSelect = (skill) => {
    if (!formData.requiredSkills.find((s) => s.skillId === skill.id)) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [
          ...prev.requiredSkills,
          {
            skillId: skill.id,
            skillName: skill.name,
            category: skill.category,
            proficiencyLevel: 1,
            isRequired: true,
          },
        ],
      }));
    }
  };

  const handleSkillsChange = (skills) => {
    setFormData((prev) => ({ ...prev, requiredSkills: skills }));
  };

  const handleTasksChange = (tasks) => {
    setFormData((prev) => ({ ...prev, tasks }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData._id) {
      await handleUpdateProject(formData);
    } else {
      await handleCreateProject(formData);
    }
    setFormData({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "Planning",
      department: "Unassigned",
      requiredSkills: [],
      tasks: [],
    });
    setNlpSuggestedSkills([]);
  };

  return (
    <div className="space-y-6">
      <ProjectForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onAnalyze={handleAnalyze}
        nlpSuggestedSkills={nlpSuggestedSkills}
        onQuickAskSelect={handleQuickAskSelect}
        onSkillsChange={handleSkillsChange}
        onTasksChange={handleTasksChange}
        loading={loading}
      />

      <ProjectList />
    </div>
  );
}
