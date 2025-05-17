// lib/hooks/useProfileData.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";

const DEFAULT_PROFICIENCY = 3;

export const useProfileData = () => {
  const { data: session, status } = useSession();

  const [currentSkills, setCurrentSkills] = useState([]);
  const [desiredSkills, setDesiredSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allSkillsTaxonomy, setAllSkillsTaxonomy] = useState([]);

  const [expandedCurrentSkillCategories, setExpandedCurrentSkillCategories] =
    useState({});
  const [expandedDesiredSkillCategories, setExpandedDesiredSkillCategories] =
    useState({});
  const [isEditingCurrentSkills, setIsEditingCurrentSkills] = useState(false);
  const [isEditingDesiredSkills, setIsEditingDesiredSkills] = useState(false);
  const [selectedCurrentSkillsMap, setSelectedCurrentSkillsMap] = useState(
    new Map()
  );
  const [selectedDesiredSkillIds, setSelectedDesiredSkillIds] = useState(
    new Set()
  );

  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(true);
  const [skillsError, setSkillsError] = useState(null);
  const [projectsError, setProjectsError] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [totalAllocationSummary, setTotalAllocationSummary] = useState({
    percentage: 0,
    hours: 0,
    count: 0,
    standardHours: 40,
  });
  const [loadingAllocationSummary, setLoadingAllocationSummary] =
    useState(true);
  const [allocationSummaryError, setAllocationSummaryError] = useState(null);

  const groupedSkillsTaxonomy = useMemo(() => {
    if (
      loadingTaxonomy ||
      !allSkillsTaxonomy ||
      allSkillsTaxonomy.length === 0
    ) {
      return {};
    }
    const grouped = allSkillsTaxonomy.reduce((acc, skill) => {
      const category = skill.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    }, {});
    // Sort skills within each category
    for (const category in grouped) {
      grouped[category].sort((a, b) => a.name.localeCompare(b.name));
    }
    return grouped;
  }, [allSkillsTaxonomy, loadingTaxonomy]);

  useEffect(() => {
    if (Object.keys(groupedSkillsTaxonomy).length > 0) {
      const initialExpandedState = Object.keys(groupedSkillsTaxonomy).reduce(
        (acc, category) => {
          acc[category] = false; // Start all collapsed
          return acc;
        },
        {}
      );
      setExpandedCurrentSkillCategories(initialExpandedState);
      setExpandedDesiredSkillCategories(initialExpandedState);
    } else {
      setExpandedCurrentSkillCategories({});
      setExpandedDesiredSkillCategories({});
    }
  }, [groupedSkillsTaxonomy]);

  useEffect(() => {
    const fetchTaxonomy = async () => {
      setLoadingTaxonomy(true);
      try {
        const response = await fetch("/api/skills");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setAllSkillsTaxonomy(result.data);
        } else {
          throw new Error(result.error || "Invalid taxonomy data format");
        }
      } catch (error) {
        console.error("Error fetching skill taxonomy:", error);
        // Optionally set a specific taxonomy error state
      } finally {
        setLoadingTaxonomy(false);
      }
    };
    fetchTaxonomy();
  }, []);

  const fetchAllUserData = useCallback(async () => {
    if (!session?.user?.id) {
      setLoadingSkills(false);
      setLoadingProjects(false);
      setLoadingAllocationSummary(false);
      return;
    }
    const userId = session.user.id;

    setLoadingSkills(true);
    setLoadingProjects(true);
    setLoadingAllocationSummary(true);
    setSkillsError(null);
    setProjectsError(null);
    setAllocationSummaryError(null);

    try {
      const [
        skillsResponse,
        allocationsForProfileResponse,
        totalAllocationResponse,
      ] = await Promise.all([
        fetch(`/api/userskills`), // Assumes API gets user from session
        fetch(`/api/allocations?userId=${userId}`),
        fetch(`/api/users/${userId}/allocation-summary`),
      ]);

      // Process Skills
      if (!skillsResponse.ok) {
        const skillsErrData = await skillsResponse.json().catch(() => ({}));
        throw new Error(
          skillsErrData.error ||
            `HTTP error fetching skills! status: ${skillsResponse.status}`
        );
      }
      const skillsResult = await skillsResponse.json();
      if (skillsResult.success && Array.isArray(skillsResult.data)) {
        const userSkillsData = skillsResult.data;
        const current = userSkillsData.filter((s) => s.isCurrent);
        const desired = userSkillsData.filter((s) => s.isDesired);
        setCurrentSkills(current);
        setDesiredSkills(desired);
        setSelectedCurrentSkillsMap(
          new Map(
            current.map((s) => [s.skillId?._id.toString(), s.proficiency])
          )
        );
        setSelectedDesiredSkillIds(
          new Set(desired.map((s) => s.skillId?._id.toString()))
        );
      } else {
        setSkillsError(skillsResult.error || "Invalid skills data format");
      }

      // Process Projects/Allocations for Profile List
      if (!allocationsForProfileResponse.ok) {
        const allocErrData = await allocationsForProfileResponse
          .json()
          .catch(() => ({}));
        throw new Error(
          allocErrData.error ||
            `Error fetching allocations status: ${allocationsForProfileResponse.status}`
        );
      }
      const projectsResult = await allocationsForProfileResponse.json();
      if (projectsResult.success && Array.isArray(projectsResult.data)) {
        setProjects(projectsResult.data);
      } else {
        setProjectsError(
          projectsResult.error || "Invalid allocations data format."
        );
      }

      // Process Total Allocation Summary
      if (!totalAllocationResponse.ok) {
        const summaryErrData = await totalAllocationResponse
          .json()
          .catch(() => ({}));
        throw new Error(
          summaryErrData.error ||
            `Error fetching total allocation summary: ${totalAllocationResponse.status}`
        );
      }
      const summaryResult = await totalAllocationResponse.json();
      if (summaryResult.success && summaryResult.data) {
        const newSummary = {
          // Create a new object to ensure state update
          percentage: summaryResult.data.totalCurrentCapacityPercentage,
          hours: summaryResult.data.totalAllocatedHours,
          count: summaryResult.data.activeAllocationCount,
          standardHours: summaryResult.data.standardWorkWeekHours,
        };
        console.log(
          "useProfileData - Setting totalAllocationSummary to:",
          newSummary
        );
        setTotalAllocationSummary(newSummary);
      } else {
        setAllocationSummaryError(
          summaryResult.error || "Invalid total allocation summary data."
        );
      }
    } catch (error) {
      // This catch block will handle errors from Promise.all or any subsequent processing
      console.error(
        "Error fetching user data (skills, projects, or summary):",
        error
      );
      // Set a general error or specific ones if not already set
      if (!skillsError) setSkillsError(error.message);
      if (!projectsError) setProjectsError(error.message);
      if (!allocationSummaryError) setAllocationSummaryError(error.message);
    } finally {
      setLoadingSkills(false);
      setLoadingProjects(false);
      setLoadingAllocationSummary(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAllUserData();
    }
    if (status === "unauthenticated") {
      setCurrentSkills([]);
      setDesiredSkills([]);
      setProjects([]);
      // setAllSkillsTaxonomy([]); // Taxonomy might not need reset if not user-specific
      setSelectedCurrentSkillsMap(new Map());
      setSelectedDesiredSkillIds(new Set());
      setSkillsError(null);
      setProjectsError(null);
      setAllocationSummaryError(null);
      setSaveError(null);
      setIsEditingCurrentSkills(false);
      setIsEditingDesiredSkills(false);
      setTotalAllocationSummary({
        percentage: 0,
        hours: 0,
        count: 0,
        standardHours: 40,
      });
      setLoadingSkills(true);
      setLoadingProjects(true);
      // setLoadingTaxonomy(true); // Taxonomy loading is independent
      setLoadingAllocationSummary(true);
    }
  }, [status, fetchAllUserData]);

  const handleToggleCurrentSkill = useCallback((skillId) => {
    setSelectedCurrentSkillsMap((prevMap) => {
      const newMap = new Map(prevMap);
      const key = skillId.toString();
      if (newMap.has(key)) {
        newMap.delete(key);
      } else {
        newMap.set(key, DEFAULT_PROFICIENCY);
      }
      return newMap;
    });
  }, []);

  const handleSetProficiency = useCallback((skillId, proficiency) => {
    setSelectedCurrentSkillsMap((prevMap) => {
      const newMap = new Map(prevMap);
      const key = skillId.toString();
      if (newMap.has(key)) {
        newMap.set(key, proficiency);
      }
      return newMap;
    });
  }, []);

  const handleToggleDesiredSkill = useCallback((skillId) => {
    setSelectedDesiredSkillIds((prev) => {
      const newSet = new Set(prev);
      const value = skillId.toString();
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  }, []);

  const handleSaveSkills = useCallback(
    async (type) => {
      setIsSaving(true);
      setSaveError(null);
      let payload = {};

      if (type === "current") {
        payload.currentSkills = Array.from(
          selectedCurrentSkillsMap.entries()
        ).map(([skillId, proficiency]) => ({ skillId, proficiency }));
      } else if (type === "desired") {
        payload.desiredSkillIds = Array.from(selectedDesiredSkillIds);
      } else {
        setIsSaving(false);
        return;
      }

      // Consider if an empty payload should still be sent to clear skills
      // if (
      //   (type === "current" && payload.currentSkills.length === 0 && currentSkills.length === 0) ||
      //   (type === "desired" && payload.desiredSkillIds.length === 0 && desiredSkills.length === 0)
      // ) {
      //   setIsSaving(false);
      //   return; // Or proceed to allow clearing skills
      // }

      try {
        const response = await fetch("/api/userskills", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
              `Failed to save ${type} skills. Status: ${response.status}`
          );
        }
        const userSkillsData = result.data || [];
        const current = userSkillsData.filter((s) => s.isCurrent);
        const desired = userSkillsData.filter((s) => s.isDesired);
        setCurrentSkills(current);
        setDesiredSkills(desired);
        setSelectedCurrentSkillsMap(
          new Map(
            current.map((s) => [s.skillId?._id.toString(), s.proficiency])
          )
        );
        setSelectedDesiredSkillIds(
          new Set(desired.map((s) => s.skillId?._id.toString()))
        );
        if (type === "current") setIsEditingCurrentSkills(false);
        if (type === "desired") setIsEditingDesiredSkills(false);
      } catch (err) {
        setSaveError(
          err.message ||
            `An unexpected error occurred while saving ${type} skills.`
        );
      } finally {
        setIsSaving(false);
      }
    },
    [
      selectedCurrentSkillsMap,
      selectedDesiredSkillIds,
      currentSkills,
      desiredSkills,
    ] // Added currentSkills & desiredSkills
  );

  const handleCancelEditCurrent = useCallback(() => {
    setIsEditingCurrentSkills(false);
    setSelectedCurrentSkillsMap(
      new Map(
        currentSkills.map((s) => [s.skillId?._id.toString(), s.proficiency])
      )
    );
    setSaveError(null);
  }, [currentSkills]);

  const handleCancelEditDesired = useCallback(() => {
    setIsEditingDesiredSkills(false);
    setSelectedDesiredSkillIds(
      new Set(desiredSkills.map((s) => s.skillId?._id.toString()))
    );
    setSaveError(null);
  }, [desiredSkills]);

  const toggleCurrentSkillCategory = useCallback((category) => {
    setExpandedCurrentSkillCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  const toggleDesiredSkillCategory = useCallback((category) => {
    setExpandedDesiredSkillCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  return {
    session,
    status,
    currentSkills,
    desiredSkills,
    projects,
    allSkillsTaxonomy,
    groupedSkillsTaxonomy,
    expandedCurrentSkillCategories,
    expandedDesiredSkillCategories,
    toggleCurrentSkillCategory,
    toggleDesiredSkillCategory,
    isEditingCurrentSkills,
    setIsEditingCurrentSkills,
    isEditingDesiredSkills,
    setIsEditingDesiredSkills,
    selectedCurrentSkillsMap,
    selectedDesiredSkillIds,
    loadingSkills,
    loadingProjects,
    loadingTaxonomy,
    skillsError,
    projectsError,
    isSaving,
    saveError,
    setSaveError,
    handleToggleCurrentSkill,
    handleSetProficiency,
    handleToggleDesiredSkill,
    handleSaveSkills,
    handleCancelEditCurrent,
    handleCancelEditDesired,
    totalAllocationSummary,
    loadingAllocationSummary,
    allocationSummaryError,
  };
};
