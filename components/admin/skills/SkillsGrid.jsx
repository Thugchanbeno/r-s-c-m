"use client";
import {
  Users,
  TrendingUp,
  MoreHorizontal,
  Trash2,
  X,
  Award,
} from "lucide-react";
import { RSCM_COLORS } from "@/components/charts/ChartComponents";
import { cn } from "@/lib/utils";

export default function SkillsGrid({
  skills,
  viewMode,
  skillsAwaitingDelete,
  onDelete,
  onCancelDelete,
  hasActiveFilter, // Used to show correct empty state message
  onOpenCreate,
}) {
  if (skills.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <Award size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No skills found
          </h3>
          <p className="text-gray-500 mb-4">
            {hasActiveFilter
              ? "No skills match your current search criteria. Try different keywords or check all categories."
              : "Get started by creating your first skill to begin building your organization's skill taxonomy."}
          </p>
          {!hasActiveFilter && (
            <button
              onClick={onOpenCreate}
              className="bg-rscm-violet text-white px-4 py-2 rounded-lg hover:bg-rscm-plum transition-colors"
            >
              Create First Skill
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {viewMode === "grid" ? (
        // --- GRID VIEW ---
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div
              key={skill._id}
              className={cn(
                "border rounded-lg p-4 transition-all duration-200",
                skillsAwaitingDelete.has(skill._id)
                  ? "border-red-200 bg-red-50 shadow-md"
                  : "border-gray-100 hover:bg-gray-50"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-rscm-dark-purple mb-1">
                    {skill.name}
                  </h3>
                  {skill.category && (
                    <span
                      className="inline-block px-2 py-1 text-xs rounded-full text-white mb-2"
                      style={{ backgroundColor: RSCM_COLORS.plum }}
                    >
                      {skill.category}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              {skill.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {skill.description}
                </p>
              )}

              {skill.aliases && skill.aliases.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {skill.aliases.slice(0, 3).map((alias, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: `${RSCM_COLORS.lilac}15`,
                        color: RSCM_COLORS.plum,
                        border: `1px solid ${RSCM_COLORS.lilac}30`,
                      }}
                    >
                      {alias}
                    </span>
                  ))}
                  {skill.aliases.length > 3 && (
                    <span className="text-xs text-gray-500 font-medium">
                      +{skill.aliases.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-1"
                    style={{ color: RSCM_COLORS.violet }}
                  >
                    <Users size={14} />
                    <span>{skill.currentUsers}</span>
                  </div>
                  <div
                    className="flex items-center gap-1"
                    style={{ color: RSCM_COLORS.plum }}
                  >
                    <TrendingUp size={14} />
                    <span>{skill.desiredUsers}</span>
                  </div>
                </div>

                {skillsAwaitingDelete.has(skill._id) ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDelete(skill._id, skill.name, true)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      title="Confirm delete"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => onCancelDelete(skill._id)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                      title="Cancel delete"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onDelete(skill._id, skill.name)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Delete skill"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // --- LIST VIEW ---
        <div className="space-y-3">
          {skills.map((skill) => (
            <div
              key={skill._id}
              className={cn(
                "border rounded-lg p-4 transition-all duration-200",
                skillsAwaitingDelete.has(skill._id)
                  ? "border-red-200 bg-red-50 shadow-md"
                  : "border-gray-100 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-rscm-dark-purple">
                      {skill.name}
                    </h3>
                    {skill.category && (
                      <span
                        className="px-2 py-1 text-xs rounded-full text-white"
                        style={{ backgroundColor: RSCM_COLORS.plum }}
                      >
                        {skill.category}
                      </span>
                    )}
                  </div>

                  {skill.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {skill.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div
                      className="flex items-center gap-1"
                      style={{ color: RSCM_COLORS.violet }}
                    >
                      <Users size={14} />
                      <span>{skill.currentUsers} have it</span>
                    </div>
                    <div
                      className="flex items-center gap-1"
                      style={{ color: RSCM_COLORS.plum }}
                    >
                      <TrendingUp size={14} />
                      <span>{skill.desiredUsers} want it</span>
                    </div>
                    {skill.aliases && skill.aliases.length > 0 && (
                      <span>{skill.aliases.length} aliases</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {skillsAwaitingDelete.has(skill._id) ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDelete(skill._id, skill.name, true)}
                        className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Confirm delete"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => onCancelDelete(skill._id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                        title="Cancel delete"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onDelete(skill._id, skill.name)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete skill"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
