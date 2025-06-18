import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Save,
  X,
  Briefcase,
  AlertCircle,
  Percent,
  UserCheck,
  UserCog,
  CalendarDays,
  Activity,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  getSkillLevelColor,
  getSkillLevelName,
  getAllocationPercentageColor,
  darkItemStyles,
  darkItemSelectedStyles,
  proficiencySelectedStyles,
  selectedItemRingStyles,
} from "@/components/common/CustomColors";
import { fadeIn, staggerChildren } from "@/lib/animations";
import { formatDateRange } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

// Profile Header Component
export const ProfileHeader = ({ title, description }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeIn}
    className="mb-8"
  >
    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
    <p className="mt-1 text-base text-muted-foreground">{description}</p>
  </motion.div>
);

// User Info Component
export const UserInfo = ({
  user,
  totalAllocation,
  loadingAllocationSummary,
  //allocationSummaryError
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeIn}
    className={cn(
      "flex flex-col sm:flex-row items-start sm:items-center",
      "rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300",
      "bg-gradient-to-r from-primary-accent-background to-[rgb(var(--card))]/50"
    )}
  >
    <div className="relative">
      <Image
        src={user.image || UserCheck}
        alt={user.name || "User"}
        width={80}
        height={80}
        className="h-20 w-20 rounded-full object-cover mr-6 mb-3 sm:mb-0 border-4 border-white relative z-10 shadow-sm"
      />
    </div>
    <div className="flex-grow">
      <CardTitle className="text-xl mb-1 text-[rgb(var(--foreground))]">
        {user.name || "Name not set"}
      </CardTitle>
      <p className="text-[rgb(var(--muted-foreground))] mb-3 text-sm">
        {user.email}
      </p>
      <div className="flex items-center flex-wrap gap-2">
        <Badge
          variant="primary"
          className="px-3 py-1 text-xs font-medium capitalize"
        >
          {user.role || "N/A"}
        </Badge>
        {user.department && (
          <Badge
            variant="secondary"
            className="px-3 py-1 text-xs font-medium capitalize"
          >
            {user.department}
          </Badge>
        )}
      </div>
      <div className="mt-3">
        {loadingAllocationSummary ? (
          <div className="flex items-center text-xs text-muted-foreground">
            <LoadingSpinner size={12} className="mr-2" /> Loading allocation...
          </div>
        ) : totalAllocation && totalAllocation.percentage !== undefined ? (
          <div className="flex flex-wrap items-center text-sm">
            <Activity size={16} className="mr-2 text-primary" />
            <span className="text-muted-foreground mr-1 py-1">
              Current Capacity:
            </span>
            <Badge
              size="sm"
              pill={true}
              className={getAllocationPercentageColor(
                totalAllocation.percentage
              )}
            >
              {totalAllocation.percentage}%
            </Badge>
            <span className="text-xs text-muted-forground ml-2">
              ({totalAllocation.hours}h / {totalAllocation.standardHours}h week)
            </span>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Allocation data not available.
          </div>
        )}
      </div>
    </div>
  </motion.div>
);
// Error Message Component
export const ErrorMessage = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={cn(
      "flex items-center p-4 rounded-lg text-sm shadow-sm",
      "bg-[rgb(var(--destructive))]/15",
      "text-[rgb(var(--destructive))]",
      "border border-[rgb(var(--destructive))]/40"
    )}
  >
    <AlertCircle size={20} className="mr-3 flex-shrink-0" />
    <span className="font-medium">{message}</span>
  </motion.div>
);

