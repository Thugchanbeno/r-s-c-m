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
} from "lucide-react";
import Badge from "@/components/common/Badge";
import { getAllocationPercentageColor } from "@/components/common/skillcolors";

const HrAdminDashboardSummary = ({ user }) => {
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [totalProjectCount, setTotalProjectCount] = useState(0);
  const [overallCapacityUtilization, setOverallCapacityUtilization] =
    useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    const fetchHrSummaryData = async () => {
      setLoadingSummary(true);
      setSummaryError(null);
      let fetchedUserCount = 0;
      let fetchedProjectCount = 0;
      let fetchedCapacityUtilization = 0;

      try {
        const [usersResponse, projectsResponse, overallAllocationResponse] =
          await Promise.all([
            fetch(`/api/users?countOnly=true`),
            fetch(`/api/projects?countOnly=true`),
            fetch(`/api/allocations/summary?scope=overall`),
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
          <div className="flex flex-col items-center justify-center p-6 min-h-[150px]">
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
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HrAdminDashboardSummary;
