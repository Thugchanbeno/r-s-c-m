// lib/hooks/useSkills.js
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/hooks/useAuth";

// Helper for chart processing (part of the analytics page)
const processSkillDataForChart = (rawData, selectedCategory) => {
  if (!rawData || !Array.isArray(rawData)) {
    return { labels: [], datasets: [], categories: ["All"], aggregated: false };
  }

  let labels = [];
  let currentUserData = [];
  let desiredUserData = [];
  const allCategories = [
    ...new Set(rawData.map((c) => c.category).filter(Boolean)),
  ].sort();
  const categoriesForFilter = ["All", ...allCategories];

  const filteredData =
    selectedCategory === "All"
      ? rawData
      : rawData.filter((c) => c.category === selectedCategory);

  let aggregateByCategory = false;
  if (selectedCategory === "All") {
    const totalSkills = rawData.reduce(
      (acc, cat) => acc + (cat.skills?.length || 0),
      0
    );
    if (totalSkills > 25) {
      aggregateByCategory = true;
    }
  }

  if (aggregateByCategory) {
    rawData.forEach((categoryObj) => {
      if (!categoryObj.category) return;
      labels.push(categoryObj.category);
      let catCurrent = 0;
      let catDesired = 0;
      categoryObj.skills?.forEach((skill) => {
        catCurrent += skill.currentUserCount || 0;
        catDesired += skill.desiredUserCount || 0;
      });
      currentUserData.push(catCurrent);
      desiredUserData.push(catDesired);
    });
  } else {
    filteredData.forEach((categoryObj) => {
      categoryObj.skills?.forEach((skill) => {
        const labelSuffix =
          selectedCategory === "All" && categoryObj.category
            ? ` (${categoryObj.category.substring(0, 3)})`
            : "";
        labels.push(`${skill.name}${labelSuffix}`);
        currentUserData.push(skill.currentUserCount || 0);
        desiredUserData.push(skill.desiredUserCount || 0);
      });
    });
  }

  return {
    labels,
    datasets: [
      {
        label: "Users with Skill",
        data: currentUserData,
        backgroundColor: "rgba(var(--primary-rgb), 0.6)",
        borderColor: "rgb(var(--primary-rgb))",
        borderWidth: 1,
      },
      {
        label: "Users Desiring Skill",
        data: desiredUserData,
        backgroundColor: "rgba(var(--secondary-rgb), 0.6)",
        borderColor: "rgb(var(--secondary-rgb))",
        borderWidth: 1,
      },
    ],
    categories: categoriesForFilter,
    aggregated: aggregateByCategory,
  };
};

export const useSkills = (
  initialSelectedSkills = [],
  nlpSuggestedSkills = [],
  onChange
) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkillsMap, setSelectedSkillsMap] = useState(new Map());
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");

  const allSkills = useQuery(api.skills.getAll, {});

  const skillDistribution = useQuery(
    api.skills.getDistribution,
    user?.email ? { email: user.email } : "skip"
  );

  const loadingSkills = allSkills === undefined;
  const loadingDistribution = skillDistribution === undefined;

  // Initialize selected skills
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

  // Initialize expanded categories when skills load
  useEffect(() => {
    if (allSkills && Array.isArray(allSkills)) {
      const initialExpanded = allSkills.reduce((acc, skill) => {
        const category = skill.category || "Uncategorized";
        if (acc[category] === undefined) acc[category] = false;
        return acc;
      }, {});
      setExpandedCategories(initialExpanded);
    }
  }, [allSkills]);

  //  Selection handlers
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

  // Filtering
  const filteredSkills = useMemo(() => {
    if (!searchTerm) return allSkills || [];
    return (allSkills || []).filter(
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

  // Chart data processing
  const chartData = useMemo(() => {
    if (!skillDistribution) return null;
    return processSkillDataForChart(skillDistribution, selectedCategory);
  }, [skillDistribution, selectedCategory]);

  const isAggregated = chartData?.aggregated || false;
  const categories = chartData?.categories || ["All"];

  return {
    // Skills data
    allSkills: allSkills || [],
    loadingSkills,
    errorSkills: null,

    // Skill selector functionality
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

    // Distribution functionality
    chartData,
    loading: loadingDistribution,
    error: null,
    selectedCategory,
    setSelectedCategory,
    isAggregated,
    categories,
  };
};

export const useSkillSelector = (
  initialSelectedSkills = [],
  nlpSuggestedSkills = [],
  onChange
) => {
  return useSkills(initialSelectedSkills, nlpSuggestedSkills, onChange);
};

export function useSkillDistribution() {
  const hook = useSkills();
  return {
    chartData: hook.chartData,
    loading: hook.loading,
    error: hook.error,
    selectedCategory: hook.selectedCategory,
    setSelectedCategory: hook.setSelectedCategory,
    isAggregated: hook.isAggregated,
    categories: hook.categories,
  };
}
