"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProjectFormNew from "@/components/projects/ProjectFormNew";

const NewProjectPage = () => {
  const router = useRouter();

  const handleSubmit = async (result) => {
    if (result?.projectId) {
      toast.success("Project created successfully");
      router.push(`/projects/${result.projectId}`);
    } else {
      console.error("No Project ID returned", result);
      toast.error("Error creating project");
    }
  };

  return (
    <ProjectFormNew
      isEditMode={false}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/projects")}
    />
  );
};

export default NewProjectPage;
