"use client";
import { useEffect, useRef } from "react";
import { useProfile } from "@/lib/hooks/useProfile";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ProfileHeaderNew from "./ProfileHeaderNew";
import SkillsSectionNew from "./SkillsSectionNew";
import ProjectsEmploymentSectionNew from "./ProjectsEmploymentSectionNew";
import LineManagerCardNew from "./LineManagerCardNew";
import WorkRequestsSectionNew from "./WorkRequestsSectionNew";
import LeaveRequestModal from "./LeaveRequestModal";
import OvertimeRequestModal from "./OvertimeRequestModal";
import SkillsEditorModal from "./SkillsEditorModal";
import EmploymentDetailsModal from "./EmploymentDetailsModal";

const ProfilePageNew = () => {
  const {
    userProfile,
    currentSkills,
    desiredSkills,
    userAllocations,
    recentWorkRequests,
    pendingSkillVerifications,
    isLoading,
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
  } = useProfile();

  // Fetch line manager data
  const lineManager = useQuery(
    api.users.getById,
    userProfile?.lineManagerId ? { id: userProfile.lineManagerId } : "skip"
  );

  // Fetch work requests
  const workRequests = useQuery(
    api.workRequests.getAll,
    userProfile?.email ? { email: userProfile.email } : "skip"
  );

  // Fetch enriched allocations with project details
  const enrichedAllocations = useQuery(
    api.allocations.getAll,
    userProfile?.email && userProfile?._id
      ? { email: userProfile.email, userId: userProfile._id }
      : "skip"
  );

  // Refs for scroll detection
  const overviewRef = useRef(null);
  const skillsRef = useRef(null);
  const employmentRef = useRef(null);
  const managerRef = useRef(null);
  const requestsRef = useRef(null);

  // Add smooth scroll behavior
  useEffect(() => {
    // Add smooth scroll to html element
    document.documentElement.style.scrollBehavior = "smooth";
    
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  // Scrollspy effect - updates sidebar active state
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: "overview", ref: overviewRef },
        { id: "skills", ref: skillsRef },
        { id: "employment", ref: employmentRef },
        { id: "manager", ref: managerRef },
        { id: "requests", ref: requestsRef },
      ];

      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.ref.current) {
          const offsetTop = section.ref.current.offsetTop;
          if (scrollPosition >= offsetTop) {
            // Update URL hash for sidebar to detect
            const newHash = `#${section.id}`;
            if (window.location.hash !== newHash) {
              window.history.replaceState(null, "", newHash);
            }
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <LoadingSpinner width={200} height={4} />
        <p className="text-sm text-rscm-dark-purple">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Profile Header */}
      <div ref={overviewRef} id="overview">
        <ProfileHeaderNew user={userProfile} capacityData={userAllocations} />
      </div>

      {/* Skills Section */}
      <div ref={skillsRef} id="skills">
        <SkillsSectionNew
          currentSkills={currentSkills}
          desiredSkills={desiredSkills}
          pendingVerifications={pendingSkillVerifications}
          onEditCurrent={() => setIsCurrentSkillsModalOpen(true)}
          onEditDesired={() => setIsDesiredSkillsModalOpen(true)}
        />
      </div>

      {/* Projects & Employment Section */}
      <div ref={employmentRef} id="employment">
        <ProjectsEmploymentSectionNew
          user={userProfile}
          allocations={enrichedAllocations?.data || []}
          onEditEmployment={() => setIsEmploymentModalOpen(true)}
        />
      </div>

      {/* Line Manager Card */}
      {userProfile?.lineManagerId && (
        <div ref={managerRef} id="manager">
          <LineManagerCardNew lineManager={lineManager} />
        </div>
      )}

      {/* Work Requests Section */}
      <div ref={requestsRef} id="requests">
        <WorkRequestsSectionNew
          requests={workRequests || []}
          onRequestLeave={() => setIsLeaveModalOpen(true)}
          onRequestOvertime={() => setIsOvertimeModalOpen(true)}
        />
      </div>

      {/* Modals */}
      <EmploymentDetailsModal
        isOpen={isEmploymentModalOpen}
        onClose={() => setIsEmploymentModalOpen(false)}
        user={userProfile}
        userEmail={userProfile?.email}
      />

      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        userEmail={userProfile?.email}
      />

      <OvertimeRequestModal
        isOpen={isOvertimeModalOpen}
        onClose={() => setIsOvertimeModalOpen(false)}
        userEmail={userProfile?.email}
      />

      <SkillsEditorModal
        isOpen={isCurrentSkillsModalOpen}
        onClose={() => setIsCurrentSkillsModalOpen(false)}
        userEmail={userProfile?.email}
        mode="current"
      />

      <SkillsEditorModal
        isOpen={isDesiredSkillsModalOpen}
        onClose={() => setIsDesiredSkillsModalOpen(false)}
        userEmail={userProfile?.email}
        mode="desired"
      />
    </div>
  );
};

export default ProfilePageNew;
