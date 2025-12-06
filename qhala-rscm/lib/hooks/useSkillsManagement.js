import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";

export const useSkillsManagement = () => {
  const { user } = useAuth();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [skillsAwaitingDelete, setSkillsAwaitingDelete] = useState(new Set());

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Convex Queries
  const skills = useQuery(api.skills.getAll, {
    search: debouncedSearchTerm || undefined,
    category: selectedCategory || undefined,
  });

  const skillsDistribution = useQuery(
    api.skills.getDistribution,
    user?.email ? { email: user.email } : "skip"
  );

  // Mutations
  const deleteSkillMutation = useMutation(api.skills.deleteSkill);

  // Derived Data
  const loading = !skills || !skillsDistribution;
  const categories = skillsDistribution?.map((cat) => cat.category) || [];

  const enrichedSkills =
    skills?.map((skill) => {
      const dist = skillsDistribution
        ?.flatMap((cat) => cat.skills)
        .find((s) => s.skillId === skill._id);
      return {
        ...skill,
        currentUsers: dist?.currentUserCount || 0,
        desiredUsers: dist?.desiredUserCount || 0,
        totalUsage:
          (dist?.currentUserCount || 0) + (dist?.desiredUserCount || 0),
      };
    }) || [];

  // Actions
  const handleDeleteSkill = async (
    skillId,
    skillName,
    isConfirming = false
  ) => {
    if (!isConfirming) {
      setSkillsAwaitingDelete((prev) => new Set([...prev, skillId]));
      toast.info(`Click "Confirm" to delete "${skillName}"`, {
        duration: 4000,
      });
      setTimeout(() => handleCancelDelete(skillId), 5000);
      return;
    }

    try {
      const result = await deleteSkillMutation({ email: user.email, skillId });
      toast.success(result.message);
      handleCancelDelete(skillId);
    } catch (error) {
      toast.error(error.message || "Failed to delete skill");
      handleCancelDelete(skillId);
    }
  };

  const handleCancelDelete = (skillId) => {
    setSkillsAwaitingDelete((prev) => {
      const newSet = new Set(prev);
      newSet.delete(skillId);
      return newSet;
    });
  };

  return {
    // Data
    skills: enrichedSkills,
    categories,
    loading,
    user,

    // State
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    selectedCategory,
    setSelectedCategory,
    viewMode,
    setViewMode,
    showCreateModal,
    setShowCreateModal,
    skillsAwaitingDelete,

    // Actions
    handleDeleteSkill,
    handleCancelDelete,
  };
};
