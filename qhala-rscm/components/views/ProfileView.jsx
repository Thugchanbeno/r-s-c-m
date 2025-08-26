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
import { Lock, User, Briefcase, Calendar, FileText } from "lucide-react";

export default function ProfilePage() {
  const {
    userProfile,
    currentSkills,
    desiredSkills,
    userAllocations,
    leaveData,
    lineManager,
    recentWorkRequests,
    pendingSkillVerifications,
    capacityData,
    isEditingSkills,
    setIsEditingSkills,
    isEditingProfile,
    setIsEditingProfile,
    isSaving,
    error,
    isLoading,
    isAuthenticated,
    handleSaveSkills,
    handleCreateWorkRequest,
    activeTab,
    setActiveTab,
  } = useProfile();

if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner size={40} />
      <p className="text-muted-foreground mt-2">Loading your profile...</p>
    </div>
  );
}

// if (notFound) {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background">
//       <Card className="w-full max-w-md">
//         <CardContent className="p-8 text-center">
//           <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
//           <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
//           <p className="text-muted-foreground">
//             We couldn’t find your profile. Please contact HR or try signing out and back in.
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
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
          {/* Profile Header */}
          <ProfileHeader
            user={userProfile}
            capacityData={capacityData}
            leaveData={leaveData}
          />

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20"
            >
              {error}
            </motion.div>
          )}

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="employment" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Employment
              </TabsTrigger>
              <TabsTrigger value="leave" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Leave & Time
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Requests
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Skills Section */}
                <div className="lg:col-span-2">
                  <SkillsSection
                    currentSkills={currentSkills}
                    desiredSkills={desiredSkills}
                    pendingVerifications={pendingSkillVerifications}
                    isEditing={isEditingSkills}
                    onEdit={() => setIsEditingSkills(true)}
                    onSave={handleSaveSkills}
                    onCancel={() => setIsEditingSkills(false)}
                    isSaving={isSaving}
                  />
                </div>

                {/* Side Panel */}
                <div className="space-y-6">
                  <LineManagerCard lineManager={lineManager} user={userProfile} />
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
                isEditing={isEditingProfile}
                onEdit={() => setIsEditingProfile(true)}
                onSave={() => {/* Handle save */}}
                onCancel={() => setIsEditingProfile(false)}
                isSaving={isSaving}
              />
            </TabsContent>

            <TabsContent value="leave" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LeaveBalanceCard
                  leaveData={leaveData}
                  onRequestLeave={() => {/* Handle leave request */}}
                />
                {/* Additional leave-related components can go here */}
              </div>
            </TabsContent>

            <TabsContent value="requests" className="space-y-6">
              <WorkRequestsSection
                requests={recentWorkRequests}
                onCreateRequest={handleCreateWorkRequest}
                isLoading={recentWorkRequests === undefined}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}