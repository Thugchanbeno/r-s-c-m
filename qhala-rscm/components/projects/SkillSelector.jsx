"use client";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Badge from "@/components/common/Badge";
import {
  getSkillLevelColor,
  getSkillLevelName,
  darkItemStyles,
  darkItemSelectedStyles,
  proficiencySelectedStyles,
} from "@/components/common/CustomColors";
import {
  Check,
  PlusCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSkillSelector } from "@/lib/hooks/useSkillSelector";
import { cn } from "@/lib/utils"; // Ensure cn is imported

const fadeIn = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const SkillSelector = ({
  initialSelectedSkills = [],
  nlpSuggestedSkills = [],
  onChange,
}) => {
  const {
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
  } = useSkillSelector(initialSelectedSkills, nlpSuggestedSkills, onChange);

  const inputClasses =
    "block w-full rounded-md bg-background text-foreground shadow-sm sm:text-sm p-2.5 transition-all duration-200 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background";
  const categoryButtonBase =
    "flex items-center justify-between w-full p-3 text-left transition-colors duration-150 focus:outline-none rounded-md";
  const categoryButtonDefault = "bg-transparent text-primary";
  const categoryButtonExpanded = "bg-muted/60 text-primary";
  const categoryButtonHover =
    "hover:bg-[rgb(var(--accent))] hover:text-[rgb(var(--accent-foreground))]";
  const categoryButtonFocus =
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background";
  const skillItemBase =
    "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-md transition-all duration-150 ease-in-out";
  const skillItemSelectedBg = "bg-primary-accent-background";
  const skillItemHoverBg = "hover:bg-muted/50";
  const skillItemNlpRing =
    "ring-1 ring-[rgb(var(--warning))] ring-offset-1 ring-offset-background";
  const toggleButtonBase =
    "mr-2.5 p-1 rounded-full transition-colors flex-shrink-0";
  const toggleButtonSelected =
    "bg-success text-success-foreground hover:bg-success/90";
  const toggleButtonDeselected =
    "bg-muted hover:bg-muted/80 text-muted-foreground";

  const darkFormControlBase = `${darkItemStyles.base} ${darkItemStyles.hover}`;
  const darkFormCheckboxClasses = `mr-1.5 h-4 w-4 rounded-md border-slate-600 bg-slate-900 text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] focus:ring-offset-slate-900 checked:bg-[rgb(var(--accent))] checked:border-transparent`;

  if (loadingSkills)
    return (
      <div className="p-4 text-center">
        <LoadingSpinner />
        <p className="text-sm text-muted-foreground">Loading skills...</p>
      </div>
    );
  if (errorSkills)
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/15 p-3 text-sm text-destructive">
        Error: {errorSkills}
      </div>
    );

  return (
    <div className="space-y-3 p-1">
      <input
        type="text"
        placeholder="Search skills or categories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={inputClasses}
      />
      {selectedSkillsMap.size > 0 && (
        <div className="space-y-2 rounded-md shadow-sm hover:shadow-md bg-primary-accent-background/50 p-3">
          <h4 className="text-xs font-semibold uppercase text-primary">
            Selected for Project:
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(selectedSkillsMap.values())
              .sort((a, b) => a.skillName.localeCompare(b.skillName))
              .map((sSkill) => {
                const proficiencyName = sSkill.proficiencyLevel
                  ? getSkillLevelName(sSkill.proficiencyLevel)
                  : "";
                return (
                  <Badge
                    key={sSkill.skillId}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md",
                      getSkillLevelColor(sSkill.proficiencyLevel)
                    )}
                    pill={false}
                    size="sm"
                  >
                    <span>
                      {sSkill.skillName}
                      {proficiencyName && (
                        <span className="ml-1 opacity-80">
                          ({proficiencyName})
                        </span>
                      )}
                      {sSkill.isRequired ? (
                        <span className="ml-1 font-bold text-destructive">
                          *
                        </span>
                      ) : (
                        ""
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleSkill({
                          _id: sSkill.skillId,
                          name: sSkill.skillName,
                          category: sSkill.category,
                        })
                      }
                      className="text-current hover:opacity-70"
                      aria-label={`Remove ${sSkill.skillName}`}
                    >
                      <XCircle size={12} />
                    </button>
                  </Badge>
                );
              })}
          </div>
        </div>
      )}
      <div className="max-h-[300px] space-y-1.5 overflow-y-auto pr-1">
        {sortedCategories.length === 0 && !loadingSkills && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No skills match your search or available.
          </p>
        )}
        {sortedCategories.map((category) => (
          <motion.div
            key={category}
            variants={fadeIn}
            className="overflow-hidden rounded-md bg-background group"
          >
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className={cn(
                categoryButtonBase,
                expandedCategories[category]
                  ? categoryButtonExpanded
                  : categoryButtonDefault,
                categoryButtonHover,
                categoryButtonFocus
              )}
              aria-expanded={expandedCategories[category]}
              aria-controls={`category-skills-selector-${category}`}
            >
              <h4 className="text-md font-semibold">{category}</h4>
              {expandedCategories[category] ? (
                <ChevronDown
                  size={20}
                  className="text-muted-foreground group-hover:text-[rgb(var(--accent-foreground))]"
                />
              ) : (
                <ChevronRight
                  size={20}
                  className="text-muted-foreground group-hover:text-[rgb(var(--accent-foreground))]"
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
                  className="space-y-1.5 shadow-sm p-2.5"
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
                          variants={fadeIn}
                          className={cn(
                            skillItemBase,
                            isSelected ? skillItemSelectedBg : skillItemHoverBg,
                            isSuggestedByNlp && !isSelected
                              ? skillItemNlpRing
                              : "border-transparent"
                          )}
                        >
                          <div className="flex flex-grow items-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSkill(skill)}
                              className={cn(
                                toggleButtonBase,
                                isSelected
                                  ? toggleButtonSelected
                                  : toggleButtonDeselected
                              )}
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
                              className={cn(
                                "text-sm",
                                isSelected
                                  ? "font-medium text-primary"
                                  : "text-foreground"
                              )}
                            >
                              {skill.name}
                              {isSuggestedByNlp && !isSelected && (
                                <span className="ml-1.5 text-xs font-normal text-warning">
                                  (Suggested)
                                </span>
                              )}
                            </span>
                          </div>

                          {isSelected && selectedData && (
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-2 pl-8 sm:mt-0 sm:pl-0">
                              <div className="flex items-center">
                                <label
                                  htmlFor={`prof-${skill._id}`}
                                  className="mr-1.5 whitespace-nowrap text-xs text-muted-foreground"
                                >
                                  Proficiency:
                                </label>
                                <select
                                  id={`prof-${skill._id}`}
                                  value={selectedData.proficiencyLevel}
                                  onChange={(e) =>
                                    handleProficiencyChange(
                                      skill._id,
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className={cn(
                                    "text-xs p-1.5 rounded-md appearance-none pr-6",
                                    darkFormControlBase
                                  )}
                                >
                                  {[1, 2, 3, 4, 5].map((lvl) => (
                                    <option key={lvl} value={lvl}>
                                      {getSkillLevelName(lvl)}{" "}
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
                                  className={darkFormCheckboxClasses}
                                />
                                <label
                                  htmlFor={`req-${skill._id}`}
                                  className="text-xs text-muted-foreground"
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
                    <p className="py-2 text-center text-xs text-muted-foreground">
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
