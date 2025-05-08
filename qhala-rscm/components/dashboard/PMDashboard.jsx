"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/common/Card";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Briefcase, Users, AlertTriangle, AlertCircle } from "lucide-react";

const PmDashboardSummary = ({ user }) => {
  const [managedProjectCount, setManagedProjectCount] = useState(0);
  const [totalAllocatedResources, setTotalAllocatedResources] = useState(0);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPmSummaryData = async () => {
      if (!user?.id) {
        console.warn("PmDashboardSummary: User ID not available.");
        setLoading(false);
        setError("User information not available to load PM summary.");
        return;
      }

      setLoading(true);
      setError(null);
      let fetchedProjectCount = 0;
      let fetchedResourceCount = 0;
      let fetchedPendingRequestCount = 0;
      let fetchError = null;

      try {
        const [projectsResponse, resourcesResponse /*, requestsResponse */] =
          await Promise.all([
            fetch(`/api/projects?pmId=${user.id}&countOnly=true`),
            fetch(`/api/allocations/summary?pmId=${user.id}`), // Assuming this returns uniqueUserCount
            // TODO: Fetch pending request count when API exists
            // For now, let's assume it's not ready and we'll keep it at 0
            // Promise.resolve({ ok: true, json: async () => ({ data: { count: 0 } }) })
          ]);

        if (!projectsResponse.ok) {
          const errData = await projectsResponse.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch managed project count: ${projectsResponse.statusText} (${projectsResponse.status})`
          );
        }
        const projectsResult = await projectsResponse.json();
        fetchedProjectCount =
          projectsResult.data?.count || projectsResult.count || 0;

        if (!resourcesResponse.ok) {
          const errData = await resourcesResponse.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch allocated resource summary: ${resourcesResponse.statusText} (${resourcesResponse.status})`
          );
        }
        const resourcesResult = await resourcesResponse.json();
        fetchedResourceCount = resourcesResult.data?.uniqueUserCount || 0;

        // TODO: Process Pending Requests Response when API is ready
        // if (requestsResponse && !requestsResponse.ok) { ... }
        // const requestsResult = await requestsResponse.json();
        // fetchedPendingRequestCount = requestsResult.data?.count || 0;
      } catch (err) {
        console.error("Error fetching PM summary data:", err);
        fetchError = err.message || "Could not load PM summary data.";
      } finally {
        setManagedProjectCount(fetchedProjectCount);
        setTotalAllocatedResources(fetchedResourceCount);
        setPendingRequestCount(fetchedPendingRequestCount);
        setError(fetchError);
        setLoading(false);
      }
    };

    fetchPmSummaryData();
  }, [user?.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Project Manager Overview</CardTitle>
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
                <Briefcase
                  size={16}
                  className="mr-2 text-[rgb(var(--primary))]"
                />{" "}
                Projects Managed:
              </span>
              <span className="font-semibold text-[rgb(var(--foreground))]">
                {managedProjectCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-[rgb(var(--muted-foreground))]">
                <Users size={16} className="mr-2 text-[rgb(var(--primary))]" />{" "}
                Allocated Resources (Unique):
              </span>
              <span className="font-semibold text-[rgb(var(--foreground))]">
                {totalAllocatedResources}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-[rgb(var(--muted-foreground))]">
                <AlertTriangle size={16} className="mr-2 text-amber-500" />{" "}
                Pending Resource Requests:
              </span>
              <span className="font-semibold text-[rgb(var(--foreground))]">
                {pendingRequestCount}
              </span>
            </div>
            <div className="pt-4 border-t border-[rgb(var(--border))] mt-4 flex flex-wrap items-center gap-3">
              <Link href="/projects/new" passHref legacyBehavior>
                <Button variant="primary" size="sm">
                  Create Project
                </Button>
              </Link>
              <Link
                href="/projects?managedBy=me"
                className="text-sm text-[rgb(var(--primary))] hover:underline font-medium"
              >
                View My Projects
              </Link>
              <Link
                href="/resources"
                className="text-sm text-[rgb(var(--primary))] hover:underline font-medium"
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
