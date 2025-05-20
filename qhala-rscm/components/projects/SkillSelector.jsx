"use client";
import { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Badge from "@/components/common/Badge";
import { getSkillLevelColor } from "@/components/common/skillcolors";
import {
  Check,
  PlusCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants (can be shared or defined locally)
const fadeIn = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const SkillSelector = ({
  initialSelectedSkills = [],
  nlpSuggestedSkills = [],
  onChange,
}) => {
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
        // Initialize categories to be closed by default
        const grouped = result.data.reduce((acc, skill) => {
          const category = skill.category || "Uncategorized";
          if (!acc[category]) acc[category] = false; // false means collapsed
          return acc;
        }, {});
        setExpandedCategories(grouped);
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
    const initialMap = new Map();
    initialSelectedSkills.forEach((skill) => {
      initialMap.set(skill.skillId, { ...skill });
    });
    setSelectedSkillsMap(initialMap);
  }, [initialSelectedSkills]);

  const handleToggleSkill = (skillFromApi) => {
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
    onChange(Array.from(newMap.values()));
  };

  const handleProficiencyChange = (skillId, newProficiency) => {
    const newMap = new Map(selectedSkillsMap);
    if (newMap.has(skillId)) {
      newMap.get(skillId).proficiencyLevel = parseInt(newProficiency, 10);
      setSelectedSkillsMap(newMap);
      onChange(Array.from(newMap.values()));
    }
  };

  const handleIsRequiredChange = (skillId, newIsRequired) => {
    const newMap = new Map(selectedSkillsMap);
    if (newMap.has(skillId)) {
      newMap.get(skillId).isRequired = newIsRequired;
      setSelectedSkillsMap(newMap);
      onChange(Array.from(newMap.values()));
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const filteredSkills = allSkills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (skill.category &&
        skill.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const skillsByCategory = filteredSkills.reduce((acc, skill) => {
    const category = skill.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

  const sortedCategories = Object.keys(skillsByCategory).sort();

  if (loadingSkills)
    return (
      <div className="p-4 text-center">
        <LoadingSpinner />
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          Loading skills...
        </p>
      </div>
    );
  if (errorSkills)
    return <p className="text-red-500 p-4">Error: {errorSkills}</p>;

  return (
    <div className="space-y-4 p-1">
      <input
        type="text"
        placeholder="Search skills or categories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="block w-full rounded-[var(--radius)] border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] shadow-sm focus:border-[rgb(var(--primary))] focus:ring-1 focus:ring-[rgb(var(--primary))] sm:text-sm p-2.5 transition-all duration-200 placeholder:text-[rgb(var(--muted-foreground))]"
      />

      {selectedSkillsMap.size > 0 && (
        <div className="p-3 border border-dashed border-[rgb(var(--primary-accent-border))] rounded-[var(--radius)] bg-[rgb(var(--primary-accent-background))] space-y-2">
          <h4 className="text-xs font-semibold uppercase text-[rgb(var(--primary))]">
            Selected for Project:
          </h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedSkillsMap.values())
              .sort((a, b) => a.skillName.localeCompare(b.skillName))
              .map((sSkill) => (
                <Badge
                  key={sSkill.skillId}
                  className={`${getSkillLevelColor(
                    sSkill.proficiencyLevel
                  )} flex items-center gap-1.5`}
                  pill
                  size="sm"
                >
                  <span>
                    {sSkill.skillName} (L{sSkill.proficiencyLevel})
                    {sSkill.isRequired ? "*" : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleSkill({
                        _id: sSkill.skillId,
                        name: sSkill.skillName,
                      })
                    }
                    className="text-current hover:opacity-70"
                    aria-label={`Remove ${sSkill.skillName}`}
                  >
                    <XCircle size={12} />
                  </button>
                </Badge>
              ))}
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {sortedCategories.length === 0 && !loadingSkills && (
          <p className="text-sm text-center text-[rgb(var(--muted-foreground))] py-4">
            No skills match your search or available.
          </p>
        )}
        {sortedCategories.map((category) => (
          <motion.div
            key={category}
            variants={fadeIn} // Using a simple fadeIn for category block
            className="border border-[rgb(var(--border))] rounded-[var(--radius)] overflow-hidden bg-[rgb(var(--background))]"
          >
            <button
              onClick={() => toggleCategory(category)}
              className="flex items-center justify-between w-full p-3 text-left bg-[rgb(var(--muted))] hover:bg-[rgba(var(--muted-rgb),0.8)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))]"
              aria-expanded={expandedCategories[category]}
              aria-controls={`category-skills-selector-${category}`}
            >
              <h4 className="font-semibold text-md text-[rgb(var(--primary))]">
                {category}
              </h4>
              {expandedCategories[category] ? (
                <ChevronDown
                  size={20}
                  className="text-[rgb(var(--muted-foreground))]"
                />
              ) : (
                <ChevronRight
                  size={20}
                  className="text-[rgb(var(--muted-foreground))]"
                />
              )}
            </button>
            <AnimatePresence>
              {expandedCategories[category] && (
                <motion.div
                  id={`category-skills-selector-${category}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="p-3 space-y-2" // Reduced space-y for denser list
                >
                  {skillsByCategory[category]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((skill) => {
                      const isSelected = selectedSkillsMap.has(skill._id);
                      const selectedData = selectedSkillsMap.get(skill._id);
                      const isSuggestedByNlp = nlpSuggestedSkills.some(
                        (nlpSkill) => nlpSkill.id === skill._id
                      );

                      return (
                        <motion.div
                          key={skill._id}
                          variants={fadeIn} // Simple fadeIn for each skill item
                          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-[var(--radius)] transition-all duration-150 ease-in-out border
                            ${
                              isSelected
                                ? "bg-[rgb(var(--primary-accent-background))] border-[rgb(var(--primary-accent-border))]"
                                : "bg-transparent hover:bg-[rgb(var(--muted))] border-transparent hover:border-[rgb(var(--border))]"
                            }
                            ${
                              isSuggestedByNlp && !isSelected
                                ? "ring-1 ring-amber-500 ring-offset-1 ring-offset-[rgb(var(--background))]"
                                : ""
                            }`}
                        >
                          <div className="flex items-center flex-grow">
                            <button
                              type="button"
                              onClick={() => handleToggleSkill(skill)}
                              className={`mr-2.5 p-1 rounded-full transition-colors flex-shrink-0
                                ${
                                  isSelected
                                    ? "bg-green-500 text-white hover:bg-green-600"
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                                }`}
                              aria-label={
                                isSelected
                                  ? `Deselect ${skill.name}`
                                  : `Select ${skill.name}`
                              }
                            >
                              {isSelected ? (
                                <Check size={14} />
                              ) : (
                                <PlusCircle size={14} />
                              )}
                            </button>
                            <span
                              className={`text-sm ${
                                isSelected
                                  ? "font-medium text-[rgb(var(--primary))]"
                                  : "text-[rgb(var(--foreground))]"
                              }`}
                            >
                              {skill.name}
                              {isSuggestedByNlp && !isSelected && (
                                <span className="ml-1.5 text-xs text-amber-600 font-normal">
                                  (Suggested)
                                </span>
                              )}
                            </span>
                          </div>

                          {isSelected && selectedData && (
                            <div className="flex items-center gap-x-3 gap-y-1 mt-1.5 sm:mt-0 sm:ml-auto flex-wrap pl-8 sm:pl-0">
                              <div className="flex items-center">
                                <label
                                  htmlFor={`prof-${skill._id}`}
                                  className="text-xs text-[rgb(var(--muted-foreground))] mr-1.5 whitespace-nowrap"
                                >
                                  Proficiency:
                                </label>
                                <select
                                  id={`prof-${skill._id}`}
                                  value={selectedData.proficiencyLevel}
                                  onChange={(e) =>
                                    handleProficiencyChange(
                                      skill._id,
                                      e.target.value
                                    )
                                  }
                                  className="text-xs p-1 border border-[rgb(var(--border))] rounded-[var(--radius)] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] focus:ring-1 focus:ring-[rgb(var(--primary))]"
                                >
                                  {[1, 2, 3, 4, 5].map((lvl) => (
                                    <option key={lvl} value={lvl}>
                                      {lvl}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`req-${skill._id}`}
                                  checked={selectedData.isRequired}
                                  onChange={(e) =>
                                    handleIsRequiredChange(
                                      skill._id,
                                      e.target.checked
                                    )
                                  }
                                  className="mr-1 h-3.5 w-3.5 rounded border-[rgb(var(--border))] text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary))]"
                                />
                                <label
                                  htmlFor={`req-${skill._id}`}
                                  className="text-xs text-[rgb(var(--muted-foreground))]"
                                >
                                  Required
                                </label>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  {skillsByCategory[category].length === 0 && (
                    <p className="text-xs text-[rgb(var(--muted-foreground))] text-center py-2">
                      No skills in this category.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SkillSelector;
