"use client";
import { Briefcase, Calendar, Clock, MapPin, User as UserIcon, Building2, Edit3 } from "lucide-react";

const ProjectsEmploymentSectionNew = ({ 
  user,
  allocations = [],
  onEditEmployment 
}) => {
  const canEdit = user?.role === "admin" || user?.role === "hr";

  const getEmploymentType = (type) => {
    const types = {
      full_time: "Full Time",
      part_time: "Part Time",
      contract: "Contract",
      consultant: "Consultant"
    };
    return types[type] || type;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Current Projects Card */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rscm-violet/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-rscm-violet" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-rscm-dark-purple">
                Current Projects
              </h2>
              <p className="text-xs text-gray-500">
                Active allocations and assignments
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!allocations || allocations.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 mb-2">No active projects</p>
              <p className="text-xs text-gray-400">
                You&apos;re not currently allocated to any projects
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {allocations.map((allocation, index) => (
                <div
                  key={allocation._id || index}
                  className="p-4 rounded-lg bg-gray-50 hover:bg-rscm-dutch-white/30 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-rscm-dark-purple">
                        {allocation.projectName || "Unnamed Project"}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {allocation.role || "Team Member"}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-rscm-violet text-white text-xs font-medium rounded">
                      {allocation.allocationPercentage || 0}%
                    </span>
                  </div>

                  {(allocation.startDate || allocation.endDate) && (
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      {allocation.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(allocation.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {allocation.endDate && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Until {new Date(allocation.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Employment Details Card */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rscm-plum/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-rscm-plum" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-rscm-dark-purple">
                Employment Details
              </h2>
              <p className="text-xs text-gray-500">
                Your organizational information
              </p>
            </div>
          </div>
          {canEdit && (
            <button
              onClick={onEditEmployment}
              className="p-2 text-rscm-violet hover:bg-rscm-violet/10 rounded-lg transition-colors"
              title="Edit Employment Details"
            >
              <Edit3 size={16} />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* Employment Type & Weekly Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Employment Type
              </label>
              <p className="mt-1 text-sm text-rscm-dark-purple font-medium">
                {getEmploymentType(user?.employeeType) || "Not specified"}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Weekly Hours
              </label>
              <p className="mt-1 text-sm text-rscm-dark-purple font-medium">
                {user?.weeklyHours || 40} hours
              </p>
            </div>
          </div>

          {/* Department & Function */}
          <div className="pt-3">
            <div className="space-y-3">
              {user?.department && (
                <div className="flex items-start gap-3">
                  <Building2 size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Department</label>
                    <p className="text-sm text-rscm-dark-purple">
                      {user.department}
                    </p>
                  </div>
                </div>
              )}
              {user?.function && (
                <div className="flex items-start gap-3">
                  <UserIcon size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Function</label>
                    <p className="text-sm text-rscm-dark-purple">
                      {user.function}
                    </p>
                  </div>
                </div>
              )}
              {user?.location && (
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Location</label>
                    <p className="text-sm text-rscm-dark-purple">
                      {user.location}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Leave Entitlement */}
          <div className="pt-3">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Annual Leave Entitlement
            </label>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-rscm-dark-purple">
                    {user?.annualLeaveEntitlement || 0}
                  </span>
                  <span className="text-xs text-gray-500">days per year</span>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {user?.annualLeaveUsed || 0} days used this year
                </div>
              </div>
              {user?.compensatoryDaysBalance > 0 && (
                <div className="px-3 py-2 bg-rscm-lilac/10 rounded-lg">
                  <div className="text-sm font-semibold text-rscm-plum">
                    +{user.compensatoryDaysBalance}
                  </div>
                  <div className="text-xs text-gray-500">comp days</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsEmploymentSectionNew;
