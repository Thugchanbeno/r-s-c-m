"use client";
import { ChevronRight, MoreHorizontal } from "lucide-react";

const HRAdminDashboardNew = ({ data }) => {
  const recentActivity = data?.activities?.slice(0, 8) || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-lg font-semibold text-rscm-dark-purple">
            Organization overview
          </h1>
        </div>

        <div className="grid grid-cols-4 divide-x divide-gray-100">
          <div className="px-6 py-5">
            <div className="text-2xl font-semibold text-rscm-dark-purple mb-1">
              {data?.totalUsers || 0}
            </div>
            <div className="text-xs text-gray-500">Total users</div>
          </div>
          <div className="px-6 py-5">
            <div className="text-2xl font-semibold text-rscm-dark-purple mb-1">
              {data?.totalProjects || 0}
            </div>
            <div className="text-xs text-gray-500">Active projects</div>
          </div>
          <div className="px-6 py-5">
            <div className="text-2xl font-semibold text-rscm-dark-purple mb-1">
              {data?.overallUtilization || 0}%
            </div>
            <div className="text-xs text-gray-500">Utilization rate</div>
          </div>
          <div className="px-6 py-5">
            <div className="text-2xl font-semibold text-rscm-dark-purple mb-1">
              {data?.uniqueSkills || 0}
            </div>
            <div className="text-xs text-gray-500">Unique skills</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-rscm-dark-purple">
            Recent activity
          </h2>
          <button className="text-xs text-rscm-violet hover:text-rscm-plum transition-colors font-medium flex items-center gap-1">
            View all
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div
                key={index}
                className="px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-rscm-dark-purple">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {activity.timestamp}
                    </p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-400">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-rscm-dark-purple">
              Top skills
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-rscm-dark-purple font-medium">
                    {data?.mostCommon?.name || "N/A"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {data?.mostCommon?.count || 0} users
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-rscm-violet h-1.5 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-rscm-dark-purple font-medium">
                    {data?.mostDesired?.name || "N/A"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {data?.mostDesired?.count || 0} users
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-rscm-plum h-1.5 rounded-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-rscm-dark-purple">
              Quick actions
            </h2>
          </div>
          <div className="p-3">
            <button className="w-full text-left px-3 py-2.5 text-sm text-rscm-dark-purple hover:bg-gray-50 rounded transition-colors flex items-center justify-between group">
              <span>Manage users</span>
              <ChevronRight
                size={14}
                className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button className="w-full text-left px-3 py-2.5 text-sm text-rscm-dark-purple hover:bg-gray-50 rounded transition-colors flex items-center justify-between group">
              <span>View analytics</span>
              <ChevronRight
                size={14}
                className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button className="w-full text-left px-3 py-2.5 text-sm text-rscm-dark-purple hover:bg-gray-50 rounded transition-colors flex items-center justify-between group">
              <span>Manage skills</span>
              <ChevronRight
                size={14}
                className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button className="w-full text-left px-3 py-2.5 text-sm text-rscm-dark-purple hover:bg-gray-50 rounded transition-colors flex items-center justify-between group">
              <span>Configure settings</span>
              <ChevronRight
                size={14}
                className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRAdminDashboardNew;
