"use client";
import { useRouter } from "next/navigation";
import { Calendar, Users, Lock } from "lucide-react";
import Image from "next/image";

const ProjectCard = ({ project, allocations = [], canEdit }) => {
  const router = useRouter();

  const getStatusColor = (status) => {
    const colors = {
      planning: "bg-rscm-lilac/20 text-rscm-plum",
      active: "bg-emerald-50 text-emerald-700",
      on_hold: "bg-amber-50 text-amber-700",
      completed: "bg-slate-100 text-slate-700",
      cancelled: "bg-rose-50 text-rose-700",
    };
    return colors[status] || colors.planning;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Not set";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => router.push(`/projects/${project._id}`)}
    >
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-rscm-dark-purple truncate">
                {project.name}
              </h3>
              {!canEdit && (
                <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-500">
              {project.department || "No department"}
            </p>
          </div>
          {/* Status Badge */}
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
              project.status
            )}`}
          >
            {project.status?.replace("_", " ").toUpperCase() || "PLANNING"}
          </span>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Team Avatar Overlays */}
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-rscm-plum" />
          {allocations && allocations.length > 0 ? (
            <div className="flex -space-x-2">
              {allocations.slice(0, 4).map((alloc, idx) => (
                <div
                  key={idx}
                  className="relative"
                  title={alloc.userId?.name || "Team member"}
                >
                  {alloc.userId?.avatarUrl ? (
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-white shadow-sm">
                      <Image
                        src={alloc.userId.avatarUrl}
                        alt={alloc.userId.name || "User"}
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-rscm-violet to-rscm-plum flex items-center justify-center shadow-sm">
                      <span className="text-xs font-semibold text-white">
                        {alloc.userId?.name?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {allocations.length > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center shadow-sm">
                  <span className="text-xs font-semibold text-gray-600">
                    +{allocations.length - 4}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400">No team members</span>
          )}
        </div>

        {/* Required Skills Bar */}
        <div className="mb-2.5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-600 font-medium">Required Skills</span>
            <span className="text-rscm-violet font-semibold">
              {project.requiredSkills?.length || 0}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-rscm-violet to-rscm-plum h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(((project.requiredSkills?.length || 0) / 10) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Dates Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2.5 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(project.startDate)}</span>
          </div>
          {project.endDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(project.endDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
