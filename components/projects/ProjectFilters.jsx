"use client";
import { Search, X } from "lucide-react";

const ProjectFilters = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  departmentFilter,
  onDepartmentChange,
  departments = [],
  showClearFilters = false,
  onClearFilters,
}) => {
  const statuses = ["All", "Planning", "Active", "On Hold", "Completed", "Cancelled"];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm text-rscm-dark-purple placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rscm-violet transition-all"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <div className="flex-shrink-0">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-violet transition-all cursor-pointer"
          >
            {statuses.map((status) => (
              <option key={status} value={status === "All" ? "" : status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        {departments.length > 0 && (
          <div className="flex-shrink-0">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-rscm-dark-purple focus:outline-none focus:ring-2 focus:ring-rscm-violet transition-all cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Clear Filters */}
        {showClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-rscm-violet hover:bg-rscm-violet/10 rounded-lg transition-all duration-200 mt-auto"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectFilters;
