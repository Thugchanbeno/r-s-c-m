"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/hooks/useAuth";

export const useProfile = () => {
  const { user: authUser, isLoading: authLoading, isAuthenticated } = useAuth();
  
  // Convex queries - all now use email parameter
  const userProfile = useQuery(
    api.users.getUserByEmail,
    authUser?.email ? { email: authUser.email } : "skip"
  );
  
  const userSkills = useQuery(
    api.userSkills.getForCurrentUser,   
    authUser?.email ? { email: authUser.email } : "skip"
  );
  
    const allSkills = useQuery(
    api.skills.getAll,                  
    {} 
  );
   const allocationSummary = useQuery(
    api.allocations.getSummary,
    authUser?.email ? { email: authUser.email, scope: "overall" } : "skip"
  );
  
  const userAllocations = useQuery(
    api.users.getAllocationSummary,
    authUser?.email && userProfile?._id
      ? { email: authUser.email, userId: userProfile._id }
      : "skip"
  );
  
  const leaveBalance = useMutation(
  api.workRequests.getLeaveBalance,   
  authUser?.email ? { email: authUser.email } : "skip"
);

  const lineManager = useQuery(
    api.users.getById,
    userProfile?.lineManagerId && authUser?.email ? { 
      email: authUser.email, 
      id: userProfile.lineManagerId 
    } : "skip"
  );

  const recentWorkRequests = useQuery(
    api.workRequests.getByUser,
    authUser?.email ? { 
      email: authUser.email, 
      limit: 5 
    } : "skip"
  );

  const pendingSkillVerifications = useQuery(
    api.skills.getPendingVerifications,
    authUser?.email ? { email: authUser.email } : "skip"
  );

  // Mutations - all now include email parameter
  const updateUserSkills = useMutation(api.userSkills.updateForCurrentUser);
  const updateUserProfile = useMutation(api.users.updateProfile);
  const createWorkRequest = useMutation(api.workRequests.create);
  const uploadProofDocument = useMutation(api.skills.uploadProofDocument);

  // Local state
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState(new Map());
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Computed values
  const currentSkills = useMemo(() => {
    return userSkills?.filter(skill => skill.isCurrent) || [];
  }, [userSkills]);

  const desiredSkills = useMemo(() => {
    return userSkills?.filter(skill => skill.isDesired) || [];
  }, [userSkills]);

  const groupedSkills = useMemo(() => {
    if (!allSkills) return {};
    
    return allSkills.reduce((acc, skill) => {
      const category = skill.category || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {});
  }, [allSkills]);

  const capacityData = useMemo(() => {
    if (!userAllocations || !userProfile) return null;
    
    const weeklyHours = userProfile.weeklyHours || 40;
    const allocatedHours = userAllocations.totalAllocatedHours || 0;
    const percentage = Math.round((allocatedHours / weeklyHours) * 100);
    
    return {
      percentage,
      allocatedHours,
      weeklyHours,
      status: percentage > 100 ? 'overallocated' : percentage > 80 ? 'high' : 'normal'
    };
  }, [userAllocations, userProfile]);

  const leaveData = useMemo(() => {
    if (!leaveBalance) return null;
    
    const remaining = (leaveBalance.annualLeaveEntitlement || 21) - (leaveBalance.annualLeaveUsed || 0);
    const compDays = leaveBalance.compensatoryDaysBalance || 0;
    const totalAvailable = remaining + compDays;
    
    return {
      remaining,
      used: leaveBalance.annualLeaveUsed || 0,
      entitlement: leaveBalance.annualLeaveEntitlement || 21,
      compDays,
      totalAvailable
    };
  }, [leaveBalance]);

  // Handlers
  const handleSaveSkills = useCallback(async () => {
    if (!authUser?.email) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const currentSkills = Array.from(selectedSkills.entries())
        .filter(([_, data]) => data.isCurrent)
        .map(([skillId, data]) => ({ skillId, proficiency: data.proficiency }));
      
      const desiredSkillIds = Array.from(selectedSkills.entries())
        .filter(([_, data]) => data.isDesired)
        .map(([skillId]) => skillId);

      await updateUserSkills({
        email: authUser.email,
        currentSkills,
        desiredSkillIds
      });
      
      setIsEditingSkills(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }, [selectedSkills, updateUserSkills, authUser?.email]);

  const handleSaveProfile = useCallback(async (profileData) => {
    if (!authUser?.email) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await updateUserProfile({
        email: authUser.email,
        ...profileData
      });
      
      setIsEditingProfile(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }, [updateUserProfile, authUser?.email]);

  const handleCreateWorkRequest = useCallback(async (requestData) => {
    if (!authUser?.email) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await createWorkRequest({
        email: authUser.email,
        ...requestData
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }, [createWorkRequest, authUser?.email]);

  const handleUploadProof = useCallback(async (userSkillId, proofData) => {
    if (!authUser?.email) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await uploadProofDocument({
        email: authUser.email,
        userSkillId,
        ...proofData
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }, [uploadProofDocument, authUser?.email]);

  const toggleSkillCategory = useCallback((category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  return {
    // Data
    userProfile,
    currentSkills,
    desiredSkills,
    allSkills,
    groupedSkills,
    allocationSummary,
    userAllocations,
    leaveBalance,
    leaveData,
    lineManager,
    recentWorkRequests,
    pendingSkillVerifications,
    capacityData,
    
    // State
    isEditingSkills,
    setIsEditingSkills,
    isEditingProfile,
    setIsEditingProfile,
    selectedSkills,
    setSelectedSkills,
    expandedCategories,
    isSaving,
    error,
    setError,
    activeTab,
    setActiveTab,
    
    // Loading states
    isLoading: authLoading || userProfile === undefined,
    isAuthenticated,
    
    // Handlers
    handleSaveSkills,
    handleSaveProfile,
    handleCreateWorkRequest,
    handleUploadProof,
    toggleSkillCategory,
  };
};