// components/admin/ResourcesView.jsx
"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Search, Users as UsersIcon, BellRing, Wrench } from "lucide-react"; // Wrench for skill search
import Button from "@/components/common/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/common/Card";
import UserList from "@/components/admin/UserList"; // Ensure this path is correct
import LoadingSpinner from "@/components/common/LoadingSpinner";

const ResourcesView = () => {
  const { data: session, status } = useSession({ required: true });
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState(""); // For general text search
  const [skillSearchTerm, setSkillSearchTerm] = useState(""); // For skill search

  const userRole = session?.user?.role;
  const canManageRequests =
    userRole === "admin" || userRole === "hr" || userRole === "pm";

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
    <div className="animate-fade-in p-4 md:p-6 bg-[rgb(var(--muted))] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header and Search/Tabs */}
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
            {canManageRequests && (
              <Button
                variant={activeTab === "requests" ? "primary" : "outline"}
                onClick={() => setActiveTab("requests")}
                size="sm"
                className="flex-1 md:flex-none"
              >
                <BellRing size={16} className="mr-2" /> Requests
              </Button>
            )}
            {/* Search Inputs - Show only for Users tab */}
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

        {/* Tab Content */}
        <div>
          {activeTab === "users" && (
            <Card>
              <CardHeader>
                <CardTitle>User Directory</CardTitle>
              </CardHeader>
              <CardContent>
                <UserList
                  searchTerm={searchTerm}
                  skillSearchTerm={skillSearchTerm} // Pass skill search term
                  // Add onEditUser and onDeleteUser props if you implement modals for these actions from ResourcesView
                  // onEditUser={(userId) => console.log("Edit user:", userId)}
                  // onDeleteUser={(userId) => console.log("Delete user:", userId)}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === "requests" && canManageRequests && (
            <Card>
              <CardHeader>
                <CardTitle>Resource Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-[rgb(var(--muted-foreground))]">
                  <BellRing size={32} className="mx-auto mb-2" />
                  Resource request functionality is not yet implemented.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesView;
