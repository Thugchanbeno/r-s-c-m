import { useState, useEffect, useCallback, useMemo } from "react";

export const useSkillSelector = (
  initialSelectedSkills = [],
  nlpSuggestedSkills = [],
  onChange
) => {
  const [allSkills, setAllSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [errorSkills, setErrorSkills] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkillsMap, setSelectedSkillsMap] = useState(new Map());
  const [expandedCategories, setExpandedCategories] = useState({});

  const fetchAllSkillsFromAPI = useCallback(async () => {
    setLoadingSkills(true);
    setErrorSkills(null);
    try {
      const response = await fetch("/api/skills");
      if (!response.ok) throw new Error("Failed to fetch skills taxonomy");
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setAllSkills(result.data);
        const initialExpanded = result.data.reduce((acc, skill) => {
          const category = skill.category || "Uncategorized";
          if (acc[category] === undefined) acc[category] = false;
          return acc;
        }, {});
        setExpandedCategories(initialExpanded);
      } else {
        throw new Error(result.error || "Invalid skills data format");
      }
    } catch (err) {
      setErrorSkills(err.message);
    } finally {
      setLoadingSkills(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSkillsFromAPI();
  }, [fetchAllSkillsFromAPI]);

  useEffect(() => {
    const newMap = new Map();
    initialSelectedSkills.forEach((skill) => {
      if (
        skill.skillId &&
        skill.skillName &&
        skill.proficiencyLevel !== undefined &&
        skill.isRequired !== undefined
      ) {
        newMap.set(skill.skillId, { ...skill });
      }
    });
    setSelectedSkillsMap(newMap);
  }, [initialSelectedSkills]);

  const handleToggleSkill = useCallback(
    (skillFromApi) => {
      const newMap = new Map(selectedSkillsMap);
      if (newMap.has(skillFromApi._id)) {
        newMap.delete(skillFromApi._id);
      } else {
        newMap.set(skillFromApi._id, {
          skillId: skillFromApi._id,
          skillName: skillFromApi.name,
          category: skillFromApi.category,
          proficiencyLevel: 3,
          isRequired: true,
        });
      }
      setSelectedSkillsMap(newMap);
      if (onChange) {
        onChange(Array.from(newMap.values()));
      }
    },
    [selectedSkillsMap, onChange]
  );

  const handleProficiencyChange = useCallback(
    (skillId, newProficiency) => {
      const newMap = new Map(selectedSkillsMap);
      const skill = newMap.get(skillId);
      if (skill) {
        skill.proficiencyLevel = parseInt(newProficiency, 10);
        setSelectedSkillsMap(newMap);
        if (onChange) {
          onChange(Array.from(newMap.values()));
        }
      }
    },
    [selectedSkillsMap, onChange]
  );

  const handleIsRequiredChange = useCallback(
    (skillId, newIsRequired) => {
      const newMap = new Map(selectedSkillsMap);
      const skill = newMap.get(skillId);
      if (skill) {
        skill.isRequired = newIsRequired;
        setSelectedSkillsMap(newMap);
        if (onChange) {
          onChange(Array.from(newMap.values()));
        }
      }
    },
    [selectedSkillsMap, onChange]
  );

  const toggleCategory = useCallback((category) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  }, []);

  const filteredSkills = useMemo(() => {
    if (!searchTerm) return allSkills;
    return allSkills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (skill.category &&
          skill.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allSkills, searchTerm]);

  const skillsByCategory = useMemo(() => {
    return filteredSkills.reduce((acc, skill) => {
      const category = skill.category || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {});
  }, [filteredSkills]);

  const sortedCategories = useMemo(
    () => Object.keys(skillsByCategory).sort(),
    [skillsByCategory]
  );

  return {
    allSkills,
    loadingSkills,
    errorSkills,
    searchTerm,
    setSearchTerm,
    selectedSkillsMap,
    expandedCategories,
    handleToggleSkill,
    handleProficiencyChange,
    handleIsRequiredChange,
    toggleCategory,
    skillsByCategory,
    sortedCategories,
  };
};
