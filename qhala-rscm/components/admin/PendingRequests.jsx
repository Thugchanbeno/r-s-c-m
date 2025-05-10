"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
} from "lucide-react";

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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]); // Key prop on this component in parent will trigger re-mount and thus re-fetch

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
      <div className="flex items-center p-4 text-sm rounded-[var(--radius)] bg-red-50 text-red-700 border border-red-200 shadow-sm">
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
        // Determine if this specific request is the one being processed
        const isThisRequestProcessing = processingRequestId === req._id;

        return (
          <Card key={req._id} className="overflow-hidden">
            <CardHeader className="bg-[rgb(var(--muted))] p-4 border-b border-[rgb(var(--border))]">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <CardTitle className="text-base sm:text-lg text-[rgb(var(--foreground))]">
                  Request for{" "}
                  <span className="font-semibold text-[rgb(var(--primary))]">
                    {req.requestedUserId?.name || "Unknown User"}
                  </span>
                </CardTitle>
                <Badge variant="warning" pill={true} size="sm">
                  {req.status}
                </Badge>
              </div>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                Project: {req.projectId?.name || "Unknown Project"} | Requested
                by: {req.requestedByPmId?.name || "Unknown PM"} on{" "}
                {formatDate(req.createdAt)}
              </p>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="font-medium text-[rgb(var(--muted-foreground))] block">
                    Role:
                  </span>
                  <span className="text-[rgb(var(--foreground))]">
                    {req.requestedRole}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-[rgb(var(--muted-foreground))] block">
                    Allocation:
                  </span>
                  <span className="text-[rgb(var(--foreground))]">
                    {req.requestedPercentage}%
                  </span>
                </div>
                <div>
                  <span className="font-medium text-[rgb(var(--muted-foreground))] block">
                    Requested Dates:
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
              {req.pmNotes && (
                <div className="pt-2 border-t border-[rgb(var(--border))]">
                  <p className="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-0.5">
                    PM Notes:
                  </p>
                  <p className="text-sm text-[rgb(var(--foreground))] whitespace-pre-wrap bg-slate-50 p-2 rounded-md">
                    {req.pmNotes}
                  </p>
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onProcessRequest(req._id, "rejected")}
                  disabled={isThisRequestProcessing} // Disable if this request is being processed
                  isLoading={isThisRequestProcessing} // Show loading if this request is being processed
                  className="text-red-600 border-red-500 hover:bg-red-50"
                >
                  <XCircle size={16} className="mr-1.5" /> Reject
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => onProcessRequest(req._id, "approved")}
                  disabled={isThisRequestProcessing} // Disable if this request is being processed
                  isLoading={isThisRequestProcessing} // Show loading if this request is being processed
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
