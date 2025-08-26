"use client";

import { motion } from "framer-motion";
import { useProfile } from "@/lib/hooks/useProfile";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Card, CardContent } from "@/components/common/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ProfileHeader,
  EmploymentDetailsCard,
  LineManagerCard,
  LeaveBalanceCard,
  SkillsSection,
  ProjectsSection,
  WorkRequestsSection,
} from "@/components/profile/profile-components";
import EmployeeDetailsModal from "@/components/profile/modals/employee-details-modal";
import LeaveRequestModal from "@/components/profile/modals/leave-request-modal";
import OvertimeRequestModal from "@/components/profile/modals/overtime-request-modal";
import {
  CurrentSkillsModal,
  DesiredSkillsModal,
} from "@/components/profile/modals/skills-editor-modal";
import { Lock, User, Briefcase, Calendar, FileText } from "lucide-react";

export default function ProfilePage() {
  const {
    userProfile,
    currentSkills,
    desiredSkills,
    groupedSkillsTaxonomy,
    expandedCurrentSkillCategories,
    expandedDesiredSkillCategories,
    selectedCurrentSkillsMap,
    selectedDesiredSkillIds,
    userAllocations,
    recentWorkRequests,
    pendingSkillVerifications,
    capacityData,
    isSaving,
    error,
    isLoading,
    isAuthenticated,
    activeTab,
    setActiveTab,
    isEmploymentModalOpen,
    setIsEmploymentModalOpen,
    isLeaveModalOpen,
    setIsLeaveModalOpen,
    isOvertimeModalOpen,
    setIsOvertimeModalOpen,
    isCurrentSkillsModalOpen,
    setIsCurrentSkillsModalOpen,
    isDesiredSkillsModalOpen,
    setIsDesiredSkillsModalOpen,
    // 👇 missing setters now included
    setExpandedCurrentSkillCategories,
    setExpandedDesiredSkillCategories,
    setSelectedCurrentSkillsMap,
    setSelectedDesiredSkillIds,
    handleSaveProfile,
    handleSaveSkills,
    handleUploadProof,
    handleAddProofUrl,
    handleRemoveProof,
    allSkills,
  } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <LoadingSpinner size={40} />
        <p className="text-muted-foreground mt-2">Loading your profile...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Authentication Required
            </h2>
            <p className="text-muted-foreground">
              Please sign in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <ProfileHeader
            user={userProfile}
            capacityData={capacityData}
            leaveData={null}
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20"
            >
              {error}
            </motion.div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger
                value="employment"
                className="flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4" /> Employment
              </TabsTrigger>
              <TabsTrigger value="leave" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Leave & Time
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Requests
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <SkillsSection
                    currentSkills={currentSkills}
                    desiredSkills={desiredSkills}
                    pendingVerifications={pendingSkillVerifications}
                    onEditCurrent={() => setIsCurrentSkillsModalOpen(true)}
                    onEditDesired={() => setIsDesiredSkillsModalOpen(true)}
                  />
                </div>
                <div className="space-y-6">
                  <LineManagerCard lineManager={null} user={userProfile} />
                  <ProjectsSection
                    allocations={userAllocations}
                    isLoading={userAllocations === undefined}
                    error={null}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="employment" className="space-y-6">
              <EmploymentDetailsCard
                user={userProfile}
                isEditing={false}
                onEdit={() => {
                  if (["admin", "hr"].includes(userProfile?.role)) {
                    setIsEmploymentModalOpen(true);
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="leave" className="space-y-6">
              <LeaveBalanceCard
                leaveData={null}
                onRequestLeave={() => setIsLeaveModalOpen(true)}
              />
            </TabsContent>

            <TabsContent value="requests" className="space-y-6">
              <WorkRequestsSection
                requests={recentWorkRequests}
                isLoading={recentWorkRequests === undefined}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Modals */}
      <EmployeeDetailsModal
        isOpen={isEmploymentModalOpen}
        onClose={() => setIsEmploymentModalOpen(false)}
        defaultValues={userProfile}
        isSaving={isSaving}
        onSave={(form) =>
          handleSaveProfile({
            id: userProfile._id,
            email: userProfile.email,
            ...form,
          })
        }
      />

      <CurrentSkillsModal
        isOpen={isCurrentSkillsModalOpen}
        onClose={() => setIsCurrentSkillsModalOpen(false)}
        isSaving={isSaving}
        onSave={handleSaveSkills}
        groupedSkillsTaxonomy={groupedSkillsTaxonomy}
        expandedCurrentSkillCategories={expandedCurrentSkillCategories}
        toggleCurrentSkillCategory={(cat) =>
          setExpandedCurrentSkillCategories((prev) => ({
            ...prev,
            [cat]: !prev[cat],
          }))
        }
        selectedCurrentSkillsMap={selectedCurrentSkillsMap}
        handleToggleCurrentSkill={(id) =>
          setSelectedCurrentSkillsMap((prev) => {
            const newMap = new Map(prev);
            if (newMap.has(id)) newMap.delete(id);
            else newMap.set(id, 3);
            return newMap;
          })
        }
        handleSetProficiency={(id, level) =>
          setSelectedCurrentSkillsMap((prev) => {
            const newMap = new Map(prev);
            newMap.set(id, level);
            return newMap;
          })
        }
        loadingTaxonomy={!allSkills}
        handleUploadProof={handleUploadProof}
        handleAddProofUrl={handleAddProofUrl}
        handleRemoveProof={handleRemoveProof}
        userSkills={currentSkills}
      />

      <DesiredSkillsModal
        isOpen={isDesiredSkillsModalOpen}
        onClose={() => setIsDesiredSkillsModalOpen(false)}
        isSaving={isSaving}
        onSave={handleSaveSkills}
        groupedSkillsTaxonomy={groupedSkillsTaxonomy}
        expandedDesiredSkillCategories={expandedDesiredSkillCategories}
        toggleDesiredSkillCategory={(cat) =>
          setExpandedDesiredSkillCategories((prev) => ({
            ...prev,
            [cat]: !prev[cat],
          }))
        }
        selectedDesiredSkillIds={selectedDesiredSkillIds}
        handleToggleDesiredSkill={(id) =>
          setSelectedDesiredSkillIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
          })
        }
        loadingTaxonomy={!allSkills}
      />
    </div>
  );
}
