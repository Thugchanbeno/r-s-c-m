"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/common/Card";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  Users,
  Briefcase,
  Activity,
  AlertCircle,
  TrendingUp,
  Wrench,
  Star,
} from "lucide-react";
import Badge from "@/components/common/Badge";
import { getAllocationPercentageColor } from "@/components/common/CustomColors";
import { cn } from "@/lib/utils";

const HrAdminDashboardSummary = ({ user }) => {
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [totalProjectCount, setTotalProjectCount] = useState(0);
  const [overallCapacityUtilization, setOverallCapacityUtilization] =
    useState(0);
  const [totalUniqueSkills, setTotalUniqueSkills] = useState(0);
  const [mostCommonSkill, setMostCommonSkill] = useState({
    name: "N/A",
    count: 0,
  });
  const [mostDesiredSkill, setMostDesiredSkill] = useState({
    name: "N/A",
    count: 0,
  });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    const fetchHrSummaryData = async () => {
      setLoadingSummary(true);
      setSummaryError(null);
      let fetchedUserCount = 0;
      let fetchedProjectCount = 0;
      let fetchedCapacityUtilization = 0;
      let fetchedTotalUniqueSkills = 0;
      let fetchedMostCommonSkill = { name: "N/A", count: 0 };
      let fetchedMostDesiredSkill = { name: "N/A", count: 0 };

      try {
        const [
          usersResponse,
          projectsResponse,
          overallAllocationResponse,
          skillDistributionResponse,
        ] = await Promise.all([
          fetch(`/api/users?countOnly=true`),
          fetch(`/api/projects?countOnly=true`),
          fetch(`/api/allocations/summary?scope=overall`),
          fetch(`/api/skills/distribution`),
        ]);

        if (!usersResponse.ok) {
          const errData = await usersResponse.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch user count: ${usersResponse.statusText} (${usersResponse.status})`
          );
        }
        const usersResult = await usersResponse.json();
        fetchedUserCount = usersResult.data?.count || usersResult.count || 0;

        if (!projectsResponse.ok) {
          const errData = await projectsResponse.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch project count: ${projectsResponse.statusText} (${projectsResponse.status})`
          );
        }
        const projectsResult = await projectsResponse.json();
        fetchedProjectCount =
          projectsResult.data?.count || projectsResult.count || 0;

        if (!overallAllocationResponse.ok) {
          const errData = await overallAllocationResponse
            .json()
            .catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch overall allocation summary: ${overallAllocationResponse.statusText} (${overallAllocationResponse.status})`
          );
        }
        const allocationSummaryResult = await overallAllocationResponse.json();
        if (allocationSummaryResult.success && allocationSummaryResult.data) {
          fetchedCapacityUtilization =
            allocationSummaryResult.data.overallAverageCapacityUtilization || 0;
        } else {
          throw new Error(
            allocationSummaryResult.error ||
              "Invalid overall allocation summary data."
          );
        }

        if (skillDistributionResponse.ok) {
          const skillDistResult = await skillDistributionResponse.json();
          if (skillDistResult.success && Array.isArray(skillDistResult.data)) {
            let uniqueSkills = 0;
            let commonSkill = { name: "N/A", count: -1 };
            let desiredSkill = { name: "N/A", count: -1 };

            skillDistResult.data.forEach((category) => {
              category.skills.forEach((skill) => {
                uniqueSkills++;
                if (skill.currentUserCount > commonSkill.count) {
                  commonSkill = {
                    name: skill.name,
                    count: skill.currentUserCount,
                  };
                }
                if (skill.desiredUserCount > desiredSkill.count) {
                  desiredSkill = {
                    name: skill.name,
                    count: skill.desiredUserCount,
                  };
                }
              });
            });
            fetchedTotalUniqueSkills = uniqueSkills;
            fetchedMostCommonSkill =
              commonSkill.count > -1 ? commonSkill : { name: "N/A", count: 0 };
            fetchedMostDesiredSkill =
              desiredSkill.count > -1
                ? desiredSkill
                : { name: "N/A", count: 0 };
          } else {
            console.warn("Invalid skill distribution data format.");
          }
        } else {
          console.warn(
            `Failed to fetch skill distribution data: ${skillDistributionResponse.statusText} (${skillDistributionResponse.status})`
          );
        }
      } catch (err) {
        // Corrected this line
        console.error("Error fetching HR/Admin summary data:", err);
        setSummaryError(err.message || "Could not load HR/Admin summary data.");
        fetchedUserCount = 0;
        fetchedProjectCount = 0;
        fetchedCapacityUtilization = 0;
        fetchedTotalUniqueSkills = 0;
        fetchedMostCommonSkill = { name: "N/A", count: 0 };
        fetchedMostDesiredSkill = { name: "N/A", count: 0 };
      } finally {
        setTotalUserCount(fetchedUserCount);
        setTotalProjectCount(fetchedProjectCount);
        setOverallCapacityUtilization(fetchedCapacityUtilization);
        setTotalUniqueSkills(fetchedTotalUniqueSkills);
        setMostCommonSkill(fetchedMostCommonSkill);
        setMostDesiredSkill(fetchedMostDesiredSkill);
        setLoadingSummary(false);
      }
    };
    fetchHrSummaryData();
  }, []);

  const dashboardLinkStyles = cn(
    "inline-block text-sm font-medium",
    "bg-[rgb(var(--qhala-dark-navy))] text-[rgb(var(--accent))]",
    "hover:text-[rgb(var(--qhala-soft-peach-darker))]",
    "px-3 py-1.5",
    "rounded-[var(--radius)]",
    "transition-colors duration-150 ease-in-out",
    "shadow-sm"
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className={cn("shadow-sm bg-[rgb(var(--accent))] p-4")}>
        <CardTitle
          className={cn(
            "flex items-center gap-2 text-lg font-semibold text-[rgb(var(--accent-foreground))] md:text-xl"
          )}
        >
          <Activity
            size={22}
            className="text-[rgb(var(--accent-foreground))]"
          />
          HR / Admin Overview
        </CardTitle>
        <CardDescription
          className={cn(
            "mt-1 text-sm text-[rgb(var(--accent-foreground))] opacity-90"
          )}
        >
          Key metrics and insights for human resources and administration.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("p-5 md:p-6")}>
        {loadingSummary ? (
          <div className="flex flex-col items-center justify-center p-6 min-h-[200px]">
            <LoadingSpinner size={20} />
            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
              Loading overview...
            </p>
          </div>
        ) : summaryError ? (
          <div
            className={cn(
              "flex items-center p-4 rounded-lg text-sm shadow-sm",
              "bg-[rgb(var(--destructive))]/15",
              "text-[rgb(var(--destructive))]",
              "border border-[rgb(var(--destructive))]/40"
            )}
          >
            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            <span className="font-medium">{summaryError}</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-[rgb(var(--muted-foreground))]">
                <Users size={16} className="mr-2 text-[rgb(var(--primary))]" />
                Total Active Users:
              </span>
              <span className="font-semibold text-[rgb(var(--foreground))]">
                {totalUserCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-[rgb(var(--muted-foreground))]">
                <Briefcase
                  size={16}
                  className="mr-2 text-[rgb(var(--primary))]"
                />
                Total Active Projects:
              </span>
              <span className="font-semibold text-[rgb(var(--foreground))]">
                {totalProjectCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-[rgb(var(--muted-foreground))]">
                <TrendingUp size={16} className="mr-2 text-emerald-500" />
                Overall Capacity Utilization:
              </span>
              <Badge
                size="sm"
                pill={true}
                className={getAllocationPercentageColor(
                  overallCapacityUtilization
                )}
              >
                {overallCapacityUtilization}%
              </Badge>
            </div>

            <div className="pt-3 mt-3 border-t border-[rgb(var(--border))]"></div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-[rgb(var(--muted-foreground))]">
                <Wrench size={16} className="mr-2 text-purple-500" /> Total
                Unique Skills:
              </span>
              <span className="font-semibold text-[rgb(var(--foreground))]">
                {totalUniqueSkills}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-[rgb(var(--muted-foreground))]">
                <Star size={16} className="mr-2 text-amber-500" /> Most Common
                Skill:
              </span>
              <span
                className="font-semibold text-[rgb(var(--foreground))] truncate max-w-[150px] sm:max-w-[200px]"
                title={mostCommonSkill.name}
              >
                {mostCommonSkill.name}{" "}
                {mostCommonSkill.count > 0 ? `(${mostCommonSkill.count})` : ""}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-[rgb(var(--muted-foreground))]">
                <Star size={16} className="mr-2 text-sky-500" /> Most Desired
                Skill:
              </span>
              <span
                className="font-semibold text-[rgb(var(--foreground))] truncate max-w-[150px] sm:max-w-[200px]"
                title={mostDesiredSkill.name}
              >
                {mostDesiredSkill.name}{" "}
                {mostDesiredSkill.count > 0
                  ? `(${mostDesiredSkill.count})`
                  : ""}
              </span>
            </div>

            <div className="pt-4 mt-4 border-t border-[rgb(var(--border))] flex flex-wrap gap-2">
              <Link href="/admin/users" className={dashboardLinkStyles}>
                Manage Users
              </Link>
              <Link href="/admin/skills" className={dashboardLinkStyles}>
                Manage Skills
              </Link>
              <Link href="/admin/settings" className={dashboardLinkStyles}>
                System Settings
              </Link>
              <Link href="/projects" className={dashboardLinkStyles}>
                View All Projects
              </Link>
              <Link href="/admin/analytics" className={dashboardLinkStyles}>
                View Skill Analytics
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HrAdminDashboardSummary;
