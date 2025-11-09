"use client";
import Image from "next/image";
import { User, Building2, Mail, Clock, TrendingUp } from "lucide-react";

const ProfileHeaderNew = ({ user, capacityData }) => {
  const capacity = capacityData?.totalCurrentCapacityPercentage || 0;
  const allocatedHours = capacityData?.totalAllocatedHours || 0;
  const standardHours = user?.weeklyHours || 40;

  const getCapacityColor = (cap) => {
    if (cap >= 90) return "text-rscm-plum";
    if (cap >= 70) return "text-rscm-violet";
    return "text-rscm-lilac";
  };

  const getCapacityBg = (cap) => {
    if (cap >= 90) return "bg-rscm-plum";
    if (cap >= 70) return "bg-rscm-violet";
    return "bg-rscm-lilac";
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      admin: "Administrator",
      hr: "HR Manager",
      pm: "Project Manager",
      line_manager: "Line Manager",
      employee: "Employee",
    };
    return roleMap[role] || role;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-rscm-violet to-rscm-plum flex items-center justify-center flex-shrink-0 shadow-lg">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user?.name || "User"}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-rscm-dark-purple">
                {user?.name || "Loading..."}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-rscm-violet text-white">
                  {getRoleDisplay(user?.role)}
                </span>
                {user?.department && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs bg-rscm-lilac/20 text-rscm-dark-purple">
                    <Building2 className="w-3 h-3 mr-1" />
                    {user.department}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                {user?.email}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-3 gap-4">
            {/* Capacity */}
            <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-rscm-dutch-white/30 transition-colors">
              <div className={`text-3xl font-bold ${getCapacityColor(capacity)}`}>
                {capacity}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Capacity</div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getCapacityBg(capacity)}`}
                  style={{ width: `${Math.min(capacity, 100)}%` }}
                />
              </div>
            </div>

            {/* Weekly Hours */}
            <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-rscm-dutch-white/30 transition-colors">
              <div className="text-3xl font-bold text-rscm-dark-purple">
                {standardHours}h
              </div>
              <div className="text-xs text-gray-500 mt-1">Weekly Hours</div>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {allocatedHours}h allocated
              </div>
            </div>

            {/* Leave Balance */}
            <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-rscm-dutch-white/30 transition-colors">
              <div className="text-3xl font-bold text-rscm-dark-purple">
                {(user?.annualLeaveEntitlement || 0) - (user?.annualLeaveUsed || 0)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Leave Days</div>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-400">
                <TrendingUp className="w-3 h-3" />
                {user?.compensatoryDaysBalance || 0} comp days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderNew;
