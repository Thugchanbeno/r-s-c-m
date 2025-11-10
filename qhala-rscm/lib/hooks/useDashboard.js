// lib/hooks/useDashboard.js
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/hooks/useAuth";

export const useDashboard = () => {
  const { user } = useAuth();

  const currentUser = useQuery(api.users.getCurrentUser, user?.email ? { email: user.email } : "skip");

  const projects = useQuery(
    api.projects.getAll,
    currentUser && user?.email && ["admin", "hr", "pm", "line_manager"].includes(user.role)
      ? {
          email: user.email,
          pmId: user.role === "pm" ? currentUser._id : undefined,
          countOnly: user.role !== "employee",
        }
      : "skip"
  );

  const allocations = useQuery(
    api.allocations.getSummary,
    currentUser && user?.email && ["admin", "hr", "pm"].includes(user.role)
      ? {
          email: user.email,
          scope: ["admin", "hr"].includes(user.role) ? "overall" : undefined,
          pmId: user.role === "pm" ? currentUser._id : undefined,
        }
      : "skip"
  );

  const userAllocationSummary = useQuery(
    api.users.getAllocationSummary,
    currentUser && user?.email && user.role === "employee"
      ? { email: user.email, userId: currentUser._id }
      : "skip"
  );

  const userSkills = useQuery(
    api.userSkills.getForCurrentUser,
    user?.email && user.role === "employee" ? { email: user.email, countOnly: true } : "skip"
  );

  const skillsDistribution = useQuery(
    api.skills.getDistribution,
    user?.email && ["hr", "admin"].includes(user.role) ? { email: user.email } : "skip"
  );

  const totalUsers = useQuery(
    api.users.getAll,
    user?.email && ["hr", "admin"].includes(user.role)
      ? { email: user.email, countOnly: true }
      : "skip"
  );

  const pendingRequests = useQuery(
    api.resourceRequests.getAll,
    currentUser && user?.email && user.role === "pm"
      ? {
          email: user.email,
          requestedByPmId: currentUser._id,
          status: "pending",
          countOnly: true,
        }
      : "skip"
  );

  const directReports = useQuery(
    api.users.getAll,
    user?.email && user.role === "line_manager"
      ? { email: user.email, search: "", limit: 100 }
      : "skip"
  );

  const pendingVerifications = useQuery(
    api.skills.getPendingVerifications,
    user?.email && user.role === "line_manager" ? { email: user.email } : "skip"
  );

  const recentActivities = useQuery(api.activities.getRecent, user?.email ? {
    email: user.email,
    limit: 10,
  } : "skip");

  const upcomingEvents = useQuery(api.events.getUpcoming, user?.email ? {
    email: user.email,
    limit: 5,
  } : "skip");

  const userProjects = useQuery(
    api.projects.getForUser,
    currentUser && user?.email && user.role === "employee"
      ? { email: user.email, userId: currentUser._id }
      : "skip"
  );

  //  Role-aware loading check
  const isLoading =
    !user?.email ||
    currentUser === undefined ||
    recentActivities === undefined ||
    upcomingEvents === undefined ||
    (user?.role && ["admin", "hr", "pm"].includes(user.role) && projects === undefined) ||
    (user?.role && ["admin", "hr", "pm"].includes(user.role) && allocations === undefined) ||
    (user?.role === "employee" &&
      (userSkills === undefined ||
        userAllocationSummary === undefined ||
        userProjects === undefined)) ||
    (user?.role === "pm" && pendingRequests === undefined) ||
    (user?.role && ["hr", "admin"].includes(user.role) &&
      (skillsDistribution === undefined || totalUsers === undefined)) ||
    (user?.role === "line_manager" &&
      (directReports === undefined || pendingVerifications === undefined));

  // Skills data for HR/Admin
  let skillsData = { uniqueSkills: 0, mostCommon: null, mostDesired: null };
  if (skillsDistribution) {
    let mostCommon = { name: "N/A", count: 0 };
    let mostDesired = { name: "N/A", count: 0 };
    let uniqueSkills = 0;

    skillsDistribution.forEach((category) => {
      category.skills.forEach((skill) => {
        uniqueSkills++;
        if (skill.currentUserCount > mostCommon.count) {
          mostCommon = { name: skill.name, count: skill.currentUserCount };
        }
        if (skill.desiredUserCount > mostDesired.count) {
          mostDesired = { name: skill.name, count: skill.desiredUserCount };
        }
      });
    });

    skillsData = { uniqueSkills, mostCommon, mostDesired };
  }

  const filteredDirectReports =
    directReports?.filter(
      (u) => currentUser && u.lineManagerId === currentUser._id
    ) || [];

  const suggestedSkills =
    user?.role === "employee"
      ? [
          "JavaScript - High demand",
          "React - Growing 25%",
          "TypeScript - Most desired",
        ]
      : [];

  // Return early if user is not authenticated
  if (!user?.email) {
    return {
      loading: false,
      error: "User not authenticated",
      role: null,
      data: {},
    };
  }

  return {
    loading: isLoading,
    error: null,
    role: user?.role,
    data: {
      // Employee data
      capacity: userAllocationSummary?.totalCurrentCapacityPercentage || 0,
      allocatedHours: userAllocationSummary?.totalAllocatedHours || 0,
      standardHours: userAllocationSummary?.weeklyHours || 40,
      activeProjects: userAllocationSummary?.activeAllocationCount || 0,
      projects: userProjects || [],
      skills: [],
      skillsCount: userSkills?.currentSkillCount || 0,
      suggestedSkills,

      // PM data
      managedProjects:
        user?.role === "pm" ? projects?.count || projects?.length || 0 : 0,
      uniqueResources: allocations?.uniqueUserCount || 0,
      teamUtilization: allocations?.utilizationPercentage || 0,
      pendingRequests: pendingRequests?.count || pendingRequests?.length || 0,
      projectsByStatus: {
        active: 0,
        planning: 0,
        completed: 0,
        on_hold: 0,
      },

      // HR/Admin data
      totalUsers: totalUsers?.count || 0,
      totalProjects: projects?.count || projects?.length || 0,
      overallUtilization: allocations?.utilizationPercentage || 0,
      ...skillsData,

      // Line Manager data
      directReports: filteredDirectReports,
      pendingSkillVerifications: pendingVerifications?.length || 0,
      approvalsNeeded: pendingVerifications?.length || 0,

      // Common data
      activities: recentActivities || [],
      upcomingEvents: upcomingEvents || [],
    },
  };
};
