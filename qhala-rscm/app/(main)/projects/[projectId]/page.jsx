"use client";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import RequestResourceForm from "@/components/user/RequestResourceForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/common/Card";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Badge from "@/components/common/Badge";
import Modal from "@/components/common/Modal";
import {
  ArrowLeft,
  Users,
  CalendarDays,
  UserCog,
  AlertCircle,
  Wrench,
  UserPlus,
  SearchCheck,
  Info,
  Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  getAllocationPercentageColor,
  getSkillLevelColor,
  getStatusBadgeVariant,
  getSkillLevelName,
} from "@/components/common/CustomColors";
import RecommendedUserList from "@/components/recommendations/RecommendedUserList";
import { useProjectDetailsData } from "@/lib/hooks/useProjectDetailsData";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";
import { fadeIn, containerVariants } from "@/lib/animations";

const ProjectDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId;
  const { status: sessionStatus } = useSession();

  const {
    project,
    allocations,
    loading,
    error,
    isRequestModalOpen,
    isSubmittingRequest,
    userToRequest,
    recommendedUsers,
    loadingRecommendations,
    recommendationError,
    showRecommendations,
    canManageTeam,
    // fetchProjectData,
    handleFetchRecommendations,
    handleInitiateResourceRequest,
    handleCloseRequestModal,
    handleSubmitResourceRequest,
  } = useProjectDetailsData(projectId);

  if (sessionStatus === "loading" || (loading && !project && !error)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[rgb(var(--background))] p-10 text-center rounded-lg">
        <LoadingSpinner size={30} />
        <p className="mt-3 text-[rgb(var(--muted-foreground))]">
          Loading project details...
        </p>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[rgb(var(--background))] p-6 text-center rounded-lg">
        <Card className="w-full max-w-md bg-[rgb(var(--card))] shadow-lg rounded-[var(--radius)]">
          <CardHeader
            className={cn(
              "bg-[rgb(var(--destructive))]/10 text-[rgb(var(--destructive))]",
              "border-b border-[rgb(var(--destructive))]/20"
            )}
          >
            <CardTitle className="flex items-center justify-center gap-2 text-base">
              <AlertCircle /> Error Loading Project
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-[rgb(var(--muted-foreground))]">{error}</p>
            <Button
              variant="outline"
              onClick={() => router.push("/projects")}
              className="mt-6"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project && !loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[rgb(var(--background))] p-6 text-center rounded-lg">
        <Card className="w-full max-w-md bg-[rgb(var(--card))] shadow-lg rounded-[var(--radius)]">
          <CardHeader
            className={cn(
              "bg-[rgb(var(--warning))]/10 text-[rgb(var(--warning))]",
              "border-b border-[rgb(var(--warning))]/20"
            )}
          >
            <CardTitle className="flex items-center justify-center gap-2 text-base">
              <AlertCircle /> Project Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-[rgb(var(--muted-foreground))]">
              The project you are looking for could not be found or you do not
              have permission to view it.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/projects")}
              className="mt-6"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) return null;

  return (
    <motion.div
      className="p-4 md:p-6 bg-[rgb(var(--background))] min-h-screen rounded-lg"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div variants={fadeIn} className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/projects")}
            className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
          >
            <ArrowLeft size={18} className="mr-2" /> Back to All Projects
          </Button>
        </motion.div>
        <motion.div variants={fadeIn}>
          <Card className="shadow-lg bg-[rgb(var(--card))] rounded-[var(--radius)]">
            <CardHeader
              className={cn(
                "border-b border-[rgb(var(--border))]",
                "bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))]"
              )}
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                <div className="flex-grow">
                  <CardTitle className="text-2xl md:text-3xl text-[rgb(var(--foreground))] flex items-center gap-2">
                    <Briefcase
                      size={24}
                      className="text-[rgb(var(--primary))]"
                    />
                    {project.name}
                  </CardTitle>
                  {project.pmId?.name && (
                    <CardDescription className="text-sm text-[rgb(var(--muted-foreground))] mt-2 flex items-center">
                      <UserCog
                        size={15}
                        className="mr-1.5 text-[rgb(var(--muted-foreground))]"
                      />
                      Managed by:{" "}
                      <span className="font-medium text-[rgb(var(--foreground))] ml-1">
                        {project.pmId.name}
                      </span>
                    </CardDescription>
                  )}
                </div>
                <Badge
                  variant={getStatusBadgeVariant(project.status)}
                  pill={true}
                  size="md"
                  className="mt-1 sm:mt-0 self-start sm:self-auto"
                >
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase text-[rgb(var(--muted-foreground))] mb-1.5">
                  Description
                </h3>
                <p className="text-base text-[rgb(var(--foreground))] whitespace-pre-wrap leading-relaxed">
                  {project.description || "No description provided."}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase text-[rgb(var(--muted-foreground))] mb-1.5 flex items-center">
                    <CalendarDays
                      size={15}
                      className="mr-2 text-[rgb(var(--muted-foreground))]"
                    />
                    Start Date
                  </h3>
                  <p className="text-base text-[rgb(var(--foreground))]">
                    {formatDate(project.startDate)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase text-[rgb(var(--muted-foreground))] mb-1.5 flex items-center">
                    <CalendarDays
                      size={15}
                      className="mr-2 text-[rgb(var(--muted-foreground))]"
                    />
                    End Date
                  </h3>
                  <p className="text-base text-[rgb(var(--foreground))]">
                    {formatDate(project.endDate)}
                  </p>
                </div>
              </div>
              {project.requiredSkills && project.requiredSkills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase text-[rgb(var(--muted-foreground))] mb-2 flex items-center">
                    <Wrench
                      size={15}
                      className="mr-2 text-[rgb(var(--muted-foreground))]"
                    />
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.map((reqSkill) => {
                      const proficiencyName = reqSkill.proficiencyLevel
                        ? getSkillLevelName(reqSkill.proficiencyLevel)
                        : "";

                      return (
                        <Badge
                          key={reqSkill.skillId || reqSkill.skillName}
                          className={getSkillLevelColor(
                            reqSkill.proficiencyLevel
                          )}
                          pill={true}
                          size="sm"
                        >
                          {reqSkill.skillName || "Unnamed Skill"}
                          {proficiencyName && (
                            <span className="ml-1.5 opacity-80">
                              ({proficiencyName})
                            </span>
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeIn}>
          <Card className="shadow-lg bg-[rgb(var(--card))] rounded-[var(--radius)]">
            <CardHeader>
              <CardTitle className="text-xl text-[rgb(var(--foreground))] flex items-center gap-2">
                <Users size={20} className="text-[rgb(var(--primary))]" />
                Allocated Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allocations.length > 0 ? (
                <motion.ul
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {allocations.map((alloc) => (
                    <motion.li
                      key={alloc._id}
                      variants={fadeIn}
                      className="p-4 border border-[rgb(var(--border))] rounded-[var(--radius)] bg-[rgb(var(--background))] hover:bg-[rgb(var(--muted))] transition-colors duration-150"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-1">
                        <span className="font-semibold text-base text-[rgb(var(--foreground))]">
                          {alloc.userId?.name || "Unknown User"}
                        </span>
                        <Badge
                          size="sm"
                          pill={true}
                          className={cn(
                            "mt-1 sm:mt-0",
                            getAllocationPercentageColor(
                              alloc.allocationPercentage
                            )
                          )}
                        >
                          {alloc.allocationPercentage}%
                        </Badge>
                      </div>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                        Role: {alloc.role || "N/A"}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                        Duration: {formatDate(alloc.startDate)} -{" "}
                        {formatDate(alloc.endDate)}
                      </p>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <p className="text-sm text-[rgb(var(--muted-foreground))] text-center py-6">
                  No team members currently allocated to this project.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
        {canManageTeam && (
          <motion.div variants={fadeIn}>
            <Card className="shadow-lg bg-[rgb(var(--card))] rounded-[var(--radius)]">
              <CardHeader>
                <CardTitle className="text-xl text-[rgb(var(--foreground))] flex items-center gap-2">
                  <UserPlus size={20} className="text-[rgb(var(--primary))]" />
                  Manage Team & Find Recommendations
                </CardTitle>
                <CardDescription className="mt-1 text-[rgb(var(--muted-foreground))]">
                  Use AI to find suitable users or manually request resources
                  for this project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Button
                    onClick={handleFetchRecommendations}
                    disabled={loadingRecommendations}
                    isLoading={loadingRecommendations}
                    variant="primary_outline"
                    className="group w-full sm:w-auto"
                  >
                    <SearchCheck
                      size={18}
                      className="mr-2 transition-transform duration-300 group-hover:scale-110"
                    />
                    {loadingRecommendations
                      ? "Finding Matches..."
                      : "Find Matching Users (AI)"}
                  </Button>
                  {recommendationError && (
                    <div
                      className={cn(
                        "mt-3 p-3 rounded-[var(--radius)] text-sm shadow",
                        "bg-[rgb(var(--destructive))]/15 text-[rgb(var(--destructive))] border border-[rgb(var(--destructive))]/30"
                      )}
                    >
                      Error finding recommendations: {recommendationError}
                    </div>
                  )}
                </div>

                {loadingRecommendations && (
                  <div className="text-center py-10">
                    <LoadingSpinner size={28} />
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mt-3">
                      Analyzing user profiles to find the best matches...
                    </p>
                  </div>
                )}

                {!loadingRecommendations && showRecommendations && (
                  <RecommendedUserList
                    recommendedUsers={recommendedUsers}
                    onInitiateRequest={handleInitiateResourceRequest}
                  />
                )}

                {!loadingRecommendations &&
                  showRecommendations &&
                  recommendedUsers.length === 0 &&
                  !recommendationError && (
                    <div className="text-center py-8 px-4 rounded-lg bg-[rgb(var(--background))] border border-[rgb(var(--border))] shadow-sm">
                      <Info
                        size={32}
                        className="mx-auto mb-3 text-[rgb(var(--primary))]"
                      />
                      <h4 className="font-semibold text-md text-[rgb(var(--foreground))] mb-1">
                        No Specific Recommendations Found
                      </h4>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">
                        The AI couldn't pinpoint specific user recommendations.
                        You can manually browse and request resources.
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {userToRequest && project && (
        <Modal
          isOpen={isRequestModalOpen}
          onClose={handleCloseRequestModal}
          title={`Request ${userToRequest.name} for ${project.name}`}
        >
          <RequestResourceForm
            userToRequest={userToRequest}
            projectId={project._id}
            onSubmit={handleSubmitResourceRequest}
            onCancel={handleCloseRequestModal}
            isSubmittingRequest={isSubmittingRequest}
          />
        </Modal>
      )}
    </motion.div>
  );
};

export default ProjectDetailPage;
