"use client";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { 
  ChevronRight, 
  MoreHorizontal, 
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const AdminDashboard = ({ user }) => {
  const router = useRouter();
  const { loading, error, data } = useDashboard();
  
  // Fetch pending resource requests for approvals
  const pendingResourceRequests = useQuery(
    api.resourceRequests.getAll,
    user?.email ? { email: user.email, status: "pending_hr" } : "skip"
  );

  if (loading || pendingResourceRequests === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <LoadingSpinner width={200} height={4} />
        <p className="text-sm text-rscm-dark-purple">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start gap-3 text-red-600">
          <AlertCircle size={20} />
          <div>
            <h3 className="font-semibold text-sm">Error loading dashboard</h3>
            <p className="text-xs text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    totalUsers: data.totalUsers || 0,
    totalProjects: data.totalProjects || 0,
    utilization: Math.round(data.overallUtilization || 0),
    uniqueSkills: data.uniqueSkills || 0,
  };

  const pendingApprovals = (pendingResourceRequests || []).slice(0, 5).map((req) => ({
    title: `Resource request: ${req.requestedUserId?.name || "User"}`,
    description: `${req.projectId?.name || "Project"} - ${req.requestedRole} (${req.requestedPercentage}%)`,
  }));
  
  const recentActivity = (data.activities || []).slice(0, 5);
  const capacityAlerts = [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-rscm-violet opacity-5 rounded-full"></div>
          <div className="absolute top-8 right-32 w-16 h-16 bg-rscm-lilac opacity-8 rotate-45"></div>
          <div 
            className="absolute top-4 right-16 w-12 h-12 bg-rscm-plum opacity-6"
            style={{ borderRadius: "0 60% 0 60%" }}
          ></div>
          <div className="absolute bottom-2 right-6 w-8 h-8 border-4 border-rscm-dutch-white opacity-20 rounded-full"></div>
          <svg className="absolute bottom-4 right-24 w-10 h-10 opacity-8" viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill="rgb(var(--rscm-lilac))" />
          </svg>
        </div>
        
        <div className="px-6 py-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rscm-violet to-rscm-plum flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
              {user?.avatarUrl || user?.image ? (
                <Image
                  src={user.avatarUrl || user.image}
                  alt={user?.name || "User"}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-rscm-dark-purple">
                {getGreeting()}, {user?.name?.split(" ")[0] || "there"}!
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-rscm-violet text-white shadow-sm">
                  {getRoleDisplay(user?.role)}
                </span>
                <span className="text-sm text-gray-500">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-lg font-semibold text-rscm-dark-purple">
            Organization overview
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time metrics across your organization
          </p>
        </div>

        <div className="grid grid-cols-4 divide-x divide-gray-100">
          <div className="px-6 py-5 hover:bg-rscm-dutch-white/30 transition-colors cursor-pointer group">
            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-2xl font-semibold text-rscm-dark-purple">
                {stats.totalUsers}
              </div>
              <TrendingUp size={14} className="text-rscm-violet opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-xs text-gray-500">Total users</div>
          </div>

          <div className="px-6 py-5 hover:bg-rscm-dutch-white/30 transition-colors cursor-pointer group">
            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-2xl font-semibold text-rscm-dark-purple">
                {stats.totalProjects}
              </div>
              <TrendingUp size={14} className="text-rscm-violet opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-xs text-gray-500">Active projects</div>
          </div>

          <div className="px-6 py-5 hover:bg-rscm-dutch-white/30 transition-colors cursor-pointer group">
            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-2xl font-semibold text-rscm-dark-purple">
                {Math.round(stats.utilization)}%
              </div>
              {stats.utilization > 75 ? (
                <TrendingUp size={14} className="text-rscm-violet opacity-0 group-hover:opacity-100 transition-opacity" />
              ) : (
                <TrendingDown size={14} className="text-rscm-plum opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            <div className="text-xs text-gray-500">Avg utilization</div>
          </div>

          <div className="px-6 py-5 hover:bg-rscm-dutch-white/30 transition-colors cursor-pointer group">
            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-2xl font-semibold text-rscm-dark-purple">
                {stats.uniqueSkills}
              </div>
              <TrendingUp size={14} className="text-rscm-violet opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-xs text-gray-500">Skills tracked</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-rscm-dark-purple">
                Pending approvals
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Items requiring your attention
              </p>
            </div>
            <button 
              onClick={() => router.push("/approvals")}
              className="text-xs text-rscm-violet hover:text-rscm-plum transition-colors font-medium flex items-center gap-1"
            >
              View all
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.map((approval, index) => (
                <div
                  key={index}
                  className="px-6 py-3 hover:bg-rscm-dutch-white/20 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-1.5 bg-rscm-lilac/10 rounded mt-0.5">
                        <Clock size={14} className="text-rscm-plum" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-rscm-dark-purple font-medium">
                          {approval.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {approval.description}
                        </p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-rscm-dutch-white/30 rounded">
                      <MoreHorizontal size={14} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-rscm-violet opacity-50" />
                <p className="text-sm text-gray-400">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No pending approvals</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-rscm-dark-purple">
              Recent activity
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Latest updates across the organization
            </p>
          </div>

          <div className="divide-y divide-gray-50">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div
                  key={index}
                  className="px-6 py-3 hover:bg-rscm-dutch-white/20 transition-colors cursor-pointer"
                >
                  <p className="text-sm text-rscm-dark-purple">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {activity.timestamp}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-rscm-dark-purple">
              Capacity alerts
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Resources requiring attention
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {capacityAlerts.length > 0 ? (
            capacityAlerts.map((alert, index) => (
              <div
                key={index}
                className="px-6 py-3 hover:bg-rscm-dutch-white/20 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-1.5 rounded ${
                      alert.type === "overutilized" 
                        ? "bg-rscm-plum/10" 
                        : "bg-rscm-lilac/10"
                    }`}>
                      <AlertCircle size={14} className={
                        alert.type === "overutilized" 
                          ? "text-rscm-plum" 
                          : "text-rscm-violet"
                      } />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-rscm-dark-purple">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-rscm-dutch-white/30 rounded">
                    <ChevronRight size={14} className="text-rscm-violet" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-rscm-violet opacity-50" />
              <p className="text-sm text-gray-400">All good!</p>
              <p className="text-xs text-gray-400 mt-1">No capacity issues detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
