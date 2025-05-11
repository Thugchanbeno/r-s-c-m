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
import Badge from "@/components/common/Badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  Briefcase,
  Users,
  AlertTriangle,
  AlertCircle,
  BellRing,
} from "lucide-react";

const PmDashboardSummary = ({ user }) => {
  const [managedProjectCount, setManagedProjectCount] = useState(0);
  const [totalAllocatedResources, setTotalAllocatedResources] = useState(0);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    const fetchPmSummaryData = async () => {
      if (!user?.id) {
        setLoadingSummary(false);
        return;
      }
      setLoadingSummary(true);
      setSummaryError(null);
      let fetchedProjectCount = 0;
      let fetchedResourceCount = 0;
      let fetchedPendingReqCount = 0;

      try {
        const [
          projectsResponse,
          resourcesSummaryResponse,
          pendingRequestsResponse,
        ] = await Promise.all([
          fetch(`/api/projects?pmId=${user.id}&countOnly=true`),
          fetch(`/api/allocations/summary?pmId=${user.id}`),
          fetch(
            `/api/resourcerequests?requestedByPmId=${user.id}&status=pending&countOnly=true`
          ),
        ]);
        //process managed project count
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
        //process allocated resources (unique users)
        if (!resourcesSummaryResponse.ok) {
          const errData = await resourcesSummaryResponse
            .json()
            .catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch allocated resource summary: ${resourcesSummaryResponse.statusText} (${resourcesSummaryResponse.status})`
          );
        }
        const resourcesResult = await resourcesSummaryResponse.json();
        fetchedResourceCount = resourcesResult.data?.uniqueUserCount || 0;

        // Process Pending Resource Requests Count
        if (!pendingRequestsResponse.ok) {
          const errData = await pendingRequestsResponse
            .json()
            .catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch pending request count: ${pendingRequestsResponse.statusText} (${pendingRequestsResponse.status})`
          );
        }
        const requestsResult = await pendingRequestsResponse.json();
        fetchedPendingReqCount =
          requestsResult.data?.count || requestsResult.count || 0;
      } catch (err) {
        console.error("Error fetching PM summary data:", err);
        setSummaryError(err.message || "Could not load PM summary data.");
        // Reset counts on error
        fetchedProjectCount = 0;
        fetchedResourceCount = 0;
        fetchedPendingReqCount = 0;
      } finally {
        setManagedProjectCount(fetchedProjectCount);
        setTotalAllocatedResources(fetchedResourceCount);
        setPendingRequestCount(fetchedPendingReqCount);
        setLoadingSummary(false);
      }
    };

    if (user?.id) {
      fetchPmSummaryData();
    } else {
      setLoadingSummary(false);
    }
  }, [user?.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Project Manager Overview</CardTitle>
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
                <Briefcase
                  size={16}
                  className="mr-2 text-[rgb(var(--primary))]"
                />
                Projects Managed:
              </span>
              <span className="font-semibold text-[rgb(var(--foreground))]">
                {managedProjectCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-[rgb(var(--muted-foreground))]">
                <Users size={16} className="mr-2 text-[rgb(var(--primary))]" />
                Allocated Resources (Unique):
              </span>
              <span className="font-semibold text-[rgb(var(--foreground))]">
                {totalAllocatedResources}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-[rgb(var(--muted-foreground))]">
                <AlertTriangle // Or BellRing
                  size={16}
                  className="mr-2 text-amber-500"
                />
                My Pending Resource Requests:
              </span>
              <span className="font-semibold text-[rgb(var(--foreground))]">
                {pendingRequestCount > 0 ? (
                  <Badge variant="warning" pill={true} size="sm">
                    {pendingRequestCount}
                  </Badge>
                ) : (
                  pendingRequestCount // Show 0 if no pending requests
                )}
              </span>
            </div>
            <div className="pt-4 border-t border-[rgb(var(--border))] mt-4 flex flex-wrap items-center gap-3">
              <Link href="/projects/new">
                {/* The Button component itself will be the clickable link element */}
                <Button variant="primary" size="sm">
                  Create Project
                </Button>
              </Link>
              <Link
                href={`/projects?pmId=${user?.id}`}
                className="text-sm text-[rgb(var(--primary))] hover:underline font-medium"
              >
                View My Projects
              </Link>
              <Link
                href="/resources?tab=users"
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
