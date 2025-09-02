"use client";
import { useParams } from "next/navigation";
import { useProjectDetailsData } from "@/lib/hooks/useProjectDetailsData";
import ProjectDetail from "@/components/projects/project-detail";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Modal from "@/components/common/Modal";
import RequestResourceForm from "@/components/user/RequestResourceForm";

export default function ProjectDetailPage() {
  const { projectId } = useParams();

  const {
    project,
    allocations,
    utilization,
    tasks,
    loading,
    // Recommendations
    recommendedUsers,
    loadingRecommendations,
    recommendationError,
    showRecommendations,
    handleFetchRecommendations,
    // Resource Requests
    handleInitiateResourceRequest,
    handleCloseRequestModal,
    handleSubmitResourceRequest,
    isRequestModalOpen,
    isSubmittingRequest,
    userToRequest,
    // Permissions
    canManageTeam,
    // Tasks CRUD
    onCreateTask,
    onUpdateTask,
    onDeleteTask,
  } = useProjectDetailsData(projectId);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (!project) {
    return <div className="p-6 text-center">Project not found</div>;
  }

  return (
    <>
      <ProjectDetail
        project={project}
        allocations={allocations}
        utilization={utilization}
        tasks={tasks}
        recommendations={recommendedUsers}
        loadingRecommendations={loadingRecommendations}
        showRecommendations={showRecommendations}
        onGetRecommendations={handleFetchRecommendations}
        onCreateResourceRequest={handleInitiateResourceRequest}
        onCreateTask={onCreateTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        canManageTeam={canManageTeam}
      />

      {/* Resource Request Modal */}
      {isRequestModalOpen && userToRequest && (
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
    </>
  );
}
