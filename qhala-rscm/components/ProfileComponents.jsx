import Image from "next/image";
import Link from "next/link";
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

// Profile Header Component
export const ProfileHeader = ({ title, description }) => (
  <div className="mb-6">
    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
      {title}
    </h1>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

// User Info Component
export const UserInfo = ({ user }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center">
    <Image
      src={user.image || "/images/default-avatar.png"}
      alt={user.name || "User"}
      width={80}
      height={80}
      className="h-20 w-20 rounded-full object-cover mr-4 mb-3 sm:mb-0 border-2 border-indigo-600 dark:border-indigo-500"
    />
    <div className="flex-grow">
      <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
        {user.name || "Name not set"}
      </CardTitle>
      <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
      <div className="flex items-center mt-1 flex-wrap gap-2">
        <Badge variant="primary" className="capitalize">
          {user.role || "N/A"}
        </Badge>
        {user.department && (
          <Badge variant="secondary">{user.department}</Badge>
        )}
      </div>
    </div>
  </div>
);

// Error Message Component
export const ErrorMessage = ({ message }) => (
  <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300 flex items-center">
    <AlertCircle size={18} className="mr-2 flex-shrink-0" />
    <span>{message}</span>
  </div>
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
  <div className="flex items-center justify-between">
    <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200">
      {title}
    </h3>
    {!isEditing ? (
      <Button
        variant="ghost"
        size="sm"
        onClick={onEditClick}
        disabled={isSaving}
      >
        <Edit size={16} className="mr-1" /> Edit
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
          <Save size={16} className="mr-1" /> Save
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancelClick}
          disabled={isSaving}
        >
          <X size={16} className="mr-1" /> Cancel
        </Button>
      </div>
    )}
  </div>
);

// Current Skills Editor Component
export const CurrentSkillsEditor = ({
  allSkillsTaxonomy,
  selectedCurrentSkillsMap,
  handleToggleCurrentSkill,
  handleSetProficiency,
  isSaving,
  loadingTaxonomy,
}) => (
  <div className="space-y-4 p-3 border rounded bg-gray-50/50 dark:bg-gray-800/30 dark:border-gray-700">
    {loadingTaxonomy ? (
      <LoadingSpinner size={15} />
    ) : allSkillsTaxonomy.length === 0 ? (
      <p className="text-sm text-gray-500">No skills available to select.</p>
    ) : (
      allSkillsTaxonomy.map((skill) => {
        const isSelected = selectedCurrentSkillsMap.has(skill._id);
        const currentProficiency = isSelected
          ? selectedCurrentSkillsMap.get(skill._id)
          : null;
        return (
          <div
            key={skill._id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50"
          >
            <Badge
              variant={isSelected ? "primary" : "outline"}
              className="cursor-pointer px-3 py-1 text-sm mb-2 sm:mb-0"
              onClick={() => handleToggleCurrentSkill(skill._id)}
            >
              {skill.name}
            </Badge>
            {isSelected && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">
                  Level:
                </span>
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleSetProficiency(skill._id, level)}
                    disabled={isSaving}
                    className={`w-6 h-6 rounded text-xs flex items-center justify-center border dark:border-gray-600 disabled:opacity-50 ${
                      currentProficiency === level
                        ? "bg-blue-600 text-white border-blue-700 dark:bg-blue-500 dark:border-blue-600"
                        : "bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })
    )}
  </div>
);

// Current Skills Display Component
export const CurrentSkillsDisplay = ({ currentSkills }) => (
  <div className="flex flex-wrap gap-2">
    {currentSkills.length > 0 ? (
      currentSkills.map((userSkill) => (
        <Badge
          key={userSkill._id}
          className={`px-3 py-1 text-sm ${getSkillLevelColor(
            userSkill.proficiency
          )}`}
        >
          {userSkill.skillId?.name || "Unknown"}
          {userSkill.proficiency != null && ` (${userSkill.proficiency})`}
        </Badge>
      ))
    ) : (
      <p className="text-gray-500 dark:text-gray-400 italic text-sm">
        No current skills added yet.
      </p>
    )}
  </div>
);

// Desired Skills Editor Component
export const DesiredSkillsEditor = ({
  allSkillsTaxonomy,
  selectedDesiredSkillIds,
  handleToggleDesiredSkill,
  loadingTaxonomy,
}) => (
  <div className="flex flex-wrap gap-2 p-3 border rounded bg-gray-50/50 dark:bg-gray-800/30 dark:border-gray-700">
    {loadingTaxonomy ? (
      <LoadingSpinner size={15} />
    ) : allSkillsTaxonomy.length === 0 ? (
      <p className="text-sm text-gray-500">No skills available to select.</p>
    ) : (
      allSkillsTaxonomy.map((skill) => (
        <Badge
          key={skill._id}
          variant={
            selectedDesiredSkillIds.has(skill._id) ? "secondary" : "outline"
          }
          className="cursor-pointer px-3 py-1 text-sm"
          onClick={() => handleToggleDesiredSkill(skill._id)}
        >
          {skill.name}
        </Badge>
      ))
    )}
  </div>
);

// Desired Skills Display Component
export const DesiredSkillsDisplay = ({ desiredSkills }) => (
  <div className="flex flex-wrap gap-2">
    {desiredSkills.length > 0 ? (
      desiredSkills.map((userSkill) => (
        <Badge
          key={userSkill._id}
          variant="secondary"
          className="px-3 py-1 text-sm"
        >
          {userSkill.skillId?.name || "Unknown"}
        </Badge>
      ))
    ) : (
      <p className="text-gray-500 dark:text-gray-400 italic text-sm">
        No desired skills added yet.
      </p>
    )}
  </div>
);

// Projects List Component
export const ProjectsList = ({ projects, projectsError, loadingProjects }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center text-gray-800 dark:text-gray-100">
        <Briefcase size={18} className="mr-2" /> My Projects
      </CardTitle>
    </CardHeader>
    <CardContent>
      {loadingProjects ? (
        <LoadingSpinner size={20} />
      ) : projectsError ? (
        <p className="text-red-500 dark:text-red-400 text-sm">
          {projectsError}
        </p>
      ) : (
        <div className="space-y-3">
          {projects.length > 0 ? (
            projects.map((allocation) => (
              <div
                key={allocation._id}
                className="flex items-center justify-between text-sm"
              >
                <Link
                  href={`/projects/${allocation.projectId?._id}`}
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  {allocation.projectId?.name || "Unknown Project"}
                </Link>
                {/* Allocation details */}
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic text-sm">
              No projects assigned.
            </p>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);
