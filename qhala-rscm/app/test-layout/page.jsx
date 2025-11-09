"use client";
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ProfileHeaderNew from "@/components/profile/ProfileHeaderNew";
import SkillsSectionNew from "@/components/profile/SkillsSectionNew";
import ProjectsEmploymentSectionNew from "@/components/profile/ProjectsEmploymentSectionNew";
import LineManagerCardNew from "@/components/profile/LineManagerCardNew";
import WorkRequestsSectionNew from "@/components/profile/WorkRequestsSectionNew";
import LeaveRequestModal from "@/components/profile/LeaveRequestModal";
import OvertimeRequestModal from "@/components/profile/OvertimeRequestModal";
import SkillsEditorModal from "@/components/profile/SkillsEditorModal";
import { useAuth } from "@/lib/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function TestLayoutPage() {
  const { user, isLoading } = useAuth();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [skillsModalMode, setSkillsModalMode] = useState("current");
  
  const userAllocations = useQuery(
    api.users.getAllocationSummary,
    user?.email && user?._id
      ? { email: user.email, userId: user._id }
      : "skip"
  );

  const userSkills = useQuery(
    api.userSkills.getForCurrentUser,
    user?.email ? { email: user.email } : "skip"
  );

  const pendingVerifications = useQuery(
    api.skills.getPendingVerifications,
    user?.email ? { email: user.email } : "skip"
  );

  const lineManager = useQuery(
    api.users.getById,
    user?.lineManagerId ? { id: user.lineManagerId } : "skip"
  );

  const workRequests = useQuery(
    api.workRequests.getAll,
    user?.email ? { email: user.email } : "skip"
  );

  const currentSkills = userSkills?.filter((s) => s.isCurrent) || [];
  const desiredSkills = userSkills?.filter((s) => s.isDesired) || [];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <LoadingSpinner width={200} height={4} />
          <p className="text-sm text-rscm-dark-purple">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-rscm-dark-purple">
          Profile Component Testing
        </h1>

        <ProfileHeaderNew 
          user={user} 
          capacityData={userAllocations}
        />

        <SkillsSectionNew
          currentSkills={currentSkills}
          desiredSkills={desiredSkills}
          pendingVerifications={pendingVerifications}
          onEditCurrent={() => {
            setSkillsModalMode("current");
            setShowSkillsModal(true);
          }}
          onEditDesired={() => {
            setSkillsModalMode("desired");
            setShowGoalsModal(true);
          }}
        />

        <ProjectsEmploymentSectionNew
          user={user}
          allocations={userAllocations?.projects}
          onEditEmployment={() => alert('Edit Employment Details')}
        />

        <LineManagerCardNew lineManager={lineManager} />

        <WorkRequestsSectionNew
          requests={workRequests || []}
          onRequestLeave={() => setShowLeaveModal(true)}
          onRequestOvertime={() => setShowOvertimeModal(true)}
        />

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-rscm-violet mb-3">
            Profile Components Complete!
          </h2>
          <p className="text-sm text-gray-500">
            All main profile components created. Next: modals for skills editing and work requests.
          </p>
        </div>
      </div>

      <LeaveRequestModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        userEmail={user?.email}
      />

      <OvertimeRequestModal
        isOpen={showOvertimeModal}
        onClose={() => setShowOvertimeModal(false)}
        userEmail={user?.email}
      />

      <SkillsEditorModal
        isOpen={showSkillsModal}
        onClose={() => setShowSkillsModal(false)}
        userEmail={user?.email}
        mode="current"
      />

      <SkillsEditorModal
        isOpen={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
        userEmail={user?.email}
        mode="desired"
      />
    </AppLayout>
  );
}
