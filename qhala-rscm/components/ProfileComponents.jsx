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
  getAllocationPercentageColor,
} from "@/components/common/skillcolors";
import { fadeIn, staggerChildren } from "@/lib/animations";
import { formatDateRange } from "@/lib/utils";

// Profile Header Component
export const ProfileHeader = ({ title, description }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeIn}
    className="mb-8 relative"
  >
    <div className="absolute inset-0 rounded-[var(--radius)] -z-10" />
    <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">
      {title}
    </h1>
    <p className="text-[rgb(var(--muted-foreground))] mt-1 text-base">
      {description}
    </p>
  </motion.div>
);

// User Info Component
export const UserInfo = ({
  user,
  totalAllocation,
  loadingAllocationSummary,
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeIn}
    className="flex flex-col sm:flex-row items-start sm:items-center bg-gradient-to-r from-[rgb(var(--primary-accent-background))] to-purple-50 rounded-[var(--radius)] p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
  >
    <div className="relative">
      <Image
        src={user.image || "/images/default-avatar.png"}
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
          className="capitalize px-3 py-2 text-xs font-medium"
        >
          {user.role || "N/A"}
        </Badge>
        {user.department && (
          <Badge
            variant="secondary"
            className="capitalize px-3 py-2 text-xs font-medium"
          >
            {user.department}
          </Badge>
        )}
      </div>
      {loadingAllocationSummary ? (
        <div className="flex items-center text-xs text-[rgb(var(--muted-foreground))]">
          <LoadingSpinner size={12} className="mr-2" /> Loading allocation...
        </div>
      ) : totalAllocation && totalAllocation.percentage !== undefined ? (
        <div className="flex items-center text-sm">
          <Activity size={16} className="mr-2 text-[rgb(var(--primary))]" />
          <span className="text-[rgb(var(--muted-foreground))] mr-1 py-1">
            Current Capacity:
          </span>
          <Badge
            size="sm"
            pill={true}
            className={getAllocationPercentageColor(totalAllocation.percentage)}
          >
            {totalAllocation.percentage}%
          </Badge>
          <span className="text-xs text-[rgb(var(--muted-foreground))] ml-2">
            ({totalAllocation.hours}h / {totalAllocation.standardHours}h week)
          </span>
        </div>
      ) : (
        <div className="text-xs text-[rgb(var(--muted-foreground))]">
          Allocation data not available.
        </div>
      )}
    </div>
  </motion.div>
);
// Error Message Component
export const ErrorMessage = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="p-4 bg-red-50 border border-red-200 rounded-[var(--radius)] text-sm text-red-700 flex items-center shadow-sm"
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
    className="flex items-center justify-between mb-4 pb-3 border-b border-[rgb(var(--border))]"
  >
    <h3 className="font-semibold text-lg text-[rgb(var(--foreground))]">
      {title}
    </h3>
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
          className="text-red-600 hover:bg-red-50 transition-colors duration-200"
        >
          <X size={16} className="mr-2" /> Cancel
        </Button>
      </div>
    )}
  </motion.div>
);

