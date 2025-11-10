"use client";
import { useState } from "react";
import {
  Zap,
  CalendarCheck,
  Sparkles,
  Info,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";

const RecommendedUserCardNew = ({ userRecommendation, onInitiateRequest }) => {
  const {
    userId,
    name,
    score,
    skillMatch,
    availability,
    growthOpportunity,
    explanation,
    skillGaps,
    title,
    avatarUrl,
    department,
  } = userRecommendation;

  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score) => {
    const percentage = score * 100;
    if (percentage >= 80) return "text-green-700 bg-green-100";
    if (percentage >= 60) return "text-rscm-violet bg-rscm-lilac/20";
    if (percentage >= 40) return "text-yellow-700 bg-yellow-100";
    return "text-orange-700 bg-orange-100";
  };

  const getScoreBarColor = (score) => {
    const percentage = score * 100;
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-rscm-violet";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getScoreRating = (score) => {
    const percentage = score * 100;
    if (percentage >= 80) return "Excellent Match";
    if (percentage >= 60) return "Good Match";
    if (percentage >= 40) return "Fair Match";
    return "Low Match";
  };

  const percentage = Math.round((score || 0) * 100);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-rscm-violet/5 to-rscm-lilac/10 p-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Avatar */}
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={name || "User"}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-rscm-violet flex items-center justify-center border-2 border-white shadow-sm">
                <span className="text-lg font-semibold text-white">
                  {name?.[0] || "?"}
                </span>
              </div>
            )}

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-rscm-dark-purple">
                {name || "Unknown User"}
              </h3>
              {title && (
                <p className="text-xs text-gray-500">{title}</p>
              )}
              {department && (
                <p className="text-xs text-gray-500">{department}</p>
              )}
            </div>
          </div>

          {/* Request Button */}
          <button
            onClick={() => onInitiateRequest({ _id: userId, name, ...userRecommendation })}
            className="px-4 py-2 bg-rscm-violet text-white text-sm font-medium rounded-lg hover:bg-rscm-plum transition-colors flex-shrink-0"
          >
            Request
          </button>
        </div>
      </div>

      {/* Score Section */}
      <div className="p-5 space-y-4">
        {/* Overall Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Match Score
            </span>
            <span className={`text-sm font-semibold px-2 py-1 rounded ${getScoreColor(score)}`}>
              {getScoreRating(score)} ({percentage}%)
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getScoreBarColor(score)} transition-all duration-700 ease-out rounded-full`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Metric Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {/* Skill Match */}
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <Zap className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600 mb-1">Skill Match</p>
            <p className="text-lg font-bold text-blue-700">
              {Math.round((skillMatch || 0) * 100)}%
            </p>
          </div>

          {/* Availability */}
          <div className="bg-teal-50 rounded-lg p-3 text-center">
            <CalendarCheck className="w-5 h-5 text-teal-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600 mb-1">Availability</p>
            <p className="text-lg font-bold text-teal-700">
              {Math.round((availability || 0) * 100)}%
            </p>
          </div>

          {/* Growth Fit */}
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <Sparkles className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600 mb-1">Growth Fit</p>
            <p className="text-lg font-bold text-purple-700">
              {Math.round((growthOpportunity || 0) * 100)}%
            </p>
          </div>
        </div>

        {/* Expandable Details */}
        {(explanation?.length > 0 || skillGaps?.length > 0) && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between py-2 text-sm font-medium text-rscm-violet hover:text-rscm-plum transition-colors"
            >
              <span>View Details</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {isExpanded && (
              <div className="space-y-4 pt-3 border-t border-gray-100">
                {/* Key Factors */}
                {explanation?.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase mb-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      Key Factors
                    </h4>
                    <ul className="space-y-1">
                      {explanation.slice(0, 3).map((point, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                          <span className="text-rscm-violet mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skill Gaps */}
                {skillGaps?.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      Potential Skill Gaps
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {skillGaps.slice(0, 4).map((gap, index) => (
                        <span
                          key={gap.skillId || index}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            gap.isDesired
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {gap.name}
                          {gap.isDesired && " (Desired)"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Recommendation generated on {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default RecommendedUserCardNew;
