"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  MessageSquare,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function WorkRequestsTab({ user }) {
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
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleProcessRequest = async (requestId, action) => {
    setProcessingRequestId(requestId);
    try {
      await processApproval({
        email: session.user.email,
        requestId,
        action,
        reason: action === "approve" ? "Approved by line manager" : "Rejected by line manager",
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
      leave: { label: "Leave", variant: "primary" },
      overtime: { label: "Overtime", variant: "warning" },
      compensatory_leave: { label: "Comp Leave", variant: "success" },
    };
    const { label, variant } = config[requestType] || { label: requestType, variant: "default" };
    return <Badge variant={variant} size="sm">{label}</Badge>;
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
      <div className="flex flex-col items-center justify-center p-6 min-h-[300px]">
        <LoadingSpinner size={24} />
        <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
          Loading work requests...
        </p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="bg-[rgb(var(--card))]">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-[rgb(var(--muted))]">
              <CheckCircle size={24} className="text-[rgb(var(--success))]" />
            </div>
            <div>
              <p className="font-medium text-[rgb(var(--foreground))]">
                All caught up!
              </p>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                No pending leave or overtime requests to review.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => {
        const isThisRequestProcessing = processingRequestId === req._id;
        const isLeaveRequest = req.requestType === "leave";
        const isOvertimeRequest = req.requestType === "overtime";

        return (
          <Card
            key={req._id}
            className="overflow-hidden shadow-md bg-[rgb(var(--card))]"
          >
            <CardHeader
              className={cn(
                "p-4 border-b border-[rgb(var(--border))]",
                "bg-[rgb(var(--muted))]/50"
              )}
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <CardTitle className="text-base sm:text-lg text-[rgb(var(--foreground))] flex items-center gap-2">
                  <User size={18} className="text-[rgb(var(--muted-foreground))]" />
                  <span className="font-semibold text-[rgb(var(--primary))]">
                    {req.userId?.name || "Unknown User"}
                  </span>
                  {getRequestTypeBadge(req.requestType)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[rgb(var(--muted-foreground))]" />
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">
                    {formatDate(req.createdAt)}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {isLeaveRequest && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <div className="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">
                        Leave Type
                      </div>
                      <div className="text-[rgb(var(--foreground))]">
                        {getLeaveTypeLabel(req.leaveType)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">
                        Duration
                      </div>
                      <div className="text-[rgb(var(--foreground))]">
                        {req.daysRequested} business day{req.daysRequested !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1 flex items-center gap-1">
                        <Calendar size={12} />
                        Dates
                      </div>
                      <div className="text-[rgb(var(--foreground))]">
                        {formatDate(req.startDate)} - {formatDate(req.endDate)}
                      </div>
                    </div>
                  </div>

                  {req.coveringUserId && (
                    <div className="pt-3 mt-2 border-t border-[rgb(var(--border))]">
                      <div className="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">
                        Coverage Arranged
                      </div>
                      <div className="text-sm text-[rgb(var(--foreground))]">
                        {req.coveringUserId.name || "Not specified"}
                      </div>
                    </div>
                  )}

                  {req.handoverNotes && (
                    <div className="pt-3 mt-2 border-t border-[rgb(var(--border))]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MessageSquare size={14} className="text-[rgb(var(--muted-foreground))]" />
                        <p className="text-xs font-medium text-[rgb(var(--muted-foreground))]">
                          Handover Notes:
                        </p>
                      </div>
                      <p className={cn(
                        "text-sm text-[rgb(var(--foreground))] whitespace-pre-wrap p-2.5 rounded-md",
                        "bg-[rgb(var(--muted))]/70 border border-[rgb(var(--border))]"
                      )}>
                        {req.handoverNotes}
                      </p>
                    </div>
                  )}
                </>
              )}

              {isOvertimeRequest && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <div className="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">
                        Overtime Hours
                      </div>
                      <div className="text-[rgb(var(--foreground))]">
                        {req.overtimeHours} hour{req.overtimeHours !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">
                        Date
                      </div>
                      <div className="text-[rgb(var(--foreground))]">
                        {formatDate(req.overtimeDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">
                        Compensation
                      </div>
                      <div className="text-[rgb(var(--foreground))]">
                        {req.compensationType?.replace("_", " ") || "N/A"}
                      </div>
                    </div>
                  </div>

                  {req.projectId && (
                    <div className="pt-3 mt-2 border-t border-[rgb(var(--border))]">
                      <div className="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1 flex items-center gap-1">
                        <Briefcase size={12} />
                        Project
                      </div>
                      <div className="text-sm text-[rgb(var(--foreground))]">
                        {req.projectId.name || "Not specified"}
                      </div>
                    </div>
                  )}
                </>
              )}

              {req.reason && (
                <div className="pt-3 mt-2 border-t border-[rgb(var(--border))]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MessageSquare size={14} className="text-[rgb(var(--muted-foreground))]" />
                    <p className="text-xs font-medium text-[rgb(var(--muted-foreground))]">
                      Reason:
                    </p>
                  </div>
                  <p className={cn(
                    "text-sm text-[rgb(var(--foreground))] whitespace-pre-wrap p-2.5 rounded-md",
                    "bg-[rgb(var(--muted))]/70 border border-[rgb(var(--border))]"
                  )}>
                    {req.reason}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 mt-2 border-t border-[rgb(var(--border))]">
                <Button
                  variant="destructive_outline"
                  size="sm"
                  onClick={() => handleProcessRequest(req._id, "reject")}
                  disabled={isThisRequestProcessing}
                  isLoading={isThisRequestProcessing}
                >
                  <XCircle size={16} className="mr-1.5" /> Reject
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleProcessRequest(req._id, "approve")}
                  disabled={isThisRequestProcessing}
                  isLoading={isThisRequestProcessing}
                >
                  <CheckCircle size={16} className="mr-1.5" /> Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
