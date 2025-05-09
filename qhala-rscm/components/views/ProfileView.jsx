"use client";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useProfileData } from "@/lib/hooks/useProfileData";

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
    totalAllocationSummary,
    loadingAllocationSummary,
    allocationSummaryError,
  } = useProfileData();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen bg-[rgb(var(--background))]">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (status !== "authenticated" || !session?.user) {
    return (
      <div className="flex justify-center items-center h-screen bg-[rgb(var(--background))] p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="text-[rgb(var(--primary))] mb-4">
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
              <h2 className="text-xl font-medium mb-2 text-[rgb(var(--foreground))]">
                Authentication Required
              </h2>
              <p className="text-[rgb(var(--muted-foreground))]">
                Please sign in to view your profile.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-4 md:p-6 bg-[rgb(var(--muted))] rounded-[var(--radius)] transition-colors duration-300 flex-grow min-h-screen">
      <ProfileHeader
        title="My Profile"
        description="Manage your profile information and skills."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main content card - uses themed Card component */}
        <Card className="lg:col-span-2">
          {/* UserInfo is already styled as a card-like item, so CardHeader can be minimal */}
          <CardHeader>
            <UserInfo
              className="p-2"
              user={session.user}
              totalAllocation={totalAllocationSummary}
              loadingAllocationSummary={loadingAllocationSummary}
              allocationSummaryError={allocationSummaryError}
            />
          </CardHeader>
          {/* CardContent will have the default card background (e.g., white) */}
          <CardContent>
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
                  <p className="text-red-500 text-sm p-2 bg-red-50 rounded-[var(--radius)]">
                    {skillsError}
                  </p>
                ) : isEditingCurrentSkills ? (
                  <CurrentSkillsEditor
                    allSkillsTaxonomy={allSkillsTaxonomy}
                    selectedCurrentSkillsMap={selectedCurrentSkillsMap}
                    handleToggleCurrentSkill={handleToggleCurrentSkill}
                    handleSetProficiency={handleSetProficiency}
                    isSaving={isSaving}
                    loadingTaxonomy={loadingTaxonomy}
                  />
                ) : (
                  <div className="p-4 rounded-[var(--radius)] border border-[rgb(var(--border))]">
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
                  <p className="text-red-500 text-sm p-2 bg-red-50 rounded-[var(--radius)]">
                    {skillsError}
                  </p>
                ) : isEditingDesiredSkills ? (
                  <DesiredSkillsEditor
                    allSkillsTaxonomy={allSkillsTaxonomy}
                    selectedDesiredSkillIds={selectedDesiredSkillIds}
                    handleToggleDesiredSkill={handleToggleDesiredSkill}
                    loadingTaxonomy={loadingTaxonomy}
                  />
                ) : (
                  <div className="p-4 rounded-[var(--radius)] border border-[rgb(var(--border))]">
                    <DesiredSkillsDisplay desiredSkills={desiredSkills} />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Projects card - uses themed Card component */}
          <Card>
            <CardHeader>
              {/* ProjectsList already renders its own CardTitle, so this is a simple h3 */}
              <h3 className="text-lg font-medium text-[rgb(var(--card-foreground))]">
                Allocated Projects
              </h3>
            </CardHeader>
            <CardContent className="p-0">
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
