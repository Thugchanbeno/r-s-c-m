"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useProjectDetailsData } from "@/lib/hooks/useProjectDetailsData";
import { useAI } from "@/lib/hooks/useAI";
import ProjectDetailPageNew from "@/components/projects/ProjectDetailPageNew";
import RequestResourceForm from "@/components/user/RequestResourceForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RSCM_COLORS } from "@/components/charts/ChartComponents";

export default function ProjectDetailPage() {
  const { projectId } = useParams();

  const { handleGetRecommendations } = useAI();
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAiResults, setShowAiResults] = useState(false);
  const {
    project,
    allocations,
    utilization,
    tasks,
    loading,
    handleInitiateResourceRequest,
    handleCloseRequestModal,
    handleSubmitResourceRequest,
    isRequestModalOpen,
    isSubmittingRequest,
    userToRequest,
    canManageTeam,
    onCreateTask,
    onUpdateTask,
    onDeleteTask,
  } = useProjectDetailsData(projectId);

  const onGetRecommendations = async () => {
    setLoadingAi(true);
    setShowAiResults(false);
    const results = await handleGetRecommendations(projectId);
    setAiRecommendations(results);
    setShowAiResults(true);
    setLoadingAi(false);
  };

  return (
    <>
      <ProjectDetailPageNew
        project={project}
        allocations={allocations}
        utilization={utilization}
        tasks={tasks}
        recommendations={aiRecommendations}
        loadingRecommendations={loadingAi}
        showRecommendations={showAiResults}
        onGetRecommendations={onGetRecommendations}
        onCreateResourceRequest={handleInitiateResourceRequest}
        onCreateTask={onCreateTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        canManageTeam={canManageTeam}
        isLoading={loading}
      />
      <Dialog
        open={isRequestModalOpen}
        onOpenChange={(open) => !open && handleCloseRequestModal()}
      >
        <DialogContent className="sm:max-w-[500px] bg-white border-0 shadow-xl rounded-xl p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
            <DialogTitle
              className="text-lg font-bold"
              style={{ color: RSCM_COLORS.darkPurple }}
            >
              New Resource Request
            </DialogTitle>
          </DialogHeader>

          <div className="p-6">
            {userToRequest && (
              <RequestResourceForm
                userToRequest={userToRequest}
                projectId={project?._id}
                onSubmit={handleSubmitResourceRequest}
                onCancel={handleCloseRequestModal}
                isSubmittingRequest={isSubmittingRequest}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
