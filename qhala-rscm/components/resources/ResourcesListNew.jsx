"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/hooks/useAuth";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Image from "next/image";
import {
  User,
  Mail,
  Building2,
  Briefcase,
  Percent,
  UserPlus,
  Edit3,
  Search,
  Filter,
  Users,
  Wrench,
} from "lucide-react";

const ResourcesListNew = ({ onManageUser, onAllocateUser, searchTerm = "", skillSearchTerm = "" }) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("all");

  const users = useQuery(
    api.users.getAll,
    user?.email
      ? {
          email: user.email,
          search: searchTerm || undefined,
          skillName: skillSearchTerm || undefined,
          limit: 1000,
        }
      : "skip"
  );

  const loading = users === undefined;
  const userList = users || [];

  // Filter users based on filters
  const filteredUsers = userList.filter((u) => {
    if (filterDepartment !== "all" && u.department !== filterDepartment) return false;
    if (filterRole !== "all" && u.role !== filterRole) return false;
    if (filterAvailability !== "all" && u.availabilityStatus !== filterAvailability) return false;
    return true;
  });

  // Get unique departments and roles for filters
  const departments = [...new Set(userList.map((u) => u.department).filter(Boolean))];
  const roles = [...new Set(userList.map((u) => u.role))];

  const getAvailabilityColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700";
      case "unavailable":
        return "bg-red-100 text-red-700";
      case "partially_available":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
      case "hr":
        return "bg-rscm-plum/20 text-rscm-plum";
      case "pm":
        return "bg-rscm-violet/20 text-rscm-violet";
      case "line_manager":
        return "bg-rscm-lilac/30 text-rscm-dark-purple";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm px-6 py-12 text-center">
        <LoadingSpinner width={200} height={4} />
        <p className="text-sm text-gray-600 mt-4">Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm px-4 py-3 border-b border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 rounded-md text-xs focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 rounded-md text-xs focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
          >
            <option value="all">All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role.replace("_", " ")}
              </option>
            ))}
          </select>

          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 rounded-md text-xs focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="partially_available">Partially Available</option>
            <option value="unavailable">Unavailable</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-600">
              {filteredUsers.length} {filteredUsers.length === 1 ? "resource" : "resources"}
            </span>
          </div>
        </div>
      </div>

      {/* User Grid */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm px-6 py-12 text-center">
          <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-sm font-semibold text-rscm-dark-purple mb-1">
            No resources found
          </h3>
          <p className="text-xs text-gray-600">
            {searchTerm || skillSearchTerm
              ? "Try adjusting your search or filters"
              : "No users match the selected filters"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((usr) => (
            <div
              key={usr._id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 hover:border-rscm-violet/30 transition-colors p-4"
            >
              {/* User Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="relative flex-shrink-0">
                  {usr.avatarUrl ? (
                    <Image
                      src={usr.avatarUrl}
                      alt={usr.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-rscm-lilac/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-rscm-violet" />
                    </div>
                  )}
                  {/* Availability indicator */}
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      usr.availabilityStatus === "available"
                        ? "bg-green-500"
                        : usr.availabilityStatus === "partially_available"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-rscm-dark-purple truncate">
                    {usr.name}
                  </h3>
                  <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{usr.email}</span>
                  </p>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-700">{usr.department || "N/A"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(usr.role)}`}>
                    {usr.role?.replace("_", " ")}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getAvailabilityColor(usr.availabilityStatus)}`}>
                    {usr.availabilityStatus?.replace("_", " ") || "unknown"}
                  </span>
                </div>

                {/* Capacity Info */}
                {usr.weeklyHours && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Percent className="w-3.5 h-3.5" />
                    <span>{usr.weeklyHours}h/week capacity</span>
                  </div>
                )}

                {/* Skills Count */}
                {usr.skills && usr.skills.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{usr.skills.length} {usr.skills.length === 1 ? "skill" : "skills"}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                {onManageUser && (
                  <button
                    onClick={() => onManageUser(usr)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    Manage
                  </button>
                )}
                {onAllocateUser && (
                  <button
                    onClick={() => onAllocateUser(usr)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rscm-violet rounded-md hover:bg-rscm-plum transition-colors"
                  >
                    <UserPlus className="w-3 h-3" />
                    Allocate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesListNew;
