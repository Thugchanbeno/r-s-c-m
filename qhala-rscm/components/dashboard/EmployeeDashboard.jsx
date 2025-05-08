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
import { Briefcase, GraduationCap, AlertCircle } from "lucide-react";

const EmployeeDashboardSummary = ({ user }) => {
  const [projectCount, setProjectCount] = useState(0);
  const [currentSkillCount, setCurrentSkillCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      if (!user?.id) {
        console.warn("EmployeeDashboardSummary: User ID not available.");
        setLoading(false);
        setError("User information not available to load summary.");
        return;
      }

      setLoading(true);
      setError(null);
      let fetchedProjectCount = 0;
      let fetchedSkillCount = 0;
      let fetchError = null;

      try {
        const [allocResponse, skillsResponse] = await Promise.all([
          fetch(`/api/allocations?userId=${user.id}&countOnly=true`),
          fetch(`/api/userskills?userId=${user.id}&currentCountOnly=true`),
        ]);

        if (!allocResponse.ok) {
          const errData = await allocResponse.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch project count: ${allocResponse.statusText} (${allocResponse.status})`
          );
        }
        const allocResult = await allocResponse.json();
        fetchedProjectCount = allocResult.data?.count || 0;

        if (!skillsResponse.ok) {
          const errData = await skillsResponse.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch skill count: ${skillsResponse.statusText} (${skillsResponse.status})`
          );
        }
        const skillsResult = await skillsResponse.json();
        fetchedSkillCount = skillsResult.data?.currentSkillCount || 0;
      } catch (err) {
        console.error("Error fetching employee summary data:", err);
        fetchError = err.message || "Could not load summary data.";
      } finally {
        setProjectCount(fetchedProjectCount);
        setCurrentSkillCount(fetchedSkillCount);
        setError(fetchError);
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, [user?.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">My Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-6 min-h-[100px]">
            <LoadingSpinner size={20} />
            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
              Loading summary...
            </p>
          </div>
        ) : error ? (
          <div className="flex items-center p-3 text-sm rounded-[var(--radius)] bg-red-50 text-red-600 border border-red-200 shadow-sm">
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
                Current Projects Assigned:
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
                />{" "}
                Current Skills Listed:
              </span>
              <span className="font-semibold text-[rgb(var(--foreground))]">
                {currentSkillCount}
              </span>
            </div>
            <div className="pt-3">
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