// Section Header Component
export const SectionHeader = ({
  title,
  isEditing,
  onEditClick,
  onSaveClick,
  onCancelClick,
  isSaving,
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeIn}
    className="flex items-center justify-between mb-4 pb-3"
  >
    <h3 className="font-semibold text-lg text-foreground">{title}</h3>
    {!isEditing ? (
      <Button
        variant="ghost"
        size="sm"
        onClick={onEditClick}
        disabled={isSaving}
        className="text-slate-500 hover:bg-slate-100 transition-colors duration-200"
      >
        <Edit size={16} className="mr-2" /> Edit
      </Button>
    ) : (
      <div className="flex gap-2">
        <Button
          variant="success"
          size="sm"
          onClick={onSaveClick}
          disabled={isSaving}
          isLoading={isSaving}
        >
          <Save size={16} className="mr-2" /> Save
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancelClick}
          disabled={isSaving}
          className="text-destructive hover:bg-destructive/10 duration-200"
        >
          <X size={16} className="mr-2" /> Cancel
        </Button>
      </div>
    )}
  </motion.div>
);

// current skills editor
export const CurrentSkillsEditor = ({
  groupedSkillsTaxonomy,
  expandedCategories,
  toggleCategory,
  selectedCurrentSkillsMap,
  handleToggleCurrentSkill,
  handleSetProficiency,
  isSaving,
  loadingTaxonomy,
}) => {
  const categories = Object.keys(groupedSkillsTaxonomy).sort();

  return (
    <motion.div
      className={cn("space-y-3 p-3 md:p-4 rounded-lg", "bg-card shadow-sm ")}
    >
      {loadingTaxonomy ? (
        <LoadingSpinner size={20} className="mx-auto my-4" />
      ) : categories.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No skills available to select.
        </p>
      ) : (
        categories.map((category) => (
          <motion.div
            key={category}
            variants={fadeIn}
            className="rounded-md bg-background group"
          >
            <button
              onClick={() => toggleCategory(category)}
              className={cn(
                "flex w-full items-center justify-between p-3 text-left transition-colors duration-150 focus:outline-none rounded-md",
                expandedCategories[category]
                  ? "bg-muted/60 text-primary"
                  : "bg-transparent text-primary",
                "hover:bg-[rgb(var(--accent))] hover:text-[rgb(var(--accent-foreground))]",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              )}
              aria-expanded={expandedCategories[category]}
              aria-controls={`category-skills-current-${category}`}
            >
              <h4 className="text-md font-semibold">{category}</h4>
              {expandedCategories[category] ? (
                <ChevronDown
                  size={20}
                  className={cn(
                    "text-muted-foreground",
                    "group-hover:text-[rgb(var(--accent-foreground))]"
                  )}
                />
              ) : (
                <ChevronRight
                  size={20}
                  className={cn(
                    "text-muted-foreground",
                    "group-hover:text-[rgb(var(--accent-foreground))]"
                  )}
                />
              )}
            </button>
            <AnimatePresence>
              {expandedCategories[category] && (
                <motion.div
                  id={`category-skills-current-${category}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="space-y-2 p-3 "
                >
                  {groupedSkillsTaxonomy[category].map((skill) => {
                    const isSelected = selectedCurrentSkillsMap.has(skill._id);
                    const currentProficiency = isSelected
                      ? selectedCurrentSkillsMap.get(skill._id)
                      : null;
                    return (
                      <motion.div
                        key={skill._id}
                        className={cn(
                          "flex flex-col items-start justify-between gap-2 rounded-md p-2 transition-all duration-200 sm:flex-row sm:items-center"
                        )}
                      >
                        <Badge
                          className={cn(
                            "cursor-pointer px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 rounded-md border",
                            isSelected
                              ? `${darkItemSelectedStyles.base} ${selectedItemRingStyles}`
                              : `${darkItemStyles.base} ${darkItemStyles.hover}`
                          )}
                          onClick={() => handleToggleCurrentSkill(skill._id)}
                          pill={false}
                          size="md"
                        >
                          {skill.name}
                        </Badge>

                        {isSelected && (
                          <div className="mt-1 flex items-center gap-2 sm:mt-0">
                            <span className="text-xs text-foreground">
                              Proficiency:
                            </span>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() =>
                                    handleSetProficiency(skill._id, level)
                                  }
                                  disabled={isSaving}
                                  className={cn(
                                    "flex h-[26px] w-[26px] items-center justify-center rounded-md border text-xs font-medium transition-all duration-150",
                                    currentProficiency === level
                                      ? `${proficiencySelectedStyles.base} ${selectedItemRingStyles}`
                                      : `${darkItemStyles.base} ${darkItemStyles.hover}`
                                  )}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  {groupedSkillsTaxonomy[category].length === 0 && (
                    <p className="py-2 text-center text-xs text-muted-foreground">
                      No skills in this category.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))
      )}
    </motion.div>
  );
};
// Current Skills Display Component
export const CurrentSkillsDisplay = ({ currentSkills }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={staggerChildren}
    className="flex flex-wrap gap-2"
  >
    {currentSkills.length > 0 ? (
      currentSkills.map((userSkill) => {
        const proficiencyName =
          userSkill.proficiency != null
            ? getSkillLevelName(userSkill.proficiency)
            : "";

        return (
          <motion.div
            key={userSkill.skillId?._id || userSkill._id}
            variants={fadeIn}
          >
            <Badge
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md",
                getSkillLevelColor(userSkill.proficiency)
              )}
              size="md"
            >
              {userSkill.skillId?.name || "Unknown Skill"}
              {proficiencyName && (
                <span className="ml-1.5 opacity-80">({proficiencyName})</span>
              )}
            </Badge>
          </motion.div>
        );
      })
    ) : (
      <p className="italic text-sm text-muted-foreground">
        No current skills added yet.
      </p>
    )}
  </motion.div>
);

// Desired Skills Editor Component
export const DesiredSkillsEditor = ({
  groupedSkillsTaxonomy,
  expandedCategories,
  toggleCategory,
  selectedDesiredSkillIds,
  handleToggleDesiredSkill,
  loadingTaxonomy,
  isSaving,
}) => {
  const categories = Object.keys(groupedSkillsTaxonomy).sort();

  return (
    <motion.div
      className={cn("space-y-3 p-3 md:p-4 rounded-lg", "bg-card shadow-sm ")}
    >
      {loadingTaxonomy ? (
        <LoadingSpinner size={20} className="mx-auto my-4" />
      ) : categories.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No skills available to select.
        </p>
      ) : (
        categories.map((category) => (
          <motion.div
            key={category}
            variants={fadeIn}
            className="rounded-md bg-background group"
          >
            <button
              onClick={() => toggleCategory(category)}
              className={cn(
                "flex w-full items-center justify-between p-3 text-left transition-colors duration-150 focus:outline-none rounded-md",
                expandedCategories[category]
                  ? "bg-muted/60 text-primary"
                  : "bg-transparent text-primary",
                "hover:bg-[rgb(var(--accent))] hover:text-[rgb(var(--accent-foreground))]",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              )}
              aria-expanded={expandedCategories[category]}
              aria-controls={`category-skills-desired-${category}`}
            >
              <h4 className="text-md font-semibold">{category}</h4>
              {expandedCategories[category] ? (
                <ChevronDown
                  size={20}
                  className={cn(
                    "text-muted-foreground",
                    "group-hover:text-[rgb(var(--accent-foreground))]"
                  )}
                />
              ) : (
                <ChevronRight
                  size={20}
                  className={cn(
                    "text-muted-foreground",
                    "group-hover:text-[rgb(var(--accent-foreground))]"
                  )}
                />
              )}
            </button>
            <AnimatePresence>
              {expandedCategories[category] && (
                <motion.div
                  id={`category-skills-desired-${category}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="space-y-2 p-3 "
                >
                  {groupedSkillsTaxonomy[category].map((skill) => {
                    const isSelected = selectedDesiredSkillIds.has(skill._id);
                    return (
                      <motion.div
                        key={skill._id}
                        className={cn(
                          "flex items-center rounded-md p-0.5 transition-all duration-200"
                        )}
                      >
                        <Badge
                          className={cn(
                            "w-full cursor-pointer px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 rounded-md border",
                            isSelected
                              ? `${darkItemSelectedStyles.base} ${selectedItemRingStyles}`
                              : `${darkItemStyles.base} ${darkItemStyles.hover}`
                          )}
                          onClick={() => handleToggleDesiredSkill(skill._id)}
                          pill={false}
                          size="md"
                        >
                          {skill.name}
                        </Badge>
                      </motion.div>
                    );
                  })}
                  {groupedSkillsTaxonomy[category].length === 0 && (
                    <p className="py-2 text-center text-xs text-muted-foreground">
                      No skills in this category.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))
      )}
    </motion.div>
  );
};

//Desired skills display
export const DesiredSkillsDisplay = ({ desiredSkills }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={staggerChildren}
    className="flex flex-wrap gap-2"
  >
    {desiredSkills.length > 0 ? (
      desiredSkills.map((userSkill) => (
        <motion.div
          key={userSkill.skillId?._id || userSkill._id}
          variants={fadeIn}
        >
          <Badge
            variant="secondary"
            className="px-3 py-1.5 text-xs font-medium rounded-md"
            pill={false}
            size="md"
          >
            {userSkill.skillId?.name || "Unknown Skill"}
          </Badge>
        </motion.div>
      ))
    ) : (
      <p className="italic text-sm text-muted-foreground">
        No desired skills added yet.
      </p>
    )}
  </motion.div>
);

//projects allocation list
export const ProjectsList = ({ projects, projectsError, loadingProjects }) => (
  <motion.div initial="hidden" animate="visible" variants={fadeIn}>
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center text-card-foreground">
          <Briefcase size={20} className="mr-3 text-primary" />
          My Projects & Allocations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {loadingProjects ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size={24} />
          </div>
        ) : projectsError ? (
          <div
            className={cn(
              "p-4 rounded-lg text-sm shadow-sm",
              "bg-[rgb(var(--destructive))/0.15]",
              "text-[rgb(var(--destructive))]",
              "border border-[rgb(var(--destructive))/0.4]"
            )}
          >
            <p className="font-medium">{projectsError}</p>
          </div>
        ) : (
          <motion.div variants={staggerChildren} className="space-y-4">
            {projects.length > 0 ? (
              projects.map((allocation) => (
                <motion.div
                  key={allocation._id}
                  variants={fadeIn}
                  className={cn(
                    "p-4 rounded-lg  transition-shadow duration-200",
                    "bg-background hover:bg-muted",
                    "shadow-sm hover:shadow-md"
                  )}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <Link
                      href={`/projects/${allocation.projectId?._id}`}
                      className="text-base font-semibold text-primary hover:underline"
                    >
                      {allocation.projectId?.name || "Unknown Project"}
                    </Link>
                    <Badge
                      size="sm"
                      pill={false}
                      className={getAllocationPercentageColor(
                        allocation.allocationPercentage
                      )}
                    >
                      {allocation.allocationPercentage}% Allocated
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <UserCog size={14} className="mr-2 text-primary" />
                      <span>
                        Role:{" "}
                        <span className="font-medium text-foreground">
                          {allocation.role || "N/A"}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CalendarDays size={14} className="mr-2 text-primary" />
                      <span>
                        Duration:{" "}
                        <span className="font-medium text-foreground">
                          {formatDateRange(
                            allocation.startDate,
                            allocation.endDate
                          )}
                        </span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="py-4 text-center text-sm italic text-muted-foreground">
                No projects assigned yet.
              </p>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default {
  ProfileHeader,
  UserInfo,
  ErrorMessage,
  SectionHeader,
  CurrentSkillsEditor,
  CurrentSkillsDisplay,
  DesiredSkillsEditor,
  DesiredSkillsDisplay,
  ProjectsList,
};
