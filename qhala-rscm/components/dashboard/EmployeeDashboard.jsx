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
import Badge from "@/components/common/Badge";
import {
  Briefcase,
  GraduationCap,
  AlertCircle,
  Activity as CapacityIcon,
} from "lucide-react";
import { getAllocationPercentageColor } from "@/components/common/skillcolors";

const EmployeeDashboardSummary = ({ user }) => {
  // State for this component's specific data
  const [projectCount, setProjectCount] = useState(0);
  const [currentSkillCount, setCurrentSkillCount] = useState(0);
  const [capacitySummary, setCapacitySummary] = useState({
    percentage: 0,
    hours: 0,
    count: 0,
    standardHours: 40,
  });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    const fetchEmployeeSummaryData = async () => {
      if (!user?.id) {
        setLoadingSummary(false);
        setSummaryError("User information not available to load summary.");
        return;
      }

      setLoadingSummary(true);
      setSummaryError(null);

      try {
        const [allocationSummaryResponse, userSkillsResponse] =
          await Promise.all([
            fetch(`/api/users/${user.id}/allocation-summary`),
            fetch(`/api/userskills?userId=${user.id}&currentCountOnly=true`),
          ]);
        if (!allocationSummaryResponse.ok) {
          const errData = await allocationSummaryResponse
            .json()
            .catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch allocation summary: ${allocationSummaryResponse.statusText} (${allocationSummaryResponse.status})`
          );
        }
        const allocResult = await allocationSummaryResponse.json();
        if (allocResult.success && allocResult.data) {
          setProjectCount(allocResult.data.activeAllocationCount || 0);
          setCapacitySummary({
            percentage: allocResult.data.totalCurrentCapacityPercentage,
            hours: allocResult.data.totalAllocatedHours,
            count: allocResult.data.activeAllocationCount,
            standardHours: allocResult.data.standardWorkWeekHours,
          });
        } else {
          throw new Error(
            allocResult.error || "Invalid allocation summary data received."
          );
        }

        if (!userSkillsResponse.ok) {
          const errData = await userSkillsResponse.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch skill count: ${userSkillsResponse.statusText} (${userSkillsResponse.status})`
          );
        }
        const skillsResult = await userSkillsResponse.json();
        setCurrentSkillCount(
          skillsResult.data?.currentSkillCount ||
            skillsResult.currentSkillCount ||
            0
        );
      } catch (err) {
        console.error("Error fetching employee summary data:", err);
        setSummaryError(err.message || "Could not load summary data.");
        setProjectCount(0);
        setCurrentSkillCount(0);
        setCapacitySummary({
          percentage: 0,
          hours: 0,
          count: 0,
          standardHours: 40,
        });
      } finally {
        setLoadingSummary(false);
      }
    };

    if (user?.id) {
      fetchEmployeeSummaryData();
    } else {
      setLoadingSummary(false);
    }
  }, [user?.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">My Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingSummary ? (
          <div className="flex flex-col items-center justify-center p-6 min-h-[150px]">
            <LoadingSpinner size={20} />
            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
              Loading summary...
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
                <Briefcase
                  size={16}
                  className="mr-2 text-[rgb(var(--primary))]"
                />
                Active Projects Assigned:
              </span>
              <span className="font-semibold text-[rgb(var(--foreground))]">
                {projectCount}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-[rgb(var(--muted-foreground))]">
                <GraduationCap
                  size={16}
                  className="mr-2 text-[rgb(var(--primary))]"
                />
                Current Skills Listed:
              </span>
              <span className="font-semibold text-[rgb(var(--foreground))]">
                {currentSkillCount}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-[rgb(var(--muted-foreground))]">
                <CapacityIcon
                  size={16}
                  className="mr-2 text-[rgb(var(--primary))]"
                />
                Current Capacity:
              </span>
              <Badge
                size="sm"
                pill={true}
                className={getAllocationPercentageColor(
                  capacitySummary.percentage
                )}
              >
                {capacitySummary.percentage}%
              </Badge>
            </div>
            {capacitySummary.percentage > 0 && (
              <p className="text-xs text-right text-[rgb(var(--muted-foreground))] -mt-2">
                ({capacitySummary.hours}h / {capacitySummary.standardHours}h
                this week)
              </p>
            )}

            <div className="pt-3 border-t border-[rgb(var(--border))] mt-4">
              <Link
                href="/profile"
                className="text-sm text-[rgb(var(--primary))] hover:underline font-medium"
              >
                View/Edit My Profile & Skills &rarr;
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeDashboardSummary;
