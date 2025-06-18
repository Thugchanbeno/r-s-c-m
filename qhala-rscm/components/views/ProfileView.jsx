"use client";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useProfileData } from "@/lib/hooks/useProfileData";
import { cn } from "@/lib/utils";

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
} from "@/components/user/ProfileComponents";

const ProfileData = () => {
  const {
    session,
    status,
    currentSkills,
    desiredSkills,
    projects,
    groupedSkillsTaxonomy,
    expandedCurrentSkillCategories,
    toggleCurrentSkillCategory,
    expandedDesiredSkillCategories,
    toggleDesiredSkillCategory,
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (status !== "authenticated" || !session?.user) {
    return (
      <div className="flex justify-center items-center h-screen bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="text-primary mb-4">
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
              <h2 className="mb-2 text-xl font-medium text-foreground">
                Authentication Required
              </h2>
              <p className="text-muted-foreground">
                Please sign in to view your profile.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "animate-fade-in flex-grow p-4 transition-colors duration-300 md:p-6",
        "bg-muted rounded-lg"
      )}
    >
      <ProfileHeader
        title="My Profile"
        description="Manage your profile information and skills."
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="p-0">
            <UserInfo
              user={session.user}
              totalAllocation={totalAllocationSummary}
              loadingAllocationSummary={loadingAllocationSummary}
              allocationSummaryError={allocationSummaryError}
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {saveError &&
                (isEditingCurrentSkills || isEditingDesiredSkills) && (
                  <ErrorMessage message={saveError} />
                )}
              <div className="space-y-3 ">
                <SectionHeader
                  title="Current Skills"
                  isEditing={isEditingCurrentSkills}
                  onEditClick={() => {
                    setIsEditingCurrentSkills(true);
                    setSaveError(null);
                  }}
                  onSaveClick={() => handleSaveSkills("current")}
                  onCancelClick={handleCancelEditCurrent}
                  isSaving={isSaving && isEditingCurrentSkills}
                />

                {loadingSkills && !isEditingCurrentSkills ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size={20} />
                  </div>
                ) : skillsError && !isEditingCurrentSkills ? (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/15 p-3 text-sm text-destructive">
                    {skillsError}
                  </div>
                ) : isEditingCurrentSkills ? (
                  <CurrentSkillsEditor
                    groupedSkillsTaxonomy={groupedSkillsTaxonomy}
                    expandedCategories={expandedCurrentSkillCategories}
                    toggleCategory={toggleCurrentSkillCategory}
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
                  isSaving={isSaving && isEditingDesiredSkills}
                />

                {loadingSkills && !isEditingDesiredSkills ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size={20} />
                  </div>
                ) : skillsError && !isEditingDesiredSkills ? (
                  <p className="text-red-500 text-sm p-2 bg-red-50 rounded-[var(--radius)]">
                    {skillsError}
                  </p>
                ) : isEditingDesiredSkills ? (
                  <DesiredSkillsEditor
                    groupedSkillsTaxonomy={groupedSkillsTaxonomy}
                    expandedCategories={expandedDesiredSkillCategories}
                    toggleCategory={toggleDesiredSkillCategory}
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-card-foreground">
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
