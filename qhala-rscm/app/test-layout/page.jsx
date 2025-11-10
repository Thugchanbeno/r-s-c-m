"use client";
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";
import ResourcesListNew from "@/components/resources/ResourcesListNew";
import AllocationsViewNew from "@/components/resources/AllocationsViewNew";
import AllocationModal from "@/components/resources/AllocationModal";
import UserManagementModal from "@/components/resources/UserManagementModal";
import AdminAnalyticsNew from "@/components/admin/AdminAnalyticsNew";
import { useAllocations } from "@/lib/hooks/useAllocations";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function TestLayoutPage() {
  const { user, isLoading } = useAuth();
  const { submitAllocation, isProcessingAction } = useAllocations();
  const [testView, setTestView] = useState("analytics");
  const [searchTerm, setSearchTerm] = useState("");
  const [skillSearchTerm, setSkillSearchTerm] = useState("");

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);

  // Get users and projects for allocation modal
  const users = useQuery(
    api.users.getAll,
    user?.email ? { email: user.email, limit: 1000 } : "skip"
  );
  const projects = useQuery(
    api.projects.getAll,
    user?.email ? { email: user.email } : "skip"
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <LoadingSpinner width={200} height={4} />
          <p className="text-sm text-rscm-dark-purple">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Test Banner */}
        <div className="bg-rscm-lilac/10 border border-rscm-lilac/30 rounded-lg px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-rscm-dark-purple mb-1 text-sm">
                🧪 Component Test Layout - Admin
              </h3>
              <p className="text-xs text-gray-600">
                Testing{" "}
                {testView === "analytics"
                  ? "AdminAnalyticsNew"
                  : testView === "resources"
                  ? "ResourcesListNew"
                  : "AllocationsViewNew"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTestView("analytics")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  testView === "analytics"
                    ? "bg-rscm-violet text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setTestView("resources")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  testView === "resources"
                    ? "bg-rscm-violet text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Resources List
              </button>
              <button
                onClick={() => setTestView("allocations")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  testView === "allocations"
                    ? "bg-rscm-violet text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Allocations
              </button>
            </div>
          </div>
        </div>

        {/* Search Bars (for resources view only) */}
        {testView === "resources" && (
          <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex gap-3">
            <input
              type="text"
              placeholder="Search by name, email, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
            />
            <input
              type="text"
              placeholder="Search by skill..."
              value={skillSearchTerm}
              onChange={(e) => setSkillSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
            />
          </div>
        )}

        {/* Component Views */}
        {testView === "analytics" ? (
          <AdminAnalyticsNew />
        ) : testView === "resources" ? (
          <ResourcesListNew
            searchTerm={searchTerm}
            skillSearchTerm={skillSearchTerm}
            onManageUser={(usr) => {
              setSelectedUser(usr);
              setShowUserModal(true);
            }}
            onAllocateUser={(usr) => {
              setSelectedAllocation({
                userId: usr._id,
                projectId: "",
                allocationPercentage: "",
                role: "",
                startDate: null,
                endDate: null,
              });
              setShowAllocationModal(true);
            }}
          />
        ) : (
          <AllocationsViewNew
            onEditAllocation={(allocation) => {
              setSelectedAllocation(allocation);
              setShowAllocationModal(true);
            }}
            onCreateAllocation={() => {
              setSelectedAllocation(null);
              setSelectedUser(null);
              setShowAllocationModal(true);
            }}
          />
        )}

        {/* Modals */}
        <UserManagementModal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          users={users || []}
          onSubmit={(data) => {
            toast.success(`User ${data.name} updated!`);
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          isSubmitting={false}
        />

        <AllocationModal
          isOpen={showAllocationModal}
          onClose={() => {
            setShowAllocationModal(false);
            setSelectedAllocation(null);
            setSelectedUser(null);
          }}
          allocation={selectedAllocation}
          users={users || []}
          projects={projects || []}
          onSubmit={async (data) => {
            const result = await submitAllocation(data);
            if (result.success) {
              setShowAllocationModal(false);
              setSelectedAllocation(null);
              setSelectedUser(null);
            }
          }}
          isSubmitting={isProcessingAction}
        />
      </div>
    </AppLayout>
  );
}
