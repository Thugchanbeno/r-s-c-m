"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Briefcase,
  Percent,
  CalendarDays,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ResourceRequestsTab({ user }) {
  const { data: session } = useSession();
  const [processingRequestId, setProcessingRequestId] = useState(null);

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
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleProcessRequest = async (requestId, action) => {
    setProcessingRequestId(requestId);
    try {
      await processRequest({
        email: session.user.email,
        requestId,
        action,
        reason: action === "approve" ? "Approved" : "Rejected",
      });
      toast.success(
        `Resource request ${action === "approve" ? "approved" : "rejected"} successfully`
      );
    } catch (error) {
      console.error("Error processing request:", error);
      toast.error(error.message || "Failed to process request");
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-[300px]">
        <LoadingSpinner size={24} />
        <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
          Loading resource requests...
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
                No pending resource requests.
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

        return (
          <Card
            key={req._id}
            className="overflow-hidden shadow-md bg-[rgb(var(--card))] rounded-[var(--radius)]"
          >
            <CardHeader
              className={cn(
                "p-4 border-b border-[rgb(var(--border))]",
                "bg-[rgb(var(--muted))]/50"
              )}
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <CardTitle className="text-base sm:text-lg text-[rgb(var(--foreground))] flex items-center gap-1.5">
                  <User
                    size={18}
                    className="text-[rgb(var(--muted-foreground))]"
                  />
                  Request for{" "}
                  <span className="font-semibold text-[rgb(var(--primary))]">
                    {req.requestedUserId?.name || "Unknown User"}
                  </span>
                </CardTitle>
                <Badge variant="warning" pill={true} size="sm">
                  {req.status}
                </Badge>
              </div>
              <CardDescription className="text-xs text-[rgb(var(--muted-foreground))] mt-1.5 space-x-2">
                <span>
                  Project:{" "}
                  <span className="font-medium text-[rgb(var(--foreground))]">
                    {req.projectId?.name || "Unknown Project"}
                  </span>
                </span>
                <span>|</span>
                <span>
                  By:{" "}
                  <span className="font-medium text-[rgb(var(--foreground))]">
                    {req.requestedByPmId?.name || "Unknown PM"}
                  </span>
                </span>
                <span>on {formatDate(req.createdAt)}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase
                    size={14}
                    className="text-[rgb(var(--muted-foreground))]"
                  />
                  <div>
                    <span className="font-medium text-[rgb(var(--muted-foreground))] text-xs block">
                      Role
                    </span>
                    <span className="text-[rgb(var(--foreground))]">
                      {req.requestedRole}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Percent
                    size={14}
                    className="text-[rgb(var(--muted-foreground))]"
                  />
                  <div>
                    <span className="font-medium text-[rgb(var(--muted-foreground))] text-xs block">
                      Allocation
                    </span>
                    <span className="text-[rgb(var(--foreground))]">
                      {req.requestedPercentage}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={14}
                    className="text-[rgb(var(--muted-foreground))]"
                  />
                  <div>
                    <span className="font-medium text-[rgb(var(--muted-foreground))] text-xs block">
                      Requested Dates
                    </span>
                    <span className="text-[rgb(var(--foreground))]">
                      {req.requestedStartDate
                        ? formatDate(req.requestedStartDate)
                        : "ASAP"}{" "}
                      -{" "}
                      {req.requestedEndDate
                        ? formatDate(req.requestedEndDate)
                        : "Ongoing"}
                    </span>
                  </div>
                </div>
              </div>
              {req.pmNotes && (
                <div className="pt-3 mt-2 border-t border-[rgb(var(--border))]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MessageSquare
                      size={14}
                      className="text-[rgb(var(--muted-foreground))]"
                    />
                    <p className="text-xs font-medium text-[rgb(var(--muted-foreground))]">
                      PM Notes:
                    </p>
                  </div>
                  <p
                    className={cn(
                      "text-sm text-[rgb(var(--foreground))] whitespace-pre-wrap p-2.5 rounded-md",
                      "bg-[rgb(var(--muted))]/70 border border-[rgb(var(--border))]"
                    )}
                  >
                    {req.pmNotes}
                  </p>
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-3 mt-2 border-t border-[rgb(var(--border))]">
                <Button
                  variant="destructive_outline"
                  size="sm"
                  onClick={() => handleProcessRequest(req._id, "rejected")}
                  disabled={isThisRequestProcessing}
                  isLoading={isThisRequestProcessing}
                >
                  <XCircle size={16} className="mr-1.5" /> Reject
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleProcessRequest(req._id, "approved")}
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
