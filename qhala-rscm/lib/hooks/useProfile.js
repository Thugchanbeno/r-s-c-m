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

  const createUserSkill = useMutation(api.userSkills.createUserSkill);

  const userAllocations = useQuery(
    api.users.getAllocationSummary,
    authUser?.email && userProfile?._id
      ? { email: authUser.email, userId: userProfile._id }
      : "skip"
  );

  const recentWorkRequests = useQuery(
    api.workRequests.getAll,
    authUser?.email ? { email: authUser.email } : "skip"
  );

  // Note: getPendingVerifications is for line managers to see their team's pending skills
  // For the user's own profile, we derive pending skills from their userSkills

  // Mutations
  const updateUserProfile = useMutation(api.users.updateProfile);
  const updateUserSkills = useMutation(api.userSkills.updateForCurrentUser);
  const uploadProofDocument = useMutation(api.skills.uploadProofDocument);
  const removeProofDocument = useMutation(api.skills.removeProofDocument);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createLeaveRequest = useMutation(api.workRequests.createLeaveRequest);
  const createOvertimeRequest = useMutation(
    api.workRequests.createOvertimeRequest
  );

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
    () => {
      const skills = userSkills?.filter((s) => s.isCurrent) || [];
      // Add isVerified flag based on proof documents
      return skills.map(skill => ({
        ...skill,
        isVerified: skill.proofDocuments?.some((doc) => doc.verificationStatus === "approved") || false,
        isPending: skill.proofDocuments?.some((doc) => doc.verificationStatus === "pending") || false,
      }));
    },
    [userSkills]
  );
  const desiredSkills = useMemo(
    () => userSkills?.filter((s) => s.isDesired) || [],
    [userSkills]
  );
  
  // Derive pending verifications from current skills with pending proof documents
  const pendingSkillVerifications = useMemo(
    () => currentSkills.filter((skill) => 
      skill.proofDocuments?.some((doc) => doc.verificationStatus === "pending")
    ),
    [currentSkills]
  );
  
  const isOnboarding = currentSkills.length === 0;

  const groupedSkillsTaxonomy = useMemo(() => {
    if (!allSkills) return {};
    return allSkills.reduce((acc, skill) => {
      const category = skill.category || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {});
  }, [allSkills]);

  // File upload handlers
  const handleUploadProof = useCallback(
    async (skillId, file, proofType) => {
      if (!authUser?.email) {
        toast.error("Authentication required");
        return;
      }

      try {
        const uploadUrl = await generateUploadUrl({ email: authUser.email });

        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!response.ok) {
          throw new Error(
            `Upload failed: ${response.status} ${response.statusText}`
          );
        }

        const { storageId } = await response.json();

        let userSkillId;
        const existing = userSkills?.find((us) => us.skillId === skillId);
        if (existing) {
          userSkillId = existing._id;
        } else {
          userSkillId = await createUserSkill({
            email: authUser.email,
            skillId,
            isCurrent: true,
            isDesired: false,
            proficiency: 1,
          });
        }

        await uploadProofDocument({
          email: authUser.email,
          userSkillId,
          fileName: file.name,
          proofType,
          documentStorageId: storageId,
        });

        toast.success("Proof uploaded successfully!");
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Upload failed", { description: err.message });
      }
    },
    [generateUploadUrl, uploadProofDocument, authUser?.email, userSkills]
  );

  const handleUploadCV = useCallback(
    async (file) => {
      if (!authUser?.email) {
        toast.error("Authentication required");
        return;
      }

      try {
        const uploadUrl = await generateUploadUrl({ email: authUser.email });

        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!response.ok) {
          throw new Error(
            `Upload failed: ${response.status} ${response.statusText}`
          );
        }

        const result = await response.json();

        if (!result.storageId) {
          throw new Error("No storage ID returned from upload");
        }
        toast.success("CV uploaded successfully!", {
          description:
            "You can now add skills manually while we process your CV.",
        });

        return true;
      } catch (err) {
        console.error("CV upload error:", err);
        toast.error("CV upload failed", {
          description: err.message || "Unknown error occurred",
        });
        return false;
      }
    },
    [generateUploadUrl, authUser?.email]
  );

  const handleAddProofUrl = useCallback(
    async (skillId, url) => {
      if (!authUser?.email) return;

      try {
        let userSkillId;
        const existing = userSkills?.find((us) => us.skillId === skillId);
        if (existing) {
          userSkillId = existing._id;
        } else {
          userSkillId = await createUserSkill({
            email: authUser.email,
            skillId,
            isCurrent: true,
            isDesired: false,
            proficiency: 1,
          });
        }
        await uploadProofDocument({
          email: authUser.email,
          userSkillId,
          fileName: url,
          proofType: "link",
          url,
        });

        toast.success("Proof link added successfully!");
      } catch (err) {
        toast.error("Failed to add link", { description: err.message });
      }
    },
    [uploadProofDocument, createUserSkill, userSkills, authUser?.email]
  );

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

  const handleCreateLeaveRequest = useCallback(
    async (form) => {
      if (!authUser?.email) return;
      setIsSaving(true);
      setError(null);
      try {
        await createLeaveRequest({ email: authUser.email, ...form });
        toast.success("Leave request submitted", {
          description: "Your leave request has been sent for approval.",
        });
        setIsLeaveModalOpen(false);
      } catch (err) {
        setError(err.message);
        toast.error("Request failed", { description: err.message });
      } finally {
        setIsSaving(false);
      }
    },
    [createLeaveRequest, authUser?.email]
  );

  const handleCreateOvertimeRequest = useCallback(
    async (form) => {
      if (!authUser?.email) return;
      setIsSaving(true);
      setError(null);
      try {
        await createOvertimeRequest({ email: authUser.email, ...form });
        toast.success("Overtime request submitted", {
          description: "Your overtime request has been sent for approval.",
        });
        setIsOvertimeModalOpen(false);
      } catch (err) {
        setError(err.message);
        toast.error("Request failed", { description: err.message });
      } finally {
        setIsSaving(false);
      }
    },
    [createOvertimeRequest, authUser?.email]
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
    isOnboarding,

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
    handleUploadCV,
    handleAddProofUrl,
    handleRemoveProof,
    handleCreateLeaveRequest,
    handleCreateOvertimeRequest,
  };
};
