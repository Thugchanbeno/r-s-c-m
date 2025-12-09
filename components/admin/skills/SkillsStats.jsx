"use client";
import { Award, Tag, Users, TrendingUp } from "lucide-react";
import { RSCM_COLORS } from "@/components/charts/ChartComponents";

export default function SkillsStats({ skills, categories }) {
  // Calculate totals from the enriched skills list
  const totalCurrentUsers = skills.reduce(
    (sum, skill) => sum + (skill.currentUsers || 0),
    0
  );
  const totalDesiredUsers = skills.reduce(
    (sum, skill) => sum + (skill.desiredUsers || 0),
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rscm-violet/10">
            <Award size={20} className="text-rscm-violet" />
          </div>
          <div>
            <div className="text-2xl font-bold text-rscm-dark-purple">
              {skills.length}
            </div>
            <div className="text-sm text-gray-600">Total Skills</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rscm-plum/10">
            <Tag size={20} className="text-rscm-plum" />
          </div>
          <div>
            <div className="text-2xl font-bold text-rscm-dark-purple">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${RSCM_COLORS.violet}10` }}
          >
            <Users size={20} style={{ color: RSCM_COLORS.violet }} />
          </div>
          <div>
            <div className="text-2xl font-bold text-rscm-dark-purple">
              {totalCurrentUsers}
            </div>
            <div className="text-sm text-gray-600">Current Users</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${RSCM_COLORS.plum}10` }}
          >
            <TrendingUp size={20} style={{ color: RSCM_COLORS.plum }} />
          </div>
          <div>
            <div className="text-2xl font-bold text-rscm-dark-purple">
              {totalDesiredUsers}
            </div>
            <div className="text-sm text-gray-600">Skill Requests</div>
          </div>
        </div>
      </div>
    </div>
  );
}
