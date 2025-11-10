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
  User,
  Briefcase,
  Percent,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export default function ResourceRequestsTabNew({ user }) {
  const { data: session } = useSession();
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState({});

  const pendingLmRequests = useQuery(
    api.resourceRequests.getAll,
    session?.user?.email
      ? { email: session.user.email, status: "pending_lm" }
      : "skip"
  );

  const pendingHrRequests = useQuery(
    api.resourceRequests.getAll,
    session?.user?.email
      ? { email: session.user.email, status: "pending_hr" }
      : "skip"
  );

  const processRequest = useMutation(api.resourceRequests.processApproval);

  const loading = pendingLmRequests === undefined || pendingHrRequests === undefined;
  const requests = [...(pendingLmRequests || []), ...(pendingHrRequests || [])];

  const formatDate = (dateString) => {
    if (!dateString) return "ASAP";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleProcessRequest = async (requestId, action) => {
    setProcessingRequestId(requestId);
    try {
      const reason =
        action === "reject"
          ? rejectionReasons[requestId] || "Rejected"
          : "Approved";

      if (action === "reject" && !rejectionReasons[requestId]?.trim()) {
        toast.error("Please provide a reason for rejection");
        setProcessingRequestId(null);
        return;
      }

      await processRequest({
        email: session.user.email,
        requestId,
        action,
        reason,
      });
      toast.success(
        `Resource request ${action === "approve" ? "approved" : "rejected"} successfully`
      );
      setRejectionReasons((prev) => {
        const updated = { ...prev };
        delete updated[requestId];
        return updated;
      });
    } catch (error) {
      console.error("Error processing request:", error);
      toast.error(error.message || "Failed to process request");
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px] bg-white rounded-lg shadow-sm">
        <LoadingSpinner width={200} height={4} />
        <p className="mt-4 text-sm text-gray-600">
          Loading resource requests...
        </p>
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
        <p className="text-xs text-gray-600">No pending resource requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const isProcessing = processingRequestId === req._id;

        return (
          <div
            key={req._id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 hover:border-rscm-violet/30 transition-all hover:shadow-md px-5 py-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {req.requestedUserId?.avatarUrl ? (
                  <Image
                    src={req.requestedUserId.avatarUrl}
                    alt={req.requestedUserId.name}
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
                    {req.requestedUserId?.name || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Requested by {req.requestedByPmId?.name || "Unknown PM"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
                  {req.status}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(req.createdAt)}
                </div>
              </div>
            </div>

            {/* Allocation Flow */}
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-rscm-lilac/20 px-3 py-1.5 rounded-full">
                <p className="text-xs font-medium text-rscm-plum">
                  {req.requestedRole}
                </p>
              </div>

              <ArrowRight className="w-4 h-4 text-gray-400" />

              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: req.projectId?.color || "#824c71" }}
                >
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-rscm-dark-purple">
                    {req.projectId?.name || "Unknown Project"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {req.projectId?.department || "No department"}
                  </p>
                </div>
              </div>

              <div className="ml-auto bg-rscm-violet/10 px-3 py-1.5 rounded-lg">
                <p className="text-sm font-bold text-rscm-violet">
                  {req.requestedPercentage}%
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="flex items-center gap-6 text-sm mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Dates</p>
                  <p className="font-medium text-rscm-dark-purple text-xs">
                    {formatDate(req.requestedStartDate)} →{" "}
                    {formatDate(req.requestedEndDate)}
                  </p>
                </div>
              </div>
            </div>

            {req.justification && (
              <div className="mb-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Justification</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                  {req.justification}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
              {rejectionReasons[req._id] === undefined ? (
                <>
                  <button
                    onClick={() =>
                      setRejectionReasons((prev) => ({
                        ...prev,
                        [req._id]: "",
                      }))
                    }
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4" />
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
                </>
              ) : (
                <>
                  <button
                    onClick={() =>
                      setRejectionReasons((prev) => {
                        const updated = { ...prev };
                        delete updated[req._id];
                        return updated;
                      })
                    }
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleProcessRequest(req._id, "reject")}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Confirm Rejection
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
