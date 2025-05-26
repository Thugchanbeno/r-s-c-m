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
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  Briefcase,
  Users,
  AlertTriangle,
  AlertCircle,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        setSummaryError("User information not available to load summary.");
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

  const dashboardLinkStyles = cn(
    "inline-block text-sm font-medium",
    "bg-[rgb(var(--qhala-dark-navy))] text-[rgb(var(--accent))]",
    " hover:text-[rgb(var(--qhala-soft-peach-darker))]",
    "px-3 py-1.5",
    "rounded-[var(--radius)]",
    "transition-colors duration-150 ease-in-out",
    "shadow-sm"
  );

  const buttonAsDashboardLinkClasses = cn(
    "bg-[rgb(var(--qhala-dark-navy))] text-[rgb(var(--accent))]",
    " hover:text-[rgb(var(--qhala-soft-peach-darker))]",
    "shadow-sm",
    "px-3 py-1.5",
    "rounded-[var(--radius)]"
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className={cn("shadow-sm bg-[rgb(var(--accent))] p-4")}>
        <CardTitle
          className={cn(
            "flex items-center gap-2 text-lg font-semibold text-[rgb(var(--accent-foreground))] md:text-xl"
          )}
        >
          <LayoutGrid
            size={22}
            className="text-[rgb(var(--accent-foreground))]"
          />
          Project Manager Overview
        </CardTitle>
        <CardDescription
          className={cn(
            "mt-1 text-sm text-[rgb(var(--accent-foreground))] opacity-90"
          )}
        >
          Summary of your projects, resources, and pending actions.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("p-5 md:p-6")}>
        {loadingSummary ? (
          <div className="flex flex-col items-center justify-center p-6 min-h-[150px]">
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
                <AlertTriangle size={16} className="mr-2 text-amber-500" />
                My Pending Resource Requests:
              </span>
              <span className="font-semibold text-[rgb(var(--foreground))]">
                {pendingRequestCount > 0 ? (
                  <Badge variant="warning" pill={true} size="sm">
                    {pendingRequestCount}
                  </Badge>
                ) : (
                  pendingRequestCount
                )}
              </span>
            </div>
            <div className="pt-4 mt-4 border-t border-[rgb(var(--border))] flex flex-wrap items-center gap-2">
              <Link href="/projects/new">
                <Button
                  variant="primary"
                  size="sm"
                  className={buttonAsDashboardLinkClasses}
                >
                  Create Project
                </Button>
              </Link>
              <Link
                href={`/projects?pmId=${user?.id}`}
                className={dashboardLinkStyles}
              >
                View My Projects
              </Link>
              <Link href="/resources?tab=users" className={dashboardLinkStyles}>
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
