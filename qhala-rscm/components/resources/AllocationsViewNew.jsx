"use client";
import { useState } from "react";
import { useAllocations } from "@/lib/hooks/useAllocations";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Image from "next/image";
import {
  Briefcase,
  Calendar,
  Edit3,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

const AllocationsViewNew = ({ onEditAllocation, onCreateAllocation }) => {
  const {
    allocations,
    loading,
    currentPage,
    totalPages,
    totalAllocations,
    goToPage,
    handleDeleteClick,
    confirmDeleteId,
    cancelDeleteConfirmation,
  } = useAllocations();

  const [filterUser, setFilterUser] = useState("all");
  const [filterProject, setFilterProject] = useState("all");

  // Get unique users and projects for filters
  const users = [...new Set(allocations.map((a) => a.userName).filter(Boolean))];
  const projects = [...new Set(allocations.map((a) => a.projectName).filter(Boolean))];

  // Filter allocations
  const filteredAllocations = allocations.filter((a) => {
    if (filterUser !== "all" && a.userName !== filterUser) return false;
    if (filterProject !== "all" && a.projectName !== filterProject) return false;
    return true;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm px-6 py-12 text-center">
        <LoadingSpinner width={200} height={4} />
        <p className="text-sm text-gray-600 mt-4">Loading allocations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="bg-white rounded-lg shadow-sm px-4 py-3 border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500" />

            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 rounded-md text-xs focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
            >
              <option value="all">All Users</option>
              {users.map((userName) => (
                <option key={userName} value={userName}>
                  {userName}
                </option>
              ))}
            </select>

            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 rounded-md text-xs focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
            >
              <option value="all">All Projects</option>
              {projects.map((projectName) => (
                <option key={projectName} value={projectName}>
                  {projectName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">
              {filteredAllocations.length} {filteredAllocations.length === 1 ? "allocation" : "allocations"}
            </span>
            {onCreateAllocation && (
              <button
                onClick={onCreateAllocation}
                className="px-3 py-1.5 bg-rscm-violet text-white rounded-md hover:bg-rscm-plum transition-colors text-xs font-medium"
              >
                New Allocation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Allocations List */}
      {filteredAllocations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm px-6 py-12 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-sm font-semibold text-rscm-dark-purple mb-1">
            No allocations found
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            {filterUser !== "all" || filterProject !== "all"
              ? "Try adjusting your filters"
              : "Create your first resource allocation"}
          </p>
          {onCreateAllocation && (
            <button
              onClick={onCreateAllocation}
              className="px-3 py-1.5 bg-rscm-violet text-white rounded-md hover:bg-rscm-plum transition-colors text-xs font-medium"
            >
              Create Allocation
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAllocations.map((allocation) => (
            <div
              key={allocation._id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 hover:border-rscm-violet/30 transition-all hover:shadow-md px-5 py-4 group"
            >
              <div className="flex items-center justify-between gap-6">
                {/* Left: User Info */}
                <div className="flex items-center gap-3 min-w-0 flex-shrink-0" style={{ width: "240px" }}>
                  {allocation.userAvatar ? (
                    <Image
                      src={allocation.userAvatar}
                      alt={allocation.userName}
                      width={40}
                      height={40}
                      className="rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rscm-plum to-rscm-violet flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {allocation.userName?.charAt(0) || "?"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-rscm-dark-purple truncate">
                      {allocation.userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{allocation.userEmail || ""}</p>
                  </div>
                </div>

                {/* Center: Allocation Flow */}
                <div className="flex-1 flex items-center gap-4 min-w-0">
                  {/* Role Badge */}
                  <div className="bg-rscm-lilac/20 px-3 py-1.5 rounded-full flex-shrink-0">
                    <p className="text-xs font-medium text-rscm-plum whitespace-nowrap">
                      {allocation.role}
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />

                  {/* Project */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: allocation.projectColor || "#824c71" }}
                    >
                      <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-rscm-dark-purple truncate">
                        {allocation.projectName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {allocation.projectDepartment || "No department"}
                      </p>
                    </div>
                  </div>

                  {/* Allocation Percentage */}
                  <div className="flex-shrink-0">
                    <div className="bg-rscm-violet/10 px-3 py-1.5 rounded-lg">
                      <p className="text-sm font-bold text-rscm-violet">
                        {allocation.allocationPercentage}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Dates & Actions */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <div>
                      <p className="font-medium">{formatDate(allocation.startDate)}</p>
                      <p className="text-gray-400">→ {formatDate(allocation.endDate)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEditAllocation && (
                      <button
                        onClick={() => onEditAllocation(allocation)}
                        className="p-2 rounded-lg hover:bg-rscm-lilac/20 text-gray-600 hover:text-rscm-plum transition-colors"
                        title="Edit allocation"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirmDeleteId === allocation._id) {
                          handleDeleteClick(allocation._id);
                        } else {
                          handleDeleteClick(allocation._id);
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        confirmDeleteId === allocation._id
                          ? "bg-red-100 text-red-600"
                          : "hover:bg-red-50 text-gray-600 hover:text-red-600"
                      }`}
                      title={confirmDeleteId === allocation._id ? "Click again to confirm" : "Delete allocation"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete confirmation */}
              {confirmDeleteId === allocation._id && (
                <div className="mt-3 pt-3 border-t border-red-100 flex items-center justify-between">
                  <p className="text-xs text-red-600 font-medium">Click delete again to confirm removal</p>
                  <button
                    onClick={cancelDeleteConfirmation}
                    className="text-xs text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center justify-between">
          <p className="text-xs text-gray-600">
            Page {currentPage} of {totalPages} ({totalAllocations} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocationsViewNew;