// Current Skills Editor Component
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
    <motion.div className="space-y-3 p-4 md:p-6 border border-[rgb(var(--border))] rounded-[var(--radius)] bg-slate-200 shadow-sm">
      {loadingTaxonomy ? (
        <LoadingSpinner size={20} className="mx-auto my-4" />
      ) : categories.length === 0 ? (
        <p className="text-sm text-[rgb(var(--muted-foreground))] text-center py-4">
          No skills available to select.
        </p>
      ) : (
        categories.map((category) => (
          <motion.div
            key={category}
            variants={fadeIn}
            className="border border-[rgb(var(--border))] rounded-[var(--radius)] overflow-hidden bg-[rgb(var(--background))]"
          >
            <button
              onClick={() => toggleCategory(category)}
              className="flex items-center justify-between w-full p-3 text-left bg-[rgb(var(--muted))] hover:bg-[rgba(var(--muted-rgb),0.8)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))]"
              aria-expanded={expandedCategories[category]}
              aria-controls={`category-skills-current-${category}`}
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
                  id={`category-skills-current-${category}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="p-3 space-y-3"
                >
                  {groupedSkillsTaxonomy[category].map((skill) => {
                    const isSelected = selectedCurrentSkillsMap.has(skill._id);
                    const currentProficiency = isSelected
                      ? selectedCurrentSkillsMap.get(skill._id)
                      : null;
                    return (
                      <motion.div
                        key={skill._id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2 rounded-[var(--radius)] bg-transparent hover:bg-slate-100 transition-colors duration-200"
                      >
                        <Badge
                          variant={isSelected ? "primary" : "outline"}
                          className="cursor-pointer px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105"
                          onClick={() => handleToggleCurrentSkill(skill._id)}
                        >
                          {skill.name}
                        </Badge>

                        {isSelected && (
                          <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <span className="text-xs text-[rgb(var(--foreground))]">
                              Proficiency:
                            </span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() =>
                                    handleSetProficiency(skill._id, level)
                                  }
                                  disabled={isSaving}
                                  className={`w-6 h-6 rounded-[var(--radius)] text-xs font-medium flex items-center justify-center border-2 transition-all duration-200 ${
                                    currentProficiency === level
                                      ? "bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] border-[rgb(var(--primary))] scale-105"
                                      : "bg-[rgb(var(--background))] hover:bg-slate-200 border-[rgb(var(--border))]"
                                  }`}
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
                    <p className="text-xs text-[rgb(var(--muted-foreground))] text-center py-2">
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
    className="flex flex-wrap gap-2 p-4"
  >
    {currentSkills.length > 0 ? (
      currentSkills.map((userSkill) => (
        <motion.div key={userSkill._id} variants={fadeIn}>
          <Badge
            className={`px-3 py-1.5 text-xs font-medium ${getSkillLevelColor(
              userSkill.proficiency
            )}`}
          >
            {userSkill.skillId?.name || "Unknown"}
            {userSkill.proficiency != null && (
              <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">
                Level {userSkill.proficiency}
              </span>
            )}
          </Badge>
        </motion.div>
      ))
    ) : (
      <p className="text-[rgb(var(--muted-foreground))] italic text-sm">
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
}) => {
  const categories = Object.keys(groupedSkillsTaxonomy).sort();

  return (
    <motion.div className="space-y-3 p-4 md:p-6 border border-[rgb(var(--border))] rounded-[var(--radius)] bg-slate-200 shadow-sm">
      {loadingTaxonomy ? (
        <LoadingSpinner size={20} className="mx-auto my-4" />
      ) : categories.length === 0 ? (
        <p className="text-sm text-[rgb(var(--muted-foreground))] text-center py-4">
          No skills available to select.
        </p>
      ) : (
        categories.map((category) => (
          <motion.div
            key={category}
            variants={fadeIn}
            className="border border-[rgb(var(--border))] rounded-[var(--radius)] overflow-hidden bg-[rgb(var(--background))]"
          >
            <button
              onClick={() => toggleCategory(category)}
              className="flex items-center justify-between w-full p-3 text-left bg-[rgb(var(--muted))] hover:bg-[rgba(var(--muted-rgb),0.8)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))]"
              aria-expanded={expandedCategories[category]}
              aria-controls={`category-skills-desired-${category}`}
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
                  id={`category-skills-desired-${category}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="p-3 flex flex-wrap gap-3"
                >
                  {groupedSkillsTaxonomy[category].map((skill) => (
                    <motion.div key={skill._id}>
                      <Badge
                        variant={
                          selectedDesiredSkillIds.has(skill._id)
                            ? "secondary"
                            : "outline"
                        }
                        className="cursor-pointer px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105"
                        onClick={() => handleToggleDesiredSkill(skill._id)}
                      >
                        {skill.name}
                      </Badge>
                    </motion.div>
                  ))}
                  {groupedSkillsTaxonomy[category].length === 0 && (
                    <p className="text-xs text-[rgb(var(--muted-foreground))] text-center py-2 w-full">
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

// Desired Skills Display Component
export const DesiredSkillsDisplay = ({ desiredSkills }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={staggerChildren}
    className="flex flex-wrap gap-3 p-4"
  >
    {desiredSkills.length > 0 ? (
      desiredSkills.map((userSkill) => (
        <motion.div key={userSkill._id} variants={fadeIn}>
          <Badge
            variant="secondary"
            className="px-3 py-1.5 text-xs font-medium"
          >
            {userSkill.skillId?.name || "Unknown"}
          </Badge>
        </motion.div>
      ))
    ) : (
      <p className="text-[rgb(var(--muted-foreground))] italic text-sm">
        No desired skills added yet.
      </p>
    )}
  </motion.div>
);

// Projects List Component
export const ProjectsList = ({ projects, projectsError, loadingProjects }) => (
  <motion.div initial="hidden" animate="visible" variants={fadeIn}>
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[rgb(var(--primary-accent-background))] to-purple-50">
        <CardTitle className="flex items-center text-[rgb(var(--card-foreground))]">
          <Briefcase size={20} className="mr-3" /> My Projects & Allocations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {loadingProjects ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size={24} />
          </div>
        ) : projectsError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-[var(--radius)]">
            <p className="text-red-600 text-sm font-medium">{projectsError}</p>
          </div>
        ) : (
          <motion.div variants={staggerChildren} className="space-y-4">
            {projects.length > 0 ? (
              projects.map((allocation) => (
                <motion.div
                  key={allocation._id}
                  variants={fadeIn}
                  className="p-4 rounded-[var(--radius)] border border-[rgb(var(--border))] hover:shadow-md transition-shadow duration-200 bg-[rgb(var(--background))] hover:bg-[rgb(var(--muted))]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      href={`/projects/${allocation.projectId?._id}`}
                      className="font-semibold text-base text-[rgb(var(--primary))] hover:underline"
                    >
                      {allocation.projectId?.name || "Unknown Project"}
                    </Link>
                    <Badge
                      size="sm"
                      pill={true}
                      className={getAllocationPercentageColor(
                        allocation.allocationPercentage
                      )}
                    >
                      {allocation.allocationPercentage}% Allocated
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-[rgb(var(--muted-foreground))]">
                    <div className="flex items-center">
                      <UserCog
                        size={14}
                        className="mr-2 text-[rgb(var(--primary))]"
                      />
                      <span>
                        Role:{" "}
                        <span className="font-medium text-[rgb(var(--foreground))]">
                          {allocation.role || "N/A"}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CalendarDays
                        size={14}
                        className="mr-2 text-[rgb(var(--primary))]"
                      />
                      <span>
                        Duration:{" "}
                        <span className="font-medium text-[rgb(var(--foreground))]">
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
              <p className="text-[rgb(var(--muted-foreground))] italic text-sm text-center py-4">
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
