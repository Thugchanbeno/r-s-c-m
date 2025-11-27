"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  PlusCircle,
  UserCheck,
  Clock,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import GradientScoreBar from "./GradientScoreBar";
import RecommendationFeedback from "./RecommendationFeedback";
import { RSCM_COLORS } from "@/components/charts/ChartComponents";

const RecommendedUserCard = (props) => {
  const { projectId, onInitiateRequest } = props;

  // Handle both prop structures
  const user = props.user || props.userRecommendation;

  if (!user) return null;

  // 1. DIRECT MAPPING (Trust the Backend V4 0-100 Scale)
  const {
    _id,
    name,
    role,
    avatarUrl,
    totalScore, // Backend sends e.g. 76.8
    breakdown,
    explanation,
    missingSkills,
    department,
  } = user;

  // 2. Simple Rounding (No auto-detection magic)
  const displayScore = Math.round(totalScore || 0);
  const skillsScore = Math.round(breakdown?.skillMatch || 0);
  const availScore = Math.round(breakdown?.availability || 0);
  const growthScore = Math.round(breakdown?.growthPotential || 0);

  // 3. Format Lists
  let explanationPoints = [];
  if (Array.isArray(explanation)) explanationPoints = explanation;
  else if (typeof explanation === "string") explanationPoints = [explanation];

  const skillGaps = Array.isArray(missingSkills) ? missingSkills : [];

  // 4. Create Request Object
  const userToRequest = { _id, name, ...user };
  const generatedAt = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      <Card className="h-full flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 pb-0 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="relative h-10 w-10 flex-shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name || "User"}
                  fill
                  className="rounded-full object-cover border border-gray-100"
                  sizes="40px"
                />
              ) : (
                <div
                  className="h-full w-full rounded-full flex items-center justify-center border border-gray-100"
                  style={{ backgroundColor: `${RSCM_COLORS.lilac}20` }}
                >
                  <UserCheck size={18} style={{ color: RSCM_COLORS.violet }} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate text-gray-900 leading-tight">
                {name || "Unnamed"}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                <Briefcase size={10} />
                <span className="truncate max-w-[120px]">
                  {role || "Team Member"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Badge
              variant="secondary"
              className="text-[10px] font-bold px-1.5 h-5 bg-gray-100 text-gray-600 border-gray-200"
            >
              {department || "General"}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 space-y-4 flex-grow flex flex-col">
          {/* Match Strength Bar */}
          <div className="mt-1">
            {/* Passing explicit 0-100 integer */}
            <GradientScoreBar score={displayScore} label="Match Strength" />
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-2 border-t border-b border-gray-50 py-3">
            <div className="flex flex-col items-center text-center p-1.5 bg-gray-50/50 rounded-lg">
              <span className="text-[9px] uppercase text-gray-400 font-bold mb-0.5">
                Skills
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: RSCM_COLORS.darkPurple }}
              >
                {skillsScore}%
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-1.5 bg-gray-50/50 rounded-lg">
              <span className="text-[9px] uppercase text-gray-400 font-bold mb-0.5">
                Avail
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: RSCM_COLORS.darkPurple }}
              >
                {availScore}%
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-1.5 bg-gray-50/50 rounded-lg">
              <span className="text-[9px] uppercase text-gray-400 font-bold mb-0.5">
                Growth
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: RSCM_COLORS.darkPurple }}
              >
                {growthScore}%
              </span>
            </div>
          </div>

          {/* Analysis Text */}
          <div className="space-y-3 flex-grow">
            {explanationPoints.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">
                  Analysis
                </h4>
                <ul className="space-y-1.5">
                  {explanationPoints.slice(0, 3).map((point, index) => (
                    <li
                      key={index}
                      className="text-[11px] text-gray-600 flex items-start gap-2 leading-snug"
                    >
                      <span
                        className="mt-1.5 h-1 w-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: RSCM_COLORS.plum }}
                      />
                      <span className="line-clamp-3">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gaps */}
            {skillGaps.length > 0 ? (
              <div className="pt-1">
                <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-2 flex items-center gap-1">
                  <AlertCircle size={10} className="text-red-400" /> Skill Gaps
                </h4>
                <div className="flex flex-wrap gap-1">
                  {skillGaps.slice(0, 3).map((gap, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-5 bg-gray-50 text-gray-600 border-gray-200 font-normal"
                    >
                      {typeof gap === "string"
                        ? gap
                        : gap.name || gap.skillName || "?"}
                    </Badge>
                  ))}
                  {skillGaps.length > 3 && (
                    <span className="text-[10px] text-gray-400 self-center ml-1">
                      +{skillGaps.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="pt-2 flex items-center gap-1.5 text-green-600">
                <UserCheck size={14} />
                <span className="text-[11px] font-medium">Perfect Match</span>
              </div>
            )}
          </div>
        </CardContent>

        {/* Footer */}
        <div className="mt-auto border-t border-gray-100 p-4 bg-gray-50/30 space-y-3">
          <Button
            onClick={() => onInitiateRequest(userToRequest)}
            className="w-full flex items-center justify-center gap-2 h-9 text-xs font-semibold text-white shadow-sm transition-all hover:scale-[1.02] active:scale-95"
            style={{ backgroundColor: RSCM_COLORS.violet }}
          >
            <PlusCircle size={14} />
            Request {name ? name.split(" ")[0] : "User"}
          </Button>
          <div className="flex justify-between items-center pt-1">
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock size={10} />
              <span>Generated {generatedAt}</span>
            </div>
            {_id && (
              <RecommendationFeedback projectId={projectId} userId={_id} />
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default RecommendedUserCard;
