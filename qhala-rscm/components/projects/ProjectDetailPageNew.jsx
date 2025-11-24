"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  ArrowLeft,
  UserPlus,
  SearchCheck,
  CheckSquare,
  Wrench,
  Building2,
  Lock,
} from "lucide-react";
import Image from "next/image";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { TaskManagerConvex } from "@/components/projects/TaskManagerNew";
import { getSkillLevelName } from "@/components/common/CustomColors";
import RecommendedUserList from "./RecommendedUserList";

const ProjectDetailPageNew = ({
  project,
  allocations = [],
  tasks = [],
  utilization,
  recommendations = [],
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onCreateResourceRequest,
  onGetRecommendations,
  loadingRecommendations = false,
  showRecommendations = false,
  canManageTeam = false,
  isLoading = false,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Planning: "bg-rscm-lilac/10 text-rscm-violet",
      Active: "bg-green-50 text-green-700",
      "On Hold": "bg-yellow-50 text-yellow-700",
      Completed: "bg-gray-100 text-gray-600",
      Cancelled: "bg-red-50 text-red-600",
    };
    return colors[status] || colors.Planning;
  };

  const utilizationPercentage = utilization?.utilizationPercentage || 0;
  const teamSize = utilization?.teamSize || allocations.length;

  const tabs = [
    { id: "overview", label: "Overview", icon: Briefcase },
    { id: "team", label: "Team", icon: Users, count: teamSize },
    {
      id: "tasks",
      label: "Tasks",
      icon: CheckSquare,
      count: tasks?.length || 0,
    },
    ...(canManageTeam
      ? [{ id: "resources", label: "Resources", icon: UserPlus }]
      : []),
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <LoadingSpinner width={200} height={4} />
        <p className="text-sm text-rscm-dark-purple">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-lg font-medium text-rscm-dark-purple">
          Project not found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <button
            onClick={() => router.push("/projects")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-rscm-violet transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>
          {!canManageTeam && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Lock className="w-3 h-3" />
              Read-only access
            </div>
          )}
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rscm-violet to-rscm-plum flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-rscm-dark-purple">
                {project.name}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
              >
                {project.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {project.description || "No description provided"}
            </p>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span>{project.department}</span>
              </div>
              {project.startDate && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(project.startDate)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span>
                  {teamSize} member{teamSize !== 1 ? "s" : ""}
                </span>
              </div>
              {utilizationPercentage > 0 && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span>{utilizationPercentage}% utilized</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-100">
          <div className="flex gap-1 px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                    isActive
                      ? "text-rscm-violet"
                      : "text-gray-600 hover:text-rscm-violet"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs ${
                        isActive
                          ? "bg-rscm-violet/10 text-rscm-violet"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rscm-violet" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <h3 className="text-xs font-medium text-gray-500 uppercase">
                      Timeline
                    </h3>
                  </div>
                  <p className="text-sm text-rscm-dark-purple font-medium">
                    {formatDate(project.startDate)} -{" "}
                    {formatDate(project.endDate)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <h3 className="text-xs font-medium text-gray-500 uppercase">
                      Department
                    </h3>
                  </div>
                  <p className="text-sm text-rscm-dark-purple font-medium">
                    {project.department}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <h3 className="text-xs font-medium text-gray-500 uppercase">
                      Utilization
                    </h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm text-rscm-dark-purple font-medium">
                      {utilizationPercentage}%
                    </p>
                    <span className="text-xs text-gray-500">avg</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rscm-violet rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(utilizationPercentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Required Skills */}
              {project.requiredSkills && project.requiredSkills.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-rscm-dark-purple">
                      Required Skills
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.map((skill, idx) => (
                      <span
                        key={`${skill.skillId}-${idx}`}
                        className="px-3 py-1.5 bg-rscm-lilac/10 text-rscm-violet text-xs font-medium rounded-full"
                      >
                        {skill.skillName}
                        {skill.proficiencyLevel && (
                          <span className="ml-1 opacity-70">
                            • {getSkillLevelName(skill.proficiencyLevel)}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "team" && (
            <div className="space-y-4">
              {allocations.length > 0 ? (
                allocations.map((alloc) => {
                  const userName =
                    alloc.userId?.name || alloc.userName || "Unknown User";
                  const userAvatar =
                    alloc.userId?.avatarUrl || alloc.userAvatar;
                  return (
                    <div
                      key={alloc._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {userAvatar ? (
                          <Image
                            src={userAvatar}
                            alt={userName}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-rscm-violet flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {userName?.[0]?.toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-rscm-dark-purple">
                            {userName}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {alloc.role} • {formatDate(alloc.startDate)} -{" "}
                            {formatDate(alloc.endDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-rscm-violet">
                          {alloc.allocationPercentage}%
                        </p>
                        <p className="text-xs text-gray-500">capacity</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <h3 className="font-medium text-rscm-dark-purple mb-1">
                    No team members allocated
                  </h3>
                  <p className="text-sm text-gray-500">
                    {canManageTeam
                      ? "Use the Resources tab to find and request team members"
                      : "Team members will appear here once allocated"}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "tasks" && (
            <div>
              <TaskManagerConvex
                projectId={project._id}
                tasks={tasks}
                onCreateTask={onCreateTask}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
              />
            </div>
          )}

          {/* RESOURCES TAB - INTEGRATED WITH AI RECOMMENDATIONS */}
          {activeTab === "resources" && canManageTeam && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-rscm-dark-purple mb-3">
                  Find Team Members
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Use AI to find the best matching team members based on project
                  requirements and skills.
                </p>
                <button
                  onClick={onGetRecommendations}
                  disabled={loadingRecommendations}
                  className="flex items-center gap-2 bg-rscm-violet text-white px-4 py-2 rounded-lg hover:bg-rscm-plum transition-colors disabled:opacity-50"
                >
                  {loadingRecommendations ? (
                    <>
                      <LoadingSpinner width={16} height={2} />
                      Finding Matches...
                    </>
                  ) : (
                    <>
                      <SearchCheck className="w-4 h-4" />
                      Get AI Recommendations
                    </>
                  )}
                </button>
              </div>

              {showRecommendations && (
                <div className="mt-6">
                  {recommendations.length > 0 ? (
                    <>
                      <h4 className="text-sm font-semibold text-rscm-dark-purple mb-4">
                        Recommended Team Members
                      </h4>
                      <RecommendedUserList
                        recommendedUsers={recommendations}
                        projectId={project._id}
                        onInitiateRequest={onCreateResourceRequest}
                      />
                    </>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <SearchCheck className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">
                        No recommendations found. Try adjusting project
                        requirements.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPageNew;
