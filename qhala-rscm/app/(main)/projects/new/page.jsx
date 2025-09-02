// app/projects/new/page.jsx
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProjects } from "@/lib/hooks/useProjects";
import { useAI } from "@/lib/hooks/useAI";
import ProjectForm from "@/components/projects/project-form";

const NewProjectPage = () => {
  const router = useRouter();
  const { handleCreateProject } = useProjects();
  const { handleExtractSkills } = useAI();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const id = await handleCreateProject(formData);
      router.push(`/projects/${id}`);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <ProjectForm
        isEditMode={false}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/projects")}
        isSubmitting={isSubmitting}
        submitError={submitError}
        onExtractSkills={handleExtractSkills}
      />
    </div>
  );
};

export default NewProjectPage;
