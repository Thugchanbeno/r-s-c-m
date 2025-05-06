import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const DEFAULT_PROFICIENCY = 3;

export const useProfileData = () => {
  const { data: session, status } = useSession();

  const [currentSkills, setCurrentSkills] = useState([]);
  const [desiredSkills, setDesiredSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allSkillsTaxonomy, setAllSkillsTaxonomy] = useState([]);

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

  // Fetch Skill Taxonomy
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
        // Optionally set a specific taxonomy error state here
      } finally {
        setLoadingTaxonomy(false);
      }
    };
    fetchTaxonomy();
  }, []);

  // Fetch User Data (Skills & Projects)
  const fetchUserData = useCallback(async () => {
    // Ensure session exists before trying to use its properties
    if (!session?.user?.id) {
      console.warn(
        "fetchUserData called without authenticated session or user ID."
      );
      // Optionally set errors or return early if session is required but missing
      setLoadingSkills(false);
      setLoadingProjects(false);
      return;
    }
    const userId = session.user.id;
    setLoadingSkills(true);
    setLoadingProjects(true);
    setSkillsError(null);
    setProjectsError(null);

    // Fetch Skills
    try {
      const skillsResponse = await fetch(`/api/userskills`); // Assumes API gets user from session
      if (!skillsResponse.ok)
        throw new Error(
          `HTTP error fetching skills! status: ${skillsResponse.status}`
        );
      const skillsResult = await skillsResponse.json();

      if (skillsResult.success && Array.isArray(skillsResult.data)) {
        const userSkillsData = skillsResult.data;
        const current = userSkillsData.filter((s) => s.isCurrent);
        const desired = userSkillsData.filter((s) => s.isDesired);

        setCurrentSkills(current);
        setDesiredSkills(desired);
        // Initialize editing states based on fetched data
        setSelectedCurrentSkillsMap(
          new Map(
            current.map((s) => [s.skillId?._id.toString(), s.proficiency])
          ) // Use toString() for keys
        );
        setSelectedDesiredSkillIds(
          new Set(desired.map((s) => s.skillId?._id.toString())) // Use toString() for Set values
        );
        setSkillsError(null);
      } else {
        throw new Error(skillsResult.error || "Invalid skills data format");
      }
    } catch (error) {
      console.error("Error fetching user skills:", error);
      setSkillsError(error.message || "Could not load skills.");
    } finally {
      setLoadingSkills(false);
    }

    // Fetch Projects/Allocations
    try {
      // Pass userId as query param if needed by the backend
      const projectsResponse = await fetch(`/api/allocations?userId=${userId}`);
      if (!projectsResponse.ok) {
        throw new Error(
          `error fetching allocations status: ${projectsResponse.status}`
        );
      }
      const projectsResult = await projectsResponse.json();
      // Ensure correct property name 'data' is used
      if (projectsResult.success && Array.isArray(projectsResult.data)) {
        const allocationsData = projectsResult.data;
        setProjects(allocationsData);
        setProjectsError(null);
      } else {
        throw new Error(
          projectsResult.error || "invalid allocations data format."
        );
      }
    } catch (error) {
      console.error("Error fetching user projects:", error);
      setProjectsError(error.message || "Could not load projects.");
    } finally {
      setLoadingProjects(false);
    }
  }, [session?.user?.id]); // Add session.user.id as dependency

  // Effect to trigger fetch when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData();
    }
    // Clear data on logout
    if (status === "unauthenticated") {
      setCurrentSkills([]);
      setDesiredSkills([]);
      setProjects([]);
      setSelectedCurrentSkillsMap(new Map());
      setSelectedDesiredSkillIds(new Set());
      setSkillsError(null);
      setProjectsError(null);
      setSaveError(null);
      setIsEditingCurrentSkills(false);
      setIsEditingDesiredSkills(false);
      // Reset loading states if needed
      setLoadingSkills(true);
      setLoadingProjects(true);
      setLoadingTaxonomy(true);
    }
  }, [status, fetchUserData]);

  // Skill Editing Handlers
  const handleToggleCurrentSkill = useCallback((skillId) => {
    setSelectedCurrentSkillsMap((prevMap) => {
      const newMap = new Map(prevMap);
      const key = skillId.toString(); // Ensure key is string
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
      const key = skillId.toString(); // Ensure key is string
      if (newMap.has(key)) {
        newMap.set(key, proficiency);
      }
      return newMap;
    });
  }, []);

  const handleToggleDesiredSkill = useCallback((skillId) => {
    setSelectedDesiredSkillIds((prev) => {
      const newSet = new Set(prev);
      const value = skillId.toString(); // Ensure value is string
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  }, []);

  // Save Handler
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
        console.error("Invalid type for handleSaveSkills");
        setIsSaving(false);
        return;
      }

      // Prevent sending empty payloads if desired (though backend might handle it)
      if (
        type === "current" &&
        payload.currentSkills.length === 0 &&
        type === "desired" &&
        payload.desiredSkillIds.length === 0 &&
        !body.currentSkills &&
        !body.desiredSkillIds
      ) {
        // Check if original body also empty
        console.warn(
          "handleSaveSkills: Attempting to save empty skill selection. Sending empty update."
        );
        // Decide if you want to abort or send an empty update
        // To abort:
        // setSaveError("Cannot save empty skill selection.");
        // setIsSaving(false);
        // return;
      }

      try {
        const response = await fetch("/api/userskills", {
          // Ensure this path matches your API route folder name
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

        // Success: Update local state from API response
        const userSkillsData = result.data || [];
        const current = userSkillsData.filter((s) => s.isCurrent);
        const desired = userSkillsData.filter((s) => s.isDesired);

        setCurrentSkills(current);
        setDesiredSkills(desired);
        // Reset editing states based on the successfully saved data
        setSelectedCurrentSkillsMap(
          new Map(
            current.map((s) => [s.skillId?._id.toString(), s.proficiency])
          ) // Use toString()
        );
        setSelectedDesiredSkillIds(
          new Set(desired.map((s) => s.skillId?._id.toString())) // Use toString()
        );

        // Close the relevant editing section on success
        if (type === "current") setIsEditingCurrentSkills(false);
        if (type === "desired") setIsEditingDesiredSkills(false);
      } catch (err) {
        console.error(`Error saving ${type} skills:`, err);
        setSaveError(
          err.message ||
            `An unexpected error occurred while saving ${type} skills.`
        );
        // Keep editing mode open on error
      } finally {
        setIsSaving(false);
      }
    },
    [selectedCurrentSkillsMap, selectedDesiredSkillIds, session?.user?.id] // Added session?.user?.id dependency if fetchUserData depends on it indirectly
  );

  // Cancel Handlers
  const handleCancelEditCurrent = useCallback(() => {
    setIsEditingCurrentSkills(false);
    // Reset to the last known saved state
    setSelectedCurrentSkillsMap(
      new Map(
        currentSkills.map((s) => [s.skillId?._id.toString(), s.proficiency])
      ) // Use toString()
    );
    setSaveError(null);
  }, [currentSkills]);

  const handleCancelEditDesired = useCallback(() => {
    setIsEditingDesiredSkills(false);
    // Reset to the last known saved state
    setSelectedDesiredSkillIds(
      new Set(desiredSkills.map((s) => s.skillId?._id.toString())) // Use toString()
    );
    setSaveError(null);
  }, [desiredSkills]);

  // Return all state and handlers needed by the component
  return {
    session,
    status,
    currentSkills,
    desiredSkills,
    projects,
    allSkillsTaxonomy,
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
  };
};
