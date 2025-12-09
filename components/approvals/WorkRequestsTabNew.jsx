"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function WorkRequestsTabNew({ user }) {
  const { data: session } = useSession();
  const [processingRequestId, setProcessingRequestId] = useState(null);

  const pendingRequests = useQuery(
    api.workRequests.getAll,
    session?.user?.email
      ? { email: session.user.email, status: "pending_lm" }
      : "skip"
  );

  const processApproval = useMutation(api.workRequests.processApproval);

  const loading = pendingRequests === undefined;
  const requests = pendingRequests || [];

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleProcessRequest = async (requestId, action) => {
    setProcessingRequestId(requestId);
    try {
      await processApproval({
        email: session.user.email,
        requestId,
        action,
        reason:
          action === "approve"
            ? "Approved by line manager"
            : "Rejected by line manager",
      });
      toast.success(
        `Request ${action === "approve" ? "approved" : "rejected"} successfully`
      );
    } catch (error) {
      console.error("Error processing request:", error);
      toast.error(error.message || "Failed to process request");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const getRequestTypeBadge = (requestType) => {
    const config = {
      leave: { label: "Leave", bg: "bg-rscm-lilac/20", text: "text-rscm-plum" },
      overtime: {
        label: "Overtime",
        bg: "bg-amber-100",
        text: "text-amber-700",
      },
      compensatory_leave: {
        label: "Comp Leave",
        bg: "bg-green-100",
        text: "text-green-700",
      },
    };
    const { label, bg, text } = config[requestType] || {
      label: requestType,
      bg: "bg-gray-100",
      text: "text-gray-700",
    };
    return (
      <span className={`${bg} ${text} px-2 py-1 rounded-full text-xs font-medium`}>
        {label}
      </span>
    );
  };

  const getLeaveTypeLabel = (leaveType) => {
    const labels = {
      annual: "Annual Leave",
      sick: "Sick Leave",
      personal: "Personal Leave",
      emergency: "Emergency Leave",
      maternity: "Maternity Leave",
      paternity: "Paternity Leave",
    };
    return labels[leaveType] || leaveType;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px] bg-white rounded-lg shadow-sm">
        <LoadingSpinner width={200} height={4} />
        <p className="mt-4 text-sm text-gray-600">Loading work requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm px-6 py-12 text-center">
        <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <h3 className="text-sm font-semibold text-rscm-dark-purple mb-1">
          All caught up!
        </h3>
        <p className="text-xs text-gray-600">
          No pending leave or overtime requests to review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const isProcessing = processingRequestId === req._id;
        const isLeaveRequest = req.requestType === "leave";

        return (
          <div
            key={req._id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 hover:border-rscm-violet/30 transition-all hover:shadow-md px-5 py-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {req.userId?.avatarUrl ? (
                  <Image
                    src={req.userId.avatarUrl}
                    alt={req.userId.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-rscm-lilac/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-rscm-violet" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-rscm-dark-purple">
                    {req.userId?.name || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500">{req.userId?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getRequestTypeBadge(req.requestType)}
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(req.createdAt)}
                </div>
              </div>
            </div>

            {/* Request Details */}
            {isLeaveRequest ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Leave Type</p>
                    <p className="font-medium text-rscm-dark-purple">
                      {getLeaveTypeLabel(req.leaveType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                    <p className="font-medium text-rscm-dark-purple">
                      {req.daysRequested} day{req.daysRequested !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Dates
                    </p>
                    <p className="font-medium text-rscm-dark-purple text-xs">
                      {formatDate(req.startDate)} - {formatDate(req.endDate)}
                    </p>
                  </div>
                </div>

                {req.coveringUserId && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Coverage</p>
                    <p className="text-sm text-rscm-dark-purple">
                      {req.coveringUserId.name || "Not specified"}
                    </p>
                  </div>
                )}

                {req.handoverNotes && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Handover Notes
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {req.handoverNotes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Hours Requested</p>
                    <p className="font-medium text-rscm-dark-purple">
                      {req.hoursRequested || 0} hours
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date</p>
                    <p className="font-medium text-rscm-dark-purple">
                      {formatDate(req.overtimeDate)}
                    </p>
                  </div>
                </div>

                {req.reason && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Reason</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {req.reason}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleProcessRequest(req._id, "reject")}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Reject
              </button>
              <button
                onClick={() => handleProcessRequest(req._id, "approve")}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rscm-violet rounded-lg hover:bg-rscm-plum transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Approve
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
