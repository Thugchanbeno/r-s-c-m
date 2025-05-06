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
import { Briefcase, GraduationCap } from "lucide-react";

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
        // setError("User information not available."); // Optional: set error
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
          fetch(`/api/userskills`),
        ]);

        if (!allocResponse.ok) {
          const errData = await allocResponse.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch project count: ${allocResponse.statusText}`
          );
        }
        const allocResult = await allocResponse.json();
        fetchedProjectCount = allocResult.count || 0;

        if (!skillsResponse.ok) {
          const errData = await skillsResponse.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch skill count: ${skillsResponse.statusText}`
          );
        }
        const skillsResult = await skillsResponse.json();
        fetchedSkillCount = skillsResult.currentSkillCount || 0;
      } catch (err) {
        console.error("Error fetching employee summary data:", err);
        fetchError = "Could not load summary data.";
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
        <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-900">
          My Summary
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
                <Briefcase size={16} className="mr-2" /> Current Projects
                Assigned:
              </span>
              <span className="font-semibold">{projectCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-600 dark:text-gray-900">
                <GraduationCap size={16} className="mr-2" /> Current Skills
                Listed:
              </span>
              <span className="font-semibold">{currentSkillCount}</span>
            </div>
            <div className="pt-3">
              <Link
                href="/profile"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
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
