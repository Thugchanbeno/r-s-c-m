"use client";
import { Award, Target, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";

const SkillsSectionNew = ({ 
  currentSkills = [], 
  desiredSkills = [],
  pendingVerifications = [],
  onEditCurrent,
  onEditDesired 
}) => {
  const getSkillLevelColor = (level) => {
    if (level >= 4) return "bg-rscm-violet text-white";
    if (level >= 3) return "bg-rscm-plum text-white";
    if (level >= 2) return "bg-rscm-lilac text-white";
    return "bg-gray-200 text-gray-700";
  };

  const getSkillLevelName = (level) => {
    const levels = {
      1: "Beginner",
      2: "Intermediate", 
      3: "Advanced",
      4: "Expert",
      5: "Master"
    };
    return levels[level] || "Unknown";
  };

  return (
    <div className="space-y-6">
      {/* Current Skills Card */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rscm-violet/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-rscm-violet" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-rscm-dark-purple">
                Current Skills
              </h2>
              <p className="text-xs text-gray-500">
                {currentSkills.length} skill{currentSkills.length !== 1 ? 's' : ''} verified
              </p>
            </div>
          </div>
          <button
            onClick={onEditCurrent}
            className="px-4 py-2 text-sm font-medium text-rscm-violet hover:bg-rscm-violet hover:text-white border border-rscm-violet rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Skills
          </button>
        </div>

        <div className="p-6">
          {currentSkills.length === 0 ? (
            <div className="text-center py-12">
              <Award size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 mb-2">No skills added yet</p>
              <p className="text-xs text-gray-400">
                Start building your profile by adding your current skills
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentSkills.map((skill) => (
                <div
                  key={skill._id}
                  className="group p-3 rounded-lg bg-gray-50 hover:bg-rscm-dutch-white/30 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-rscm-dark-purple">
                        {skill.skillId?.name || "Unknown Skill"}
                      </h3>
                      {skill.skillId?.category && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {skill.skillId.category}
                        </p>
                      )}
                    </div>
                    {skill.isVerified ? (
                      <CheckCircle size={16} className="text-rscm-violet flex-shrink-0" />
                    ) : (
                      <Clock size={16} className="text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSkillLevelColor(skill.proficiency)}`}>
                      {getSkillLevelName(skill.proficiency)}
                    </span>
                    {skill.yearsOfExperience && (
                      <span className="text-xs text-gray-500">
                        {skill.yearsOfExperience}y exp
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending Verifications */}
      {pendingVerifications && pendingVerifications.length > 0 && (
        <div className="bg-rscm-lilac/10 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-rscm-plum flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-sm text-rscm-dark-purple mb-1">
                Pending Skill Verifications
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                {pendingVerifications.length} skill{pendingVerifications.length !== 1 ? 's' : ''} awaiting line manager approval
              </p>
              <div className="flex flex-wrap gap-2">
                {pendingVerifications.slice(0, 5).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white rounded text-xs text-rscm-dark-purple shadow-sm"
                  >
                    {skill.skillId?.name || "Unknown"}
                  </span>
                ))}
                {pendingVerifications.length > 5 && (
                  <span className="px-2 py-1 text-xs text-gray-500">
                    +{pendingVerifications.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desired Skills Card */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rscm-plum/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-rscm-plum" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-rscm-dark-purple">
                Desired Skills
              </h2>
              <p className="text-xs text-gray-500">
                Skills you want to learn or improve
              </p>
            </div>
          </div>
          <button
            onClick={onEditDesired}
            className="px-4 py-2 text-sm font-medium text-rscm-plum hover:bg-rscm-plum hover:text-white border border-rscm-plum rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Goals
          </button>
        </div>

        <div className="p-6">
          {desiredSkills.length === 0 ? (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 mb-2">No learning goals set</p>
              <p className="text-xs text-gray-400">
                Add skills you want to develop for career growth
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {desiredSkills.map((skill) => (
                <div
                  key={skill._id}
                  className="px-3 py-2 rounded-lg bg-rscm-plum/10 hover:bg-rscm-plum/20 transition-colors"
                >
                  <span className="text-sm font-medium text-rscm-dark-purple">
                    {skill.skillId?.name || "Unknown Skill"}
                  </span>
                  {skill.skillId?.category && (
                    <span className="text-xs text-gray-500 ml-2">
                      · {skill.skillId.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsSectionNew;
