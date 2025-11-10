"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProjects } from "@/lib/hooks/useProjects";
import ProjectFormNew from "@/components/projects/ProjectFormNew";

const NewProjectPage = () => {
  const router = useRouter();
  const { handleCreateProject } = useProjects();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmitError(null);
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
    <ProjectFormNew
      isEditMode={false}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/projects")}
      isSubmitting={isSubmitting}
      submitError={submitError}
    />
  );
};

export default NewProjectPage;
