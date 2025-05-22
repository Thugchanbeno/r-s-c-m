"use client";
import RequestResourceForm from "@/components/RequestResourceForm";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
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
} from "lucide-react";
import { motion } from "framer-motion";
import {
  getAllocationPercentageColor,
  getSkillLevelColor,
} from "@/components/common/skillcolors";
import { toast } from "react-toastify";
import RecommendedUserList from "@/components/recommendations/RecommendedUserList";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const ProjectDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId;
  const { data: session, status: sessionStatus } = useSession();

  const [project, setProject] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [userToRequest, setUserToRequest] = useState(null);

  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const fetchProjectData = useCallback(async () => {
    if (!projectId) {
      setError("Project ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [projectResponse, allocationsResponse] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/allocations?projectId=${projectId}`),
      ]);

      if (!projectResponse.ok) {
        const errData = await projectResponse.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            `Failed to fetch project: ${projectResponse.statusText} (${projectResponse.status})`
        );
      }
      const projectResult = await projectResponse.json();
      if (projectResult.success && projectResult.data) {
        setProject(projectResult.data);
      } else {
        throw new Error(
          projectResult.error || "Invalid project data received."
        );
      }

      if (!allocationsResponse.ok) {
        const errData = await allocationsResponse.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            `Failed to fetch allocations: ${allocationsResponse.statusText} (${allocationsResponse.status})`
        );
      }
      const allocationsResult = await allocationsResponse.json();
      if (allocationsResult.success && Array.isArray(allocationsResult.data)) {
        setAllocations(allocationsResult.data);
      } else {
        throw new Error(
          allocationsResult.error || "Invalid allocations data received."
        );
      }
    } catch (err) {
      console.error("Error fetching project details:", err);
      setError(err.message || "Could not load project details.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, fetchProjectData]);

  const handleFetchRecommendations = async () => {
    if (!projectId) return;
    setLoadingRecommendations(true);
    setRecommendationError(null);
    setRecommendedUsers([]);
    setShowRecommendations(true);

    try {
      const response = await fetch(
        `/api/recommendations/users?projectId=${projectId}`
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch recommendations.");
      }
      setRecommendedUsers(result.data || []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setRecommendationError(err.message);
      setRecommendedUsers([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Completed":
        return "primary";
      case "Planning":
        return "warning";
      case "On Hold":
        return "default";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const canManageTeam =
    session?.user &&
    project &&
    (session.user.id === project.pmId?._id ||
      session.user.role === "admin" ||
      session.user.role === "hr");

  const handleInitiateResourceRequest = (user) => {
    setUserToRequest(user);
    setIsRequestModalOpen(true);
  };

  const handleCloseRequestModal = () => {
    setIsRequestModalOpen(false);
    setUserToRequest(null);
    setIsSubmittingRequest(false);
  };

  const handleSubmitResourceRequest = async (formDataFromForm) => {
    if (!userToRequest || !project) return;
    setIsSubmittingRequest(true);

    const payload = {
      projectId: project._id,
      requestedUserId: userToRequest._id,
      requestedRole: formDataFromForm.requestedRole,
      requestedPercentage: formDataFromForm.requestedPercentage,
      requestedStartDate: formDataFromForm.requestedStartDate,
      requestedEndDate: formDataFromForm.requestedEndDate,
      pmNotes: formDataFromForm.pmNotes,
    };

    try {
      const response = await fetch("/api/resourcerequests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit request");
      }
      toast.success(
        `Request for ${userToRequest.name} submitted successfully!`
      );
      handleCloseRequestModal();
    } catch (error) {
      console.error("Error submitting resource request:", error);
      toast.error(`Error: ${error.message || "Could not submit request."}`);
      setIsSubmittingRequest(false);
    }
  };

  if (sessionStatus === "loading" || (loading && !project)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[rgb(var(--background))] p-10 text-center">
        <LoadingSpinner size={30} />
        <p className="mt-3 text-[rgb(var(--muted-foreground))]">
          Loading project details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[rgb(var(--muted))] p-6 text-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center justify-center">
              <AlertCircle size={24} className="mr-2" /> Error
            </CardTitle>
          </CardHeader>
          <CardContent>
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

  if (!project) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[rgb(var(--muted))] p-6 text-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-[rgb(var(--foreground))]">
              <AlertCircle size={24} className="mr-2 text-amber-500" /> Project
              Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[rgb(var(--muted-foreground))]">
              The project you are looking for could not be found.
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

  return (
    <motion.div
      className="p-4 md:p-6 bg-[rgb(var(--muted))] min-h-screen"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/projects")}
            className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
          >
            <ArrowLeft size={18} className="mr-2" /> Back to All Projects
          </Button>
        </div>

        <motion.div variants={fadeIn}>
          <Card>
            <CardHeader className="border-b border-[rgb(var(--border))]">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                <CardTitle className="text-2xl md:text-3xl text-[rgb(var(--foreground))]">
                  {project.name}
                </CardTitle>
                <Badge
                  variant={getStatusBadgeVariant(project.status)}
                  pill={true}
                  size="md"
                  className="mt-1 sm:mt-0"
                >
                  {project.status}
                </Badge>
              </div>
              {project.pmId?.name && (
                <div className="text-sm text-[rgb(var(--muted-foreground))] mt-3 flex items-center">
                  <UserCog
                    size={16}
                    className="mr-2 text-[rgb(var(--primary))]"
                  />
                  Managed by:{" "}
                  <span className="font-medium text-[rgb(var(--foreground))] ml-1">
                    {project.pmId.name}
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-1">
                  Description
                </h3>
                <p className="text-base text-[rgb(var(--foreground))] whitespace-pre-wrap leading-relaxed">
                  {project.description || "No description provided."}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-1 flex items-center">
                    <CalendarDays
                      size={16}
                      className="mr-2 text-[rgb(var(--primary))]"
                    />{" "}
                    Start Date
                  </h3>
                  <p className="text-base text-[rgb(var(--foreground))]">
                    {formatDate(project.startDate)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-1 flex items-center">
                    <CalendarDays
                      size={16}
                      className="mr-2 text-[rgb(var(--primary))]"
                    />{" "}
                    End Date
                  </h3>
                  <p className="text-base text-[rgb(var(--foreground))]">
                    {formatDate(project.endDate)}
                  </p>
                </div>
              </div>
              {project.requiredSkills && project.requiredSkills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-2 flex items-center">
                    <Wrench
                      size={16}
                      className="mr-2 text-[rgb(var(--primary))]"
                    />{" "}
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.map((reqSkill) => (
                      <Badge
                        key={reqSkill.skillId}
                        className={getSkillLevelColor(
                          reqSkill.proficiencyLevel
                        )}
                        pill={true}
                        size="sm"
                      >
                        {reqSkill.skillName || "Unnamed Skill"}
                        {reqSkill.proficiencyLevel &&
                          ` (L${reqSkill.proficiencyLevel})`}
                        {reqSkill.isRequired ? "*" : ""}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-[rgb(var(--foreground))] flex items-center">
                <Users size={20} className="mr-2 text-[rgb(var(--primary))]" />{" "}
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
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-base text-[rgb(var(--foreground))]">
                          {alloc.userId?.name || "Unknown User"}
                        </span>
                        <Badge
                          size="sm"
                          pill={true}
                          className={getAllocationPercentageColor(
                            alloc.allocationPercentage
                          )}
                        >
                          {alloc.allocationPercentage}%
                        </Badge>
                      </div>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        Role: {alloc.role}
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
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[rgb(var(--foreground))] flex items-center">
                  <UserPlus
                    size={20}
                    className="mr-2 text-[rgb(var(--primary))]"
                  />
                  Manage Team / Request Resources
                </CardTitle>
                <CardDescription className="mt-1">
                  Find AI-powered user recommendations for this project.
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
                    <p className="text-sm text-red-600 mt-3 p-3 bg-red-50 border border-red-200 rounded-[var(--radius)] shadow">
                      Error finding recommendations: {recommendationError}
                    </p>
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
                    <div className="text-center py-8 px-4 rounded-lg bg-[rgb(var(--background))] border border-[rgb(var(--border))]">
                      <Info
                        size={32}
                        className="mx-auto mb-3 text-[rgb(var(--primary))]"
                      />
                      <h4 className="font-semibold text-md text-[rgb(var(--foreground))] mb-1">
                        No Specific Recommendations Found
                      </h4>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">
                        The AI couldn't pinpoint specific user recommendations
                        based on the current project criteria. You can still
                        manually browse and request resources if needed.
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
