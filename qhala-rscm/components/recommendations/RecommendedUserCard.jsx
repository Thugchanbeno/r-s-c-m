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
  TrendingUp,
  AlertTriangle,
  Info,
  PlusCircle,
  Zap,
  CalendarCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  getMatchScoreColorClasses,
  getScoreRatingText,
} from "@/components/common/CustomColors";
import EnhancedScoreBar from "./Scorebar";
import { cn } from "@/lib/utils";

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
    avatarUrl,
  } = userRecommendation;

  const userToRequest = {
    _id: userId,
    name: name,
    ...userRecommendation,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col bg-[rgb(var(--card))] rounded-[var(--radius)]">
        <CardHeader
          className={cn(
            "pb-3 pt-5 px-5",
            "bg-gradient-to-r from-[rgb(var(--card-gradient-start,var(--primary-accent-background)))] to-[rgb(var(--card-gradient-end,var(--muted)))]"
          )}
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={name || "User avatar"}
                    fill
                    sizes="(max-width: 640px) 48px, 56px"
                    className="rounded-full object-cover border-2 border-[rgb(var(--background))]"
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-[rgb(var(--muted))] flex items-center justify-center border-2 border-[rgb(var(--background))]">
                    <UserCheck
                      size={24}
                      className="text-[rgb(var(--muted-foreground))]"
                    />
                  </div>
                )}
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">
                  {name || "Unnamed User"}
                </CardTitle>
                {title && (
                  <p className="text-xs text-[rgb(var(--muted-foreground))] -mt-0.5">
                    {title}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onInitiateRequest(userToRequest)}
              className="mt-2 sm:mt-0 flex-shrink-0 group self-start sm:self-center"
            >
              <PlusCircle
                size={16}
                className="mr-1.5 transition-transform duration-200 group-hover:rotate-90"
              />
              Request
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4 flex-grow">
          <div>
            <EnhancedScoreBar
              score={score}
              label="Overall Recommendation Score"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 text-xs border-t border-[rgb(var(--border))] pt-4">
            {[
              {
                id: "skillMatch",
                value: skillMatch,
                label: "Skill Match",
                icon: Zap,
                iconColor: "text-blue-500",
              },
              {
                id: "availability",
                value: availability,
                label: "Availability",
                icon: CalendarCheck,
                iconColor: "text-teal-500",
              },
              {
                id: "growthOpportunity",
                value: growthOpportunity,
                label: "Growth Fit",
                icon: Sparkles,
                iconColor: "text-purple-500",
              },
            ].map((metric) => {
              const MetricIcon = metric.icon;
              return (
                <div
                  key={metric.id}
                  className="flex flex-col items-center text-center p-2.5 rounded-md bg-[rgb(var(--muted))]"
                >
                  <MetricIcon
                    size={18}
                    className={cn("mb-1", metric.iconColor)}
                  />
                  <span className="font-medium text-xs text-[rgb(var(--foreground))] mb-0.5">
                    {metric.label}
                  </span>
                  <span
                    className={`font-bold text-lg ${getMatchScoreColorClasses(
                      metric.value,
                      "text"
                    )}`}
                  >
                    {(metric.value * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>

          {(explanation?.length > 0 || skillGaps?.length > 0) && (
            <div className="space-y-3 pt-3">
              {explanation && explanation.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-[rgb(var(--muted-foreground))] mb-1.5 flex items-center">
                    <Info
                      size={14}
                      className="mr-1.5 text-[rgb(var(--muted-foreground))]"
                    />
                    Key Factors:
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 pl-1">
                    {explanation.slice(0, 3).map((point, index) => (
                      <li
                        key={index}
                        className="text-xs text-[rgb(var(--foreground))]"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {skillGaps && skillGaps.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-[rgb(var(--muted-foreground))] mb-1.5 flex items-center">
                    <AlertTriangle
                      size={14}
                      className="mr-1.5 text-[rgb(var(--warning))]"
                    />
                    Potential Skill Gaps:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {skillGaps.slice(0, 4).map((gap) => (
                      <Badge
                        key={gap.skillId || gap.name}
                        variant={
                          gap.isDesired ? "warning_outline" : "default_outline"
                        }
                        size="xs"
                        pill
                        className="text-xs"
                      >
                        {gap.name}
                        {gap.isDesired && " (Desired)"}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-5 border-t border-[rgb(var(--border))] bg-[rgb(var(--card))]">
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            Recommendation generated on {new Date().toLocaleDateString()}
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RecommendedUserCard;
