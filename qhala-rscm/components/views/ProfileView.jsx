"use client";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useProfileData } from "@/lib/hooks/useProfileData";

// Import UI components
import {
  ProfileHeader,
  UserInfo,
  ErrorMessage,
  SectionHeader,
  CurrentSkillsEditor,
  CurrentSkillsDisplay,
  DesiredSkillsEditor,
  DesiredSkillsDisplay,
  ProjectsList,
} from "@/components/ProfileComponents";

const ProfileData = () => {
  const {
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
  } = useProfileData();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (status !== "authenticated" || !session?.user) {
    return (
      <div className="p-6 text-center bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center p-8">
          <div className="text-indigo-600 dark:text-indigo-400 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-4 md:p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <ProfileHeader
        title="My Profile"
        description="Manage your profile information and skills."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <UserInfo user={session.user} />
          </CardHeader>
          <CardContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <div className="space-y-8">
              {saveError && <ErrorMessage message={saveError} />}

              {/* Current Skills Section */}
              <div className="space-y-3 p-1">
                <SectionHeader
                  title="Current Skills"
                  isEditing={isEditingCurrentSkills}
                  onEditClick={() => {
                    setIsEditingCurrentSkills(true);
                    setSaveError(null);
                  }}
                  onSaveClick={() => handleSaveSkills("current")}
                  onCancelClick={handleCancelEditCurrent}
                  isSaving={isSaving}
                />

                {loadingSkills ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size={20} />
                  </div>
                ) : skillsError ? (
                  <p className="text-red-500 dark:text-red-400 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                    {skillsError}
                  </p>
                ) : isEditingCurrentSkills ? (
                  <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <CurrentSkillsEditor
                      allSkillsTaxonomy={allSkillsTaxonomy}
                      selectedCurrentSkillsMap={selectedCurrentSkillsMap}
                      handleToggleCurrentSkill={handleToggleCurrentSkill}
                      handleSetProficiency={handleSetProficiency}
                      isSaving={isSaving}
                      loadingTaxonomy={loadingTaxonomy}
                    />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <CurrentSkillsDisplay currentSkills={currentSkills} />
                  </div>
                )}
              </div>

              {/* Desired Skills Section */}
              <div className="space-y-3 p-1">
                <SectionHeader
                  title="Desired Skills"
                  isEditing={isEditingDesiredSkills}
                  onEditClick={() => {
                    setIsEditingDesiredSkills(true);
                    setSaveError(null);
                  }}
                  onSaveClick={() => handleSaveSkills("desired")}
                  onCancelClick={handleCancelEditDesired}
                  isSaving={isSaving}
                />

                {loadingSkills ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size={20} />
                  </div>
                ) : skillsError && !isEditingDesiredSkills ? (
                  <p className="text-red-500 dark:text-red-400 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                    {skillsError}
                  </p>
                ) : isEditingDesiredSkills ? (
                  <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <DesiredSkillsEditor
                      allSkillsTaxonomy={allSkillsTaxonomy}
                      selectedDesiredSkillIds={selectedDesiredSkillIds}
                      handleToggleDesiredSkill={handleToggleDesiredSkill}
                      loadingTaxonomy={loadingTaxonomy}
                    />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <DesiredSkillsDisplay desiredSkills={desiredSkills} />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                My Projects
              </h3>
            </CardHeader>
            <CardContent>
              <ProjectsList
                projects={projects}
                projectsError={projectsError}
                loadingProjects={loadingProjects}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileData;
