"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/common/Card";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Briefcase, Users, AlertTriangle } from "lucide-react";

const PmDashboardSummary = ({ user }) => {
  const [managedProjectCount, setManagedProjectCount] = useState(0);
  const [totalAllocatedResources, setTotalAllocatedResources] = useState(0);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPmSummaryData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      let fetchedProjectCount = 0;
      let fetchedResourceCount = 0;
      let fetchError = null;

      try {
        const [projectsResponse, resourcesResponse /*, requestsResponse */] =
          await Promise.all([
            fetch(`/api/projects?pmId=${user.id}&countOnly=true`),
            fetch(`/api/allocations/summary?pmId=${user.id}`),
            // TODO: Fetch pending request count when API exists
            // Promise.resolve({ ok: true, json: async () => ({ count: 0 }) }) // Placeholder promise needs review
          ]);

        if (!projectsResponse.ok) {
          const errData = await projectsResponse.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch managed project count: ${projectsResponse.statusText}`
          );
        }
        const projectsResult = await projectsResponse.json();
        fetchedProjectCount = projectsResult.count || 0;

        if (!resourcesResponse.ok) {
          const errData = await resourcesResponse.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch allocated resource count: ${resourcesResponse.statusText}`
          );
        }
        const resourcesResult = await resourcesResponse.json();

        fetchedResourceCount = resourcesResult.data?.uniqueUserCount || 0;
      } catch (err) {
        console.error("Error fetching PM summary data:", err);
        fetchError = "Could not load PM summary data.";
      } finally {
        setManagedProjectCount(fetchedProjectCount);
        setTotalAllocatedResources(fetchedResourceCount);
        setPendingRequestCount(0);
        setError(fetchError);
        setLoading(false);
      }
    };

    fetchPmSummaryData();
  }, [user?.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-900">
          Project Manager Overview
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
                <Briefcase size={16} className="mr-2" /> Projects Managed:
              </span>
              <span className="font-semibold">{managedProjectCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600 dark:text-gray-900">
                <Users size={16} className="mr-2" /> Allocated Resources
                (Unique):
              </span>
              <span className="font-semibold">{totalAllocatedResources}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600 dark:text-gray-900">
                <AlertTriangle size={16} className="mr-2 text-yellow-500" />{" "}
                Pending Resource Requests:
              </span>
              <span className="font-semibold">{pendingRequestCount}</span>{" "}
              {/* Placeholder */}
            </div>
            <div className="pt-3 space-x-3">
              <Link
                href="/projects/new"
                className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Create Project
              </Link>
              <Link
                href="/projects?managedBy=me"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                View My Projects
              </Link>
              <Link
                href="/resources"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                View Resources
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PmDashboardSummary;
