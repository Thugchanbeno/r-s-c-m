"use client";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/common/Card";
import {
  User,
  TrendingUp,
  AlertTriangle,
  Info,
  PlusCircle,
  Zap,
  CalendarCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  getMatchScoreColorClasses,
  getScoreRatingText,
} from "@/components/common/CustomColors";

// EnhancedScoreBar (can be here or imported if in separate file)
const EnhancedScoreBar = ({ score, label = "Overall Match" }) => {
  const percentage = Math.max(0, Math.min(1, score)) * 100;
  const barColorClass = getMatchScoreColorClasses(score, "bg");
  const ratingText = getScoreRatingText(score);
  const textColorClass = getMatchScoreColorClasses(score, "text");

  return (
    <div className="my-2">
      <div className="flex justify-between items-end mb-0.5">
        <span className="text-xs font-medium text-[rgb(var(--muted-foreground))]">
          {label}
        </span>
        <span className={`text-sm font-semibold ${textColorClass}`}>
          {ratingText} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 shadow-inner overflow-hidden">
        <div
          className={`${barColorClass} h-3 rounded-full transition-all duration-700 ease-out flex items-center justify-end`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const RecommendedUserCard = ({ userRecommendation, onInitiateRequest }) => {
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
  } = userRecommendation;

  const userToRequest = { _id: userId, name: name, ...userRecommendation };
  const overallScoreTextColor = getMatchScoreColorClasses(score, "text");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-3 pt-5 px-5 bg-gradient-to-r from-[rgb(var(--card-gradient-start))] to-[rgb(var(--card-gradient-end))]">
          {" "}
          {/* Example gradient */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
            <div>
              <CardTitle className="text-xl font-bold text-[rgb(var(--foreground))] flex items-center">
                <User size={22} className="mr-2.5 text-[rgb(var(--primary))]" />
                {name || "Unnamed User"}
              </CardTitle>
              {title && (
                <p className="text-xs text-[rgb(var(--muted-foreground))] ml-[34px] -mt-1">
                  {title}
                </p>
              )}
            </div>
            <Button
              variant="primary" // Make request button more prominent
              size="sm"
              onClick={() => onInitiateRequest(userToRequest)}
              className="mt-1 sm:mt-0 flex-shrink-0 group"
            >
              <PlusCircle
                size={16}
                className="mr-1.5 transition-transform duration-200 group-hover:rotate-90"
              />
              Request
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div>
            <EnhancedScoreBar
              score={score}
              label="Overall Recommendation Score"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 text-xs border-t border-[rgb(var(--border))] pt-4">
            <div className="flex flex-col items-center text-center p-2 rounded-md bg-[rgb(var(--muted))]">
              <Zap size={18} className="mb-1 text-blue-500" />
              <span className="font-medium text-[rgb(var(--foreground))]">
                Skill Match
              </span>
              <span
                className={`font-bold text-lg ${getMatchScoreColorClasses(
                  skillMatch,
                  "text"
                )}`}
              >
                {(skillMatch * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-md bg-[rgb(var(--muted))]">
              <CalendarCheck size={18} className="mb-1 text-teal-500" />
              <span className="font-medium text-[rgb(var(--foreground))]">
                Availability
              </span>
              <span
                className={`font-bold text-lg ${getMatchScoreColorClasses(
                  availability,
                  "text"
                )}`}
              >
                {(availability * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-md bg-[rgb(var(--muted))]">
              <Sparkles size={18} className="mb-1 text-purple-500" />
              <span className="font-medium text-[rgb(var(--foreground))]">
                Growth Fit
              </span>
              <span
                className={`font-bold text-lg ${getMatchScoreColorClasses(
                  growthOpportunity,
                  "text"
                )}`}
              >
                {(growthOpportunity * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {(explanation?.length > 0 || skillGaps?.length > 0) && (
            <div className="space-y-3 pt-3">
              {explanation && explanation.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-[rgb(var(--muted-foreground))] mb-1.5 flex items-center">
                    <Info size={14} className="mr-1.5" />
                    Key Factors:
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 pl-1">
                    {explanation.slice(0, 3).map(
                      (
                        point,
                        index // Show top 3 explanations
                      ) => (
                        <li
                          key={index}
                          className="text-xs text-[rgb(var(--foreground))]"
                        >
                          {point}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {skillGaps && skillGaps.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-[rgb(var(--muted-foreground))] mb-1.5 flex items-center">
                    <AlertTriangle
                      size={14}
                      className="mr-1.5 text-amber-500"
                    />
                    Potential Skill Gaps:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {skillGaps.slice(0, 4).map(
                      (
                        gap // Show top 4 gaps
                      ) => (
                        <Badge
                          key={gap.skillId}
                          variant={
                            gap.isDesired
                              ? "warning_outline"
                              : "default_outline"
                          }
                          size="xs"
                          pill
                          className="text-xs"
                        >
                          {gap.name}
                          {gap.isDesired && " (Desired)"}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        {/* Optional CardFooter if needed */}
        {/* <CardFooter className="p-5 border-t border-[rgb(var(--border))]">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">Recommendation generated on {new Date().toLocaleDateString()}</p>
        </CardFooter> */}
      </Card>
    </motion.div>
  );
};

export default RecommendedUserCard;
