"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Activity, Clock, CheckCircle, ChevronRight, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ActivityFeedWidget() {
  const { user } = useAuth();

  const workRequestsData = useQuery(
    api.workRequests.getAll,
    user?.email ? { email: user.email, limit: 3 } : "skip"
  ) || [];

  const allocationsData = useQuery(
    api.allocations.getAll,
    user?.email ? { email: user.email, limit: 3 } : "skip"
  ) || [];

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-rscm-violet/10 text-rscm-violet";
      case "rejected":
        return "bg-rscm-plum/10 text-rscm-plum";
      case "pending":
      case "pending_lm":
      case "pending_pm":
      case "pending_hr":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={12} />;
      case "rejected":
        return <AlertCircle size={12} />;
      case "pending":
      case "pending_lm":
      case "pending_pm":
      case "pending_hr":
        return <Clock size={12} />;
      default:
        return <AlertCircle size={12} />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      approved: "Approved",
      rejected: "Rejected",
      pending: "Pending",
      pending_lm: "Pending",
      pending_pm: "Pending",
      pending_hr: "Pending",
    };
    return labels[status] || "Unknown";
  };

  const activityItems = [
    ...workRequestsData.map((w) => ({
      type: "workRequest",
      id: w._id,
      timestamp: w.createdAt,
      title: w.requestType === "leave" ? "Leave request" : "Overtime request",
      actor: w.userId?.name || "Unknown",
      avatar: w.userId?.avatarUrl,
      status: w.status,
      duration: w.daysRequested || w.duration,
    })),
    ...(allocationsData.data || []).map((a) => ({
      type: "allocation",
      id: a._id,
      timestamp: a.createdAt,
      title: `Allocated to ${a.projectName}`,
      actor: a.userName || "Unknown",
      avatar: a.userAvatar,
      percentage: a.allocationPercentage,
    })),
  ]
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rscm-navy/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-rscm-navy" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-rscm-dark-purple">
              Activity Feed
            </h2>
            <p className="text-xs text-gray-500">
              Requests and allocations
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {activityItems.length === 0 ? (
          <div className="text-center py-12">
            <Activity size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-2">No recent activity</p>
            <p className="text-xs text-gray-400">
              Requests and allocations will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activityItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="p-4 rounded-lg bg-gray-50 hover:bg-rscm-dutch-white/30 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  {item.avatar && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={item.avatar}
                        alt={item.actor}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm text-rscm-dark-purple">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.actor}
                        </p>
                      </div>
                      {item.type === "workRequest" && (
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 flex items-center gap-1 ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {getStatusIcon(item.status)}
                          {getStatusLabel(item.status)}
                        </span>
                      )}
                      {item.type === "allocation" && (
                        <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                          {item.percentage}%
                        </span>
                      )}
                    </div>
                    {item.type === "workRequest" && item.duration && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.duration}{" "}
                        {item.duration === 1 ? "day" : "days"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/notifications"
        className="px-6 py-3 border-t border-gray-100 flex items-center justify-between hover:bg-rscm-dutch-white/10 transition-colors group"
      >
        <span className="text-xs font-semibold text-rscm-navy">
          View notifications
        </span>
        <ChevronRight
          size={14}
          className="text-rscm-navy group-hover:translate-x-0.5 transition-transform"
        />
      </Link>
    </div>
  );
}
