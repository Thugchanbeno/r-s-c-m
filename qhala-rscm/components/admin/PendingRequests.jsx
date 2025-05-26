"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/common/Card";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Badge from "@/components/common/Badge";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Briefcase,
  Percent,
  CalendarDays,
  MessageSquare,
  BellRing,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PendingRequestsList = ({ onProcessRequest, processingRequestId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/resourcerequests?status=pending");
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            `Failed to fetch pending requests: ${response.statusText}`
        );
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setRequests(result.data);
      } else {
        throw new Error(
          result.error || "Invalid data format for pending requests."
        );
      }
    } catch (err) {
      console.error("Error fetching pending requests:", err);
      setError(err.message || "Could not load pending requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-[200px]">
        <LoadingSpinner size={24} />
        <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
          Loading pending requests...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center p-4 rounded-lg text-sm shadow-sm",
          "bg-[rgb(var(--destructive))]/15",
          "text-[rgb(var(--destructive))]",
          "border border-[rgb(var(--destructive))]/40"
        )}
      >
        <AlertCircle size={18} className="mr-2 flex-shrink-0" />
        <span>Error: {error}</span>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <p className="text-center text-sm text-[rgb(var(--muted-foreground))] py-8">
        No pending resource requests.
      </p>
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
                  onClick={() => onProcessRequest(req._id, "rejected")}
                  disabled={isThisRequestProcessing}
                  isLoading={
                    isThisRequestProcessing && req.status !== "rejected"
                  }
                >
                  <XCircle size={16} className="mr-1.5" /> Reject
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => onProcessRequest(req._id, "approved")}
                  disabled={isThisRequestProcessing}
                  isLoading={
                    isThisRequestProcessing && req.status !== "approved"
                  }
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
};

export default PendingRequestsList;
