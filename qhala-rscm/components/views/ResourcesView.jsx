"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Search, Users as UsersIcon, BellRing, Wrench } from "lucide-react";
import Button from "@/components/common/Button";
import PendingRequests from "@/components/admin/PendingRequests";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/common/Card";
import UserList from "@/components/admin/UserList";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

const ResourcesView = () => {
  const { data: session, status } = useSession({ required: true });
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [skillSearchTerm, setSkillSearchTerm] = useState("");
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [requestListKey, setRequestListKey] = useState(0);

  const userRole = session?.user?.role;
  const canManageRequests =
    userRole === "admin" || userRole === "hr" || userRole === "pm";

  const handleProcessRequest = async (
    requestId,
    newStatus,
    approverNotes = ""
  ) => {
    setProcessingRequestId(requestId);
    try {
      const response = await fetch(`/api/resourcerequests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, approverNotes }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Failed to ${newStatus} request.`);
      }
      toast.success(`Request successfully ${newStatus}!`);
      setRequestListKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error(`Error processing request ${requestId}:`, error);
      toast.error(error.message || `Error processing request ${requestId}.`);
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[rgb(var(--background))] p-10 text-center">
        <LoadingSpinner size={30} />
        <p className="mt-3 text-[rgb(var(--muted-foreground))]">
          Loading resources...
        </p>
      </div>
    );
  }

  const inputBaseClasses =
    "block w-full rounded-[var(--radius)] border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] shadow-sm focus:border-[rgb(var(--primary))] focus:ring-1 focus:ring-[rgb(var(--primary))] sm:text-sm placeholder:text-[rgb(var(--muted-foreground))]";

  return (
    <div className="animate-fade-in p-4 md:p-6 bg-[rgb(var(--background))] min-h-screen rounded-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[rgb(var(--foreground))]">
              Resources
            </h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-1">
              View users and manage resource requests.
            </p>
          </div>
          <div className="flex w-full md:w-auto flex-wrap gap-2 md:gap-4 items-center">
            <Button
              variant={activeTab === "users" ? "primary" : "outline"}
              onClick={() => setActiveTab("users")}
              size="sm"
              className="flex-1 md:flex-none"
            >
              <UsersIcon size={16} className="mr-2" /> Users
            </Button>
            {(session?.user?.role === "admin" ||
              session?.user?.role === "hr") && (
              <Button
                variant={activeTab === "requests" ? "primary" : "outline"}
                onClick={() => setActiveTab("requests")}
                size="sm"
                className="flex-1 md:flex-none"
              >
                <BellRing size={16} className="mr-2" /> Manage Requests
              </Button>
            )}
            {activeTab === "users" && (
              <>
                <div className="relative flex-grow md:flex-grow-0 w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search name, email, dept..."
                    className={`${inputBaseClasses} pl-10 pr-4 py-2 text-sm`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative flex-grow md:flex-grow-0 w-full sm:w-auto">
                  <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by skill..."
                    className={`${inputBaseClasses} pl-10 pr-4 py-2 text-sm`}
                    value={skillSearchTerm}
                    onChange={(e) => setSkillSearchTerm(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          {activeTab === "users" && (
            <Card className="shadow-md">
              <CardHeader
                className={cn(
                  "bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))]"
                )}
              >
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon
                    size={20}
                    className="text-[rgb(var(--accent-foreground))]"
                  />
                  User Directory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserList
                  searchTerm={searchTerm}
                  skillSearchTerm={skillSearchTerm}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === "requests" && canManageRequests && (
            <Card className="shadow-md">
              <CardHeader
                className={cn(
                  "bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))]"
                )}
              >
                <CardTitle className="flex items-center gap-2">
                  <BellRing
                    size={20}
                    className="text-[rgb(var(--accent-foreground))]"
                  />
                  Pending Resource Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PendingRequests
                  onProcessRequest={handleProcessRequest}
                  key={requestListKey}
                  processingRequestId={processingRequestId}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesView;
