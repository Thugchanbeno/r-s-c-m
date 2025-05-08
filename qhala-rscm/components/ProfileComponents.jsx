import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Edit, Save, X, Briefcase, AlertCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getSkillLevelColor } from "@/components/common/skillcolors";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Profile Header Component
export const ProfileHeader = ({ title, description }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeIn}
    className="mb-8 relative"
  >
    <div className="absolute inset-0 rounded-[var(--radius)] -z-10" />
    {/* Changed from text-3xl to text-2xl */}
    <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">
      {title}
    </h1>
    <p className="text-[rgb(var(--muted-foreground))] mt-1 text-base">
      {" "}
      {/* Ensure consistent base size for description */}
      {description}
    </p>
  </motion.div>
);

// User Info Component
export const UserInfo = ({ user }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeIn} // Assuming fadeIn is defined in this file or imported
    // Applied the gradient background here, replacing bg-[rgb(var(--card))]
    className="flex flex-col sm:flex-row items-start sm:items-center bg-gradient-to-r from-[rgb(var(--primary-accent-background))] to-purple-50 rounded-[var(--radius)] p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
  >
    <div className="relative">
      <Image
        src={user.image || "/images/default-avatar.png"}
        alt={user.name || "User"}
        width={80}
        height={80}
        // The avatar border was border-[rgb(var(--card))] (white).
        // On a very light gradient, this might still look fine.
        // If it clashes, consider border-transparent or a very light gray like border-slate-100.
        className="h-20 w-20 rounded-full object-cover mr-6 mb-3 sm:mb-0 border-4 border-white relative z-10 shadow-sm" // Kept border-white for now, added shadow-sm
      />
    </div>
    <div className="flex-grow">
      <CardTitle className="text-xl mb-1 text-[rgb(var(--foreground))]">
        {" "}
        {/* Ensured foreground color for good contrast */}
        {user.name || "Name not set"}
      </CardTitle>
      <p className="text-[rgb(var(--muted-foreground))] mb-3 text-sm">
        {user.email}
      </p>
      <div className="flex items-center flex-wrap gap-2">
        <Badge
          variant="primary"
          className="capitalize px-3 py-1 text-xs font-medium"
        >
          {user.role || "N/A"}
        </Badge>
        {user.department && (
          <Badge
            variant="secondary"
            className="capitalize px-3 py-1 text-xs font-medium"
          >
            {user.department}
          </Badge>
        )}
      </div>
    </div>
  </motion.div>
);
// Error Message Component (font size seems fine, usually text-sm)
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
    {/* Changed from text-xl to text-lg */}
    <h3 className="font-semibold text-lg text-[rgb(var(--foreground))]">
      {title}
    </h3>
    {/* Button sizes (sm) should be appropriate */}
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

// Current Skills Editor Component (text sizes within seem mostly text-sm or default, likely fine)
export const CurrentSkillsEditor = ({
  allSkillsTaxonomy,
  selectedCurrentSkillsMap,
  handleToggleCurrentSkill,
  handleSetProficiency,
  isSaving,
  loadingTaxonomy,
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={staggerChildren}
    className="space-y-4 p-6 border border-[rgb(var(--border))] rounded-[var(--radius)] bg-slate-200 shadow-sm"
  >
    {loadingTaxonomy ? (
      <LoadingSpinner size={20} className="mx-auto" />
    ) : allSkillsTaxonomy.length === 0 ? (
      <p className="text-sm text-[rgb(var(--muted-foreground))] text-center">
        No skills available to select.
      </p>
    ) : (
      <motion.div className="grid gap-3">
        {allSkillsTaxonomy.map((skill) => {
          const isSelected = selectedCurrentSkillsMap.has(skill._id);
          const currentProficiency = isSelected
            ? selectedCurrentSkillsMap.get(skill._id)
            : null;
          return (
            <motion.div
              key={skill._id}
              variants={fadeIn}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2 rounded-[var(--radius)] bg-transparent hover:bg-slate-300 transition-colors duration-200"
            >
              <Badge
                variant={isSelected ? "primary" : "outline"}
                className="cursor-pointer px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105" // Adjusted badge
              >
                {skill.name}
              </Badge>
              {isSelected && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[rgb(var(--foreground))]">
                    {" "}
                    {/* Proficiency label to text-xs */}
                    Proficiency:
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => handleSetProficiency(skill._id, level)}
                        disabled={isSaving}
                        className={`w-6 h-6 rounded-[var(--radius)] text-xs font-medium flex items-center justify-center border-2 transition-all duration-200 ${
                          // Proficiency buttons to text-xs
                          currentProficiency === level
                            ? "bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] border-[rgb(var(--primary))] scale-105"
                            : "bg-[rgb(var(--background))] hover:bg-slate-100 border-[rgb(var(--border))]"
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
      </motion.div>
    )}
  </motion.div>
);

// Current Skills Display Component (badges are text-sm, seems fine)
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
              // Adjusted badge
              userSkill.proficiency
            )}`}
          >
            {userSkill.skillId?.name || "Unknown"}
            {userSkill.proficiency != null && (
              <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">
                {" "}
                {/* Level indicator even smaller */}
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

// Desired Skills Editor Component (badges are text-sm, seems fine)
export const DesiredSkillsEditor = ({
  allSkillsTaxonomy,
  selectedDesiredSkillIds,
  handleToggleDesiredSkill,
  loadingTaxonomy,
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={staggerChildren}
    className="flex flex-wrap gap-3 p-6 border border-[rgb(var(--border))] rounded-[var(--radius)] bg-slate-200 shadow-sm"
  >
    {loadingTaxonomy ? (
      <LoadingSpinner size={20} className="mx-auto" />
    ) : allSkillsTaxonomy.length === 0 ? (
      <p className="text-sm text-[rgb(var(--muted-foreground))] text-center">
        No skills available to select.
      </p>
    ) : (
      allSkillsTaxonomy.map((skill) => (
        <motion.div key={skill._id} variants={fadeIn}>
          <Badge
            variant={
              selectedDesiredSkillIds.has(skill._id) ? "secondary" : "outline"
            }
            className="cursor-pointer px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105" // Adjusted badge
            onClick={() => handleToggleDesiredSkill(skill._id)}
          >
            {skill.name}
          </Badge>
        </motion.div>
      ))
    )}
  </motion.div>
);

// Desired Skills Display Component (badges are text-sm, seems fine)
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
            className="px-3 py-1.5 text-xs font-medium" // Adjusted badge
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

// Projects List Component (CardTitle is text-xl, project links are font-medium, likely fine)
export const ProjectsList = ({ projects, projectsError, loadingProjects }) => (
  <motion.div initial="hidden" animate="visible" variants={fadeIn}>
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[rgb(var(--primary-accent-background))] to-purple-50">
        {/* CardTitle here is text-xl by default from Card component, which is fine for a major section title within a card */}
        <CardTitle className="flex items-center">
          <Briefcase size={20} className="mr-3" /> My Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
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
                  className="flex items-center justify-between p-3 rounded-[var(--radius)] hover:bg-slate-50 transition-colors duration-200"
                >
                  <Link
                    href={`/projects/${allocation.projectId?._id}`}
                    className="font-medium text-sm text-[rgb(var(--primary))] hover:text-blue-700 transition-colors duration-200" // Project link to text-sm
                  >
                    {allocation.projectId?.name || "Unknown Project"}
                  </Link>
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
