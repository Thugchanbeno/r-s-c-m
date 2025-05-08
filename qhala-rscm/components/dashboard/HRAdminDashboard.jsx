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
import { Users, Briefcase, Activity, AlertCircle } from "lucide-react";

const HrAdminDashboardSummary = ({ user }) => {
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [totalProjectCount, setTotalProjectCount] = useState(0);
  const [overallAllocation, setOverallAllocation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHrSummaryData = async () => {
      setLoading(true);
      setError(null);
      let fetchedUserCount = 0;
      let fetchedProjectCount = 0;
      let fetchedAllocation = 0;
      let fetchError = null;

      try {
        const [usersResponse, projectsResponse /*, allocationResponse */] =
          await Promise.all([
            fetch(`/api/users?countOnly=true`),
            fetch(`/api/projects?countOnly=true`),
            // Placeholder for allocation API - ensure it resolves if commented out
            // For now, let's assume it's not ready and we'll keep allocation at 0
            // Promise.resolve({ ok: true, json: async () => ({ data: { overallAverageAllocation: 0 } }) })
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

        // TODO: Process Allocation Response when API is ready
        // if (allocationResponse && !allocationResponse.ok) { ... }
        // const allocationResult = await allocationResponse.json();
        // fetchedAllocation = allocationResult.data?.overallAverageAllocation || 0;
      } catch (err) {
        console.error("Error fetching HR/Admin summary data:", err);
        fetchError = err.message || "Could not load HR/Admin summary data.";
      } finally {
        setTotalUserCount(fetchedUserCount);
        setTotalProjectCount(fetchedProjectCount);
        setOverallAllocation(fetchedAllocation);
        setError(fetchError);
        setLoading(false);
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
        {loading ? (
          <div className="flex flex-col items-center justify-center p-6 min-h-[150px]">
            <LoadingSpinner size={20} />
            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
              Loading overview...
            </p>
          </div>
        ) : error ? (
          <div className="flex items-center p-3 text-sm rounded-[var(--radius)] bg-red-50 text-red-700 border border-red-200 shadow-sm">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-[rgb(var(--muted-foreground))]">
                <Users size={16} className="mr-2 text-[rgb(var(--primary))]" />{" "}
                Total Users:
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
                />{" "}
                Total Projects:
              </span>
              <span className="font-semibold text-[rgb(var(--foreground))]">
                {totalProjectCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-[rgb(var(--muted-foreground))]">
                <Activity size={16} className="mr-2 text-emerald-500" /> Overall
                Allocation % (Avg):
              </span>
              <span className="font-semibold text-[rgb(var(--foreground))]">
                {overallAllocation}%
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
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HrAdminDashboardSummary;
