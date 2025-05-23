"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
        //process user response
        if (!usersResponse.ok) {
          const errData = await usersResponse.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch user count: ${usersResponse.statusText} (${usersResponse.status})`
          );
        }
        const usersResult = await usersResponse.json();
        fetchedUserCount = usersResult.data?.count || usersResult.count || 0;
        //process projects response
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
        //process overall allocation
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
        // Process Skill Distribution Data
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
          console.warn("Failed to fetch skill distribution data.");
        }
      } catch (err) {
        console.error("Error fetching HR/Admin summary data:", err);
        setSummaryError(err.message || "Could not load HR/Admin summary data.");

        fetchedUserCount = 0;
        fetchedProjectCount = 0;
        fetchedCapacityUtilization = 0;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">HR / Admin Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingSummary ? (
          <div className="flex flex-col items-center justify-center p-6 min-h-[200px]">
            <LoadingSpinner size={20} />
            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
              Loading overview...
            </p>
          </div>
        ) : summaryError ? (
          <div className="flex items-center p-3 text-sm rounded-[var(--radius)] bg-red-50 text-red-700 border border-red-200 shadow-sm">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <span>{summaryError}</span>
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
            <div className="pt-3 border-t border-[rgb(var(--border))] mt-3"></div>{" "}
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
                className="font-semibold text-[rgb(var(--foreground))] truncate max-w-[150px]"
                title={mostCommonSkill.name}
              >
                {mostCommonSkill.name} ({mostCommonSkill.count})
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-[rgb(var(--muted-foreground))]">
                <Star size={16} className="mr-2 text-sky-500" /> Most Desired
                Skill:
              </span>
              <span
                className="font-semibold text-[rgb(var(--foreground))] truncate max-w-[150px]"
                title={mostDesiredSkill.name}
              >
                {mostDesiredSkill.name} ({mostDesiredSkill.count})
              </span>
            </div>
            <div className="pt-4 border-t border-[rgb(var(--border))] mt-4 flex flex-wrap gap-x-4 gap-y-2">
              <Link
                href="/admin/users"
                className="text-sm text-[rgb(var(--primary))] hover:underline font-medium"
              >
                Manage Users
              </Link>
              <Link
                href="/admin/skills"
                className="text-sm text-[rgb(var(--primary))] hover:underline font-medium"
              >
                Manage Skills
              </Link>
              <Link
                href="/admin/settings"
                className="text-sm text-[rgb(var(--primary))] hover:underline font-medium"
              >
                System Settings
              </Link>
              <Link
                href="/projects"
                className="text-sm text-[rgb(var(--primary))] hover:underline font-medium"
              >
                View All Projects
              </Link>
              <Link
                href="/admin/analytics"
                className="text-sm text-[rgb(var(--primary))] hover:underline font-medium"
              >
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
