"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";

export const useProfile = () => {
  const { user: authUser, isLoading: authLoading, isAuthenticated } = useAuth();

  // Queries
  const userProfile = useQuery(
    api.users.getUserByEmail,
    authUser?.email ? { email: authUser.email } : "skip"
  );

  const userSkills = useQuery(
    api.userSkills.getForCurrentUser,
    authUser?.email ? { email: authUser.email } : "skip"
  );

  const allSkills = useQuery(api.skills.getAll, {});

  const userAllocations = useQuery(
    api.users.getAllocationSummary,
    authUser?.email && userProfile?._id
      ? { email: authUser.email, userId: userProfile._id }
      : "skip"
  );

  const recentWorkRequests = useQuery(
    api.workRequests.getByUser,
    authUser?.email ? { email: authUser.email, limit: 5 } : "skip"
  );

  const pendingSkillVerifications = useQuery(
    api.skills.getPendingVerifications,
    authUser?.email ? { email: authUser.email } : "skip"
  );

  // Mutations
  const updateUserProfile = useMutation(api.users.updateProfile);
  const updateUserSkills = useMutation(api.userSkills.updateForCurrentUser);
  const uploadProofDocument = useMutation(api.skills.uploadProofDocument);
  const removeProofDocument = useMutation(api.skills.removeProofDocument);

  // State
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Modal states
  const [isEmploymentModalOpen, setIsEmploymentModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isCurrentSkillsModalOpen, setIsCurrentSkillsModalOpen] =
    useState(false);
  const [isDesiredSkillsModalOpen, setIsDesiredSkillsModalOpen] =
    useState(false);

  // Skills state
  const [selectedCurrentSkillsMap, setSelectedCurrentSkillsMap] = useState(
    new Map()
  );
  const [selectedDesiredSkillIds, setSelectedDesiredSkillIds] = useState(
    new Set()
  );
  const [expandedCurrentSkillCategories, setExpandedCurrentSkillCategories] =
    useState({});
  const [expandedDesiredSkillCategories, setExpandedDesiredSkillCategories] =
    useState({});

  // Derived
  const currentSkills = useMemo(
    () => userSkills?.filter((s) => s.isCurrent) || [],
    [userSkills]
  );
  const desiredSkills = useMemo(
    () => userSkills?.filter((s) => s.isDesired) || [],
    [userSkills]
  );

  const groupedSkillsTaxonomy = useMemo(() => {
    if (!allSkills) return {};
    return allSkills.reduce((acc, skill) => {
      const category = skill.category || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {});
  }, [allSkills]);

  // Handlers
  const handleSaveProfile = useCallback(
    async (profileData) => {
      if (!authUser?.email) return;
      setIsSaving(true);
      setError(null);
      try {
        await updateUserProfile(profileData);
        toast.success("Profile updated", {
          description: "Employment details saved successfully.",
        });
        setIsEmploymentModalOpen(false);
      } catch (err) {
        setError(err.message);
        toast.error("Update failed", { description: err.message });
      } finally {
        setIsSaving(false);
      }
    },
    [updateUserProfile, authUser?.email]
  );

  const handleSaveSkills = useCallback(async () => {
    if (!authUser?.email) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateUserSkills({
        email: authUser.email,
        currentSkills: Array.from(selectedCurrentSkillsMap.entries()).map(
          ([skillId, proficiency]) => ({ skillId, proficiency })
        ),
        desiredSkillIds: Array.from(selectedDesiredSkillIds),
      });
      toast.success("Skills updated", {
        description: "Your skills were saved successfully.",
      });
      setIsCurrentSkillsModalOpen(false);
      setIsDesiredSkillsModalOpen(false);
    } catch (err) {
      setError(err.message);
      toast.error("Update failed", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  }, [
    updateUserSkills,
    authUser?.email,
    selectedCurrentSkillsMap,
    selectedDesiredSkillIds,
  ]);

  // Proof handling
  const handleUploadProof = useCallback(
    async (userSkillId) => {
      if (!authUser?.email) return;
      try {
        // TODO: integrate file picker
        const fakeStorageId = "some-storage-id"; // placeholder
        await uploadProofDocument({
          email: authUser.email,
          userSkillId,
          fileName: "certificate.pdf",
          proofType: "certification",
          documentStorageId: fakeStorageId,
        });
        toast.success("Proof uploaded", {
          description: "Your proof document was uploaded successfully.",
        });
      } catch (err) {
        toast.error("Upload failed", { description: err.message });
      }
    },
    [uploadProofDocument, authUser?.email]
  );

  const handleAddProofUrl = useCallback(
    async (userSkillId, url) => {
      if (!authUser?.email) return;
      try {
        await uploadProofDocument({
          email: authUser.email,
          userSkillId,
          fileName: url,
          proofType: "link",
          url,
        });
        toast.success("Proof link added", {
          description: "Your proof link was added successfully.",
        });
      } catch (err) {
        toast.error("Failed to add link", { description: err.message });
      }
    },
    [uploadProofDocument, authUser?.email]
  );

  const handleRemoveProof = useCallback(
    async (userSkillId, documentStorageId) => {
      if (!authUser?.email) return;
      try {
        await removeProofDocument({
          email: authUser.email,
          userSkillId,
          documentStorageId,
        });
        toast.success("Proof removed", {
          description: "The proof document was removed.",
        });
      } catch (err) {
        toast.error("Failed to remove proof", { description: err.message });
      }
    },
    [removeProofDocument, authUser?.email]
  );

  return {
    // Data
    userProfile,
    currentSkills,
    desiredSkills,
    groupedSkillsTaxonomy,
    allSkills,
    expandedCurrentSkillCategories,
    expandedDesiredSkillCategories,
    selectedCurrentSkillsMap,
    selectedDesiredSkillIds,
    userAllocations,
    recentWorkRequests,
    pendingSkillVerifications,

    // State
    isSaving,
    error,
    isLoading: authLoading || userProfile === undefined,
    isAuthenticated,
    activeTab,
    setActiveTab,

    // Modal states
    isEmploymentModalOpen,
    setIsEmploymentModalOpen,
    isLeaveModalOpen,
    setIsLeaveModalOpen,
    isOvertimeModalOpen,
    setIsOvertimeModalOpen,
    isCurrentSkillsModalOpen,
    setIsCurrentSkillsModalOpen,
    isDesiredSkillsModalOpen,
    setIsDesiredSkillsModalOpen,

    // Setters
    setExpandedCurrentSkillCategories,
    setExpandedDesiredSkillCategories,
    setSelectedCurrentSkillsMap,
    setSelectedDesiredSkillIds,

    // Handlers
    handleSaveProfile,
    handleSaveSkills,
    handleUploadProof,
    handleAddProofUrl,
    handleRemoveProof,
  };
};
