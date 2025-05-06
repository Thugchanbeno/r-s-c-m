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
import { Users, Briefcase, Activity, Settings } from "lucide-react";

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
            // Fetch total project count
            fetch(`/api/projects?countOnly=true`),
            // TODO: Fetch overall allocation summary when API exists
            // fetch(`/api/allocations/summary?scope=overall`),
            // Promise.resolve({ ok: true, json: async () => ({ data: { overallAverageAllocation: 0 } }) })
          ]);

        if (!usersResponse.ok) {
          const errData = await usersResponse.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch user count: ${usersResponse.statusText}`
          );
        }
        const usersResult = await usersResponse.json();
        fetchedUserCount = usersResult.count || 0;

        if (!projectsResponse.ok) {
          const errData = await projectsResponse.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch project count: ${projectsResponse.statusText}`
          );
        }
        const projectsResult = await projectsResponse.json();
        fetchedProjectCount = projectsResult.count || 0;

        // Process Allocation Response (when implemented)
        // if (!allocationResponse.ok) { ... }
        // const allocationResult = await allocationResponse.json();
        // fetchedAllocation = allocationResult.data?.overallAverageAllocation || 0;
      } catch (err) {
        console.error("Error fetching HR/Admin summary data:", err);
        fetchError = "Could not load HR/Admin summary data.";
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
        <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-900">
          HR / Admin Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <LoadingSpinner size={15} />
          </div>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600 dark:text-gray-900">
                <Users size={16} className="mr-2" /> Total Users:
              </span>
              <span className="font-semibold">{totalUserCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600 dark:text-gray-900">
                <Briefcase size={16} className="mr-2" /> Total Projects:
              </span>
              <span className="font-semibold">{totalProjectCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600 dark:text-gray-900">
                <Activity size={16} className="mr-2 text-green-500" /> Overall
                Allocation % (Avg):
              </span>
              <span className="font-semibold">{overallAllocation}%</span>{" "}
              {/* Placeholder */}
            </div>
            <div className="pt-3 space-x-3 border-t dark:border-gray-700 mt-4">
              <Link
                href="/admin/users"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Manage Users
              </Link>
              <Link
                href="/admin/skills"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Manage Skills
              </Link>
              <Link
                href="/admin/settings"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                System Settings
              </Link>
              <Link
                href="/projects"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
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
